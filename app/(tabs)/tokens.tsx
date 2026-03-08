import { TokenAddModal } from '@/components/tokens/TokenAddModal';
import { TokenCard } from '@/components/tokens/TokenCard';
import { TokenHeader } from '@/components/tokens/TokenHeader';
import { TokenHistoryModal } from '@/components/tokens/TokenHistoryModal';
import { TOKEN_CONFIG } from '@/components/tokens/token.constants';
import { Token, TokenFilter, TokenStats } from '@/components/tokens/token.types';
import { generateMockTokens, shouldSuggestAction, sortTokens } from '@/components/tokens/token.utils';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/useAppStore';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  ToastAndroid,
  UIManager,
  LayoutAnimation
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function TokensScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const { tokens, tokenFilter, setTokens, setTokenFilter, user, setNotifications } = useAppStore();

  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [dateFilter, setDateFilter] = useState<'today' | 'tomorrow'>('today');

  // Initialize
  // Initialize - Removed Mock Data Injection
  // useEffect(() => {
  //   if (tokens.length < 3) {
  //     const mocks = generateMockTokens();
  //     setTokens(mocks);
  //   }
  // }, []);

  // Filter & Sort
  const filteredList = useMemo(() => {
    let list = tokens;
    if (tokenFilter !== 'all') {
      list = list.filter(t => t.status === tokenFilter);
    }
    return sortTokens(list);
  }, [tokens, tokenFilter]);

  // Stats
  const stats: TokenStats = useMemo(() => {
    return {
      completed: tokens.filter(t => t.status === 'completed').length,
      waiting: tokens.filter(t => t.status === 'waiting').length,
      cancelled: tokens.filter(t => t.status === 'cancelled' || t.status === 'no-show').length,
    };
  }, [tokens]);

  const handleUpdateStatus = async (id: string, status: Token['status']) => {
    // 0. Animate Change
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    // 1. Optimistic Update
    const updated = tokens.map(t => {
      if (t.id === id) {
        // Re-queue Logic: If moving to waiting, reset createdAt to NOW so it goes to bottom
        return {
          ...t,
          status,
          startedAt: status === 'serving' ? Date.now() : t.startedAt,
          createdAt: status === 'waiting' ? Date.now() : t.createdAt, // Always reset queue position on manual 'Wait' action
        };
      }
      return t;
    });
    setTokens(updated);

    // 2. Server Sync
    if (user?.id) {
      try {
        const { apiService } = require('@/services/api');
        const success = await apiService.updateBookingStatus(id, status, user.id);
        if (!success) throw new Error('Server returned failure');
      } catch (e) {
        console.error("Status Sync Failed", e);
        if (Platform.OS === 'android') {
          ToastAndroid.show("Failed to update status on server", ToastAndroid.SHORT);
        }
      }
    }
  };

  const handleOpenHistory = (token: Token) => {
    setSelectedToken(token);
    setHistoryModalVisible(true);
  };

  const fetchLatestData = async (dateOverride?: 'today' | 'tomorrow') => {
    if (!user?.id) return;
    try {
      const { apiService } = require('@/services/api');
      const targetDate = dateOverride || dateFilter;
      const data = await apiService.getDashboard(targetDate); // This fetches fresh tokens
      if (data.tokens) setTokens(sortTokens(data.tokens));
    } catch (e) { console.log(e); }
  };

  const handleAddToken = async (data: any) => {
    if (!user?.id) {
      if (Platform.OS === 'android') ToastAndroid.show("Error: Shop ID missing", ToastAndroid.SHORT);
      return;
    }
    try {
      const { apiService } = require('@/services/api');
      const res = await apiService.addToken({
        name: data.name,
        mobile: data.mobile,
        service: data.service,
        serviceId: data.serviceId,
        price: data.price
      }, user.id);

      if (res.ok) {
        if (Platform.OS === 'android') ToastAndroid.show(`Token #${res.token} Added!`, ToastAndroid.SHORT);
        setAddModalVisible(false);
        // Refresh list
        fetchLatestData();
      } else {
        if (Platform.OS === 'android') ToastAndroid.show(res.error || "Failed to add token", ToastAndroid.SHORT);
      }
    } catch (e) {
      if (Platform.OS === 'android') ToastAndroid.show("Network Error", ToastAndroid.SHORT);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchLatestData(dateFilter);
    }, [user?.id, dateFilter])
  );

  // Auto-Intelligence: Smart Reminders
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const waitingTokens = tokens.filter(t => t.status === 'waiting');
      const tokensToRemind: Token[] = [];
      const servingTokens = tokens.filter(t => t.status === 'serving');

      // 1. Check Waiting Tokens (Batching Logic)
      waitingTokens.forEach(t => {
        const diffMinutes = (now - t.createdAt) / (1000 * 60);
        // Logic: > 75 Mins AND Count < 4 AND (Never reminded OR > 15 mins since last)
        const isOverTime = diffMinutes >= TOKEN_CONFIG.WAITING_IDLE_THRESHOLD_MIN;
        const belowLimit = (t.reminderCount || 0) < TOKEN_CONFIG.REMINDER_LIMIT;

        const lastReminded = t.lastReminderAt || 0;
        const timeSinceLast = (now - lastReminded) / (1000 * 60); // minutes
        const isIntervalPassed = timeSinceLast >= TOKEN_CONFIG.REMINDER_INTERVAL_MIN;

        if (isOverTime && belowLimit && isIntervalPassed) {
          tokensToRemind.push(t);
        }
      });

      // Handle Waiting Notifications
      if (tokensToRemind.length > 0) {
        let msg = '';
        if (tokensToRemind.length === 1) {
          // Individual: Call Customer Name (Token #)
          const t = tokensToRemind[0];
          msg = `Call ${t.customerName} (#${t.tokenNumber})?`;
        } else {
          // Batch: List of customers
          const names = tokensToRemind.map(t => t.customerName).join(', ');
          msg = `Call waiting customers: ${names}`;
        }

        if (Platform.OS === 'android') {
          ToastAndroid.showWithGravity(msg, ToastAndroid.LONG, ToastAndroid.BOTTOM);
        }

        // UPDATE STATE: Increment counts to prevent spam
        const updatedTokens = tokens.map(t => {
          if (tokensToRemind.find(r => r.id === t.id)) {
            return {
              ...t,
              reminderCount: (t.reminderCount || 0) + 1,
              lastReminderAt: now,
            };
          }
          return t;
        });
        setTokens(updatedTokens);
      }

      // 2. Check Serving Tokens (Standard Logic - Done Suggestion)
      // Use a separate array to track updates to avoid modifying state inside the loop directly
      const servingTokensToUpdate: string[] = [];

      for (const token of servingTokens) {
        const suggestion = shouldSuggestAction(token);

        if (suggestion === 'done') {
          // Check if we recently suggested this
          const lastSuggested = token.lastDoneSuggestionAt || 0;
          const timeSinceLast = (now - lastSuggested) / (1000 * 60);

          // Only suggest if never suggested OR > 15 mins passed
          if (timeSinceLast >= TOKEN_CONFIG.REMINDER_INTERVAL_MIN) {
            const msg = `Mark ${token.customerName} (#${token.tokenNumber}) as Done?`;
            if (Platform.OS === 'android') {
              ToastAndroid.showWithGravity(msg, ToastAndroid.SHORT, ToastAndroid.BOTTOM);
            }
            servingTokensToUpdate.push(token.id);
            break; // Only show one done suggestion at a time
          }
        }
      }

      // Update state for Serving Tokens if we showed a suggestion
      if (servingTokensToUpdate.length > 0) {
        const updatedServing = tokens.map(t => {
          if (servingTokensToUpdate.includes(t.id)) {
            return { ...t, lastDoneSuggestionAt: now };
          }
          return t;
        });
        setTokens(updatedServing);
      }

    }, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [tokens]);

  // Auto-Refresh (Polling & Notifications)
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!user?.id) return;

      // 1. Poll Data
      await fetchLatestData();

      // 2. Poll Notifications
      try {
        const { apiService } = require('@/services/api');
        const notifs = await apiService.getNotifications(user.id);
        const unread = notifs.filter((n: any) => n.is_read == 0).length;
        setNotifications(unread);
      } catch (e) { }

    }, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [user?.id]);

  // ... (Keep existing Smart Reminder effect separately? The existing one depends on [tokens] so it's reactive.)
  // We already have a `useEffect` for Smart Reminders at line 140 (approx). 
  // I will just add a NEW useEffect for Data Polling.

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLatestData(dateFilter);
    setRefreshing(false);
  }, [user?.id, dateFilter]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>

      <TokenHeader
        stats={stats}
        filter={tokenFilter as TokenFilter}
        onFilterChange={(f) => setTokenFilter(f as any)}
        onAddToken={() => setAddModalVisible(true)}
        onNotificationPress={() => {
          router.push('/notifications');
        }}
        dateFilter={dateFilter}
        onDateFilterChange={(d) => {
          setDateFilter(d);
          // Clear list momentarily to show loading or clear old state
          setTokens([]);
          fetchLatestData(d);
        }}
        notificationCount={useAppStore(state => state.notifications)}
      />

      <FlatList
        data={filteredList}
        // KEY FIX: Include status in key to force remount on status change.
        // This prevents Swipeable from getting stuck in 'open' state (blank content) when item reorders/changes type.
        keyExtractor={(item) => `${item.id}-${item.status}`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />
        }
        renderItem={({ item }) => (
          <TokenCard
            token={item}
            onUpdateStatus={handleUpdateStatus}
            onPressCard={handleOpenHistory}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <TokenHistoryModal
        visible={historyModalVisible}
        token={selectedToken}
        onClose={() => setHistoryModalVisible(false)}
      />

      <TokenAddModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onAdd={handleAddToken}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
  }
});
