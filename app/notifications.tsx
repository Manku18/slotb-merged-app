import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import React, { useState, useRef } from 'react';
import {
    Alert,
    FlatList,
    Platform,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Linking,
    Vibration
} from 'react-native';

// --- Types ---
type NotificationType = 'booking' | 'system' | 'alert' | 'payment' | 'announcement';

interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    time: string;
    read: boolean;
    link?: string;
    src?: 'system' | 'admin';
}

// --- Dummy Data ---
const DUMMY_NOTIFICATIONS: Notification[] = [
    // Today
    {
        id: '1',
        type: 'booking',
        title: 'New Booking Request',
        message: 'Amit Sharma wants to book a "Haircut" for 5:00 PM today.',
        time: 'Just now',
        read: false,
    },
    {
        id: '2',
        type: 'payment',
        title: 'Payment Received',
        message: 'You received ₹450 from Vikram K via UPI.',
        time: '2 mins ago',
        read: false,
    },
    {
        id: '3',
        type: 'alert',
        title: 'Token Missed',
        message: 'Token #12 (Rohan) was marked as missed.',
        time: '1 hour ago',
        read: true,
    },
    // Yesterday
    {
        id: '4',
        type: 'system',
        title: 'Weekly Performance',
        message: 'Your shop had 45 bookings this week! Check your dashboard.',
        time: 'Yesterday',
        read: true,
    },
    {
        id: '5',
        type: 'booking',
        title: 'Booking Cancelled',
        message: 'Suresh cancelled his appointment for 10:00 AM.',
        time: 'Yesterday',
        read: true,
    },
];

// ... imports
import { apiService } from '@/services/api';
import { useAppStore } from '@/store/useAppStore';

// ...

export default function NotificationsScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { user, notifications: badgeCount, setNotifications: setBadgeCount, settings } = useAppStore();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const prevUnreadCount = useRef(0);

    const fetchNotifications = async () => {
        if (!user?.id) return;
        try {
            const data = await apiService.getNotifications(user.id);
            if (!Array.isArray(data)) throw new Error("Invalid format");

            // Transform
            const mapped: Notification[] = data.map((n: any) => ({
                id: n.id.toString(),
                type: n.type || (n.message.toLowerCase().includes('booking') ? 'booking' : 'system'),
                title: n.title || (n.message.toLowerCase().includes('booking') ? 'Booking Update' : 'Shop Alert'),
                message: n.message,
                time: n.created_at,
                read: n.is_read == 1,
                link: n.link,
                src: n.src || 'system'
            }));

            // Filter
            const { settings } = useAppStore.getState();
            const filtered = mapped.filter(n => {
                if (n.type === 'booking') return settings.notifyTokens;
                return settings.notifyAlerts;
            });

            setNotifications(filtered);
            // Update badge count based on unread
            const unread = filtered.filter(n => !n.read).length;

            // Vibrate on new notifications
            if (prevUnreadCount.current > 0 && unread > prevUnreadCount.current && settings?.notifyAlerts) {
                try {
                    Vibration.vibrate(100); // Single short pulse for notifications
                } catch (e) {
                    console.log('Vibration not available:', e);
                }
            }
            prevUnreadCount.current = unread;
            setBadgeCount(unread);
        } catch (e) {
            console.error(e);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 15000);
            return () => clearInterval(interval);
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchNotifications();
        setRefreshing(false);
    };

    // ... actions (handlePressNotification just updates local state for now)
    const handlePressNotification = async (id: string) => {
        const item = notifications.find(n => n.id === id);
        if (!item) return;

        const isUnread = !item.read;
        setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, read: true } : n))
        );

        if (isUnread) {
            setBadgeCount(Math.max(0, badgeCount - 1));
            // Important: Handle admin vs system reads differently if needed
            if (user?.id) {
                if (item.src === 'admin') {
                    // Admin notifications use partner_notification_reads handled by marksAsRead specifically?
                    // For now, let's assume a generic markRead works or add one
                    await apiService.markNotificationRead(user.id, id);
                } else {
                    await apiService.markNotificationRead(user.id, id);
                }
            }
        }

        // Open Link if present
        if (item.link) {
            try {
                const supported = await Linking.canOpenURL(item.link);
                if (supported) {
                    await Linking.openURL(item.link);
                } else {
                    // Handle deep links or routes?
                    if (item.link.startsWith('/')) {
                        router.push(item.link as any);
                    }
                }
            } catch (e) {
                console.error("Link error", e);
            }
        }
    };

    const handleMarkAllRead = async () => {
        if (!user?.id) return;
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setBadgeCount(0);
        try {
            await apiService.markAllNotificationsRead(user.id);
        } catch (e) {
            console.error("Failed to mark all read", e);
        }
    };

    const handleClearAll = () => {
        if (!user?.id) return;
        Alert.alert(
            "Clear All",
            "Are you sure you want to permanently clear all notifications?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Clear",
                    style: "destructive",
                    onPress: async () => {
                        setNotifications([]);
                        setBadgeCount(0);
                        try {
                            await apiService.clearNotifications(user.id);
                        } catch (e) {
                            console.error("Failed to clear notifications", e);
                        }
                    }
                }
            ]
        );
    };

    const handleDeleteNotification = async (id: string) => {
        if (!user?.id) return;
        const isUnread = notifications.find(n => n.id === id)?.read === false;

        setNotifications(prev => prev.filter(n => n.id !== id));
        if (isUnread) {
            setBadgeCount(Math.max(0, badgeCount - 1));
        }

        try {
            await apiService.deleteNotification(user.id, id);
        } catch (e) {
            console.error("Failed to delete notification", e);
        }
    };

    // --- Render Helpers ---

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case 'booking': return 'calendar';
            case 'payment': return 'wallet';
            case 'announcement': return 'megaphone';
            case 'alert': return 'alert-circle';
            case 'system': return 'information-circle';
            default: return 'notifications';
        }
    };

    const getColor = (type: NotificationType) => {
        switch (type) {
            case 'booking': return '#3B82F6'; // Blue
            case 'payment': return '#10B981'; // Green
            case 'announcement': return '#6366F1'; // Indigo
            case 'alert': return '#EF4444'; // Red
            case 'system': return '#8B5CF6'; // Purple
            default: return colors.textSecondary;
        }
    };

    const renderItem = ({ item }: { item: Notification }) => (
        <TouchableOpacity
            style={[
                styles.card,
                { backgroundColor: item.read ? colors.surface : colors.background },
                !item.read && { borderColor: colors.primary, borderWidth: 1 } // Highlight unread
            ]}
            onPress={() => handlePressNotification(item.id)}
            onLongPress={() => {
                Alert.alert(
                    "Delete Notification",
                    "Do you want to delete this notification?",
                    [
                        { text: "Cancel", style: "cancel" },
                        { text: "Delete", style: "destructive", onPress: () => handleDeleteNotification(item.id) }
                    ]
                );
            }}
            activeOpacity={0.7}
        >
            {/* Icon Column */}
            <View style={[styles.iconBox, { backgroundColor: `${getColor(item.type)}15` }]}>
                <Ionicons name={getIcon(item.type)} size={22} color={getColor(item.type)} />
            </View>

            {/* Content Column */}
            <View style={styles.content}>
                <View style={styles.row}>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>
                        {item.title}
                        {item.src === 'admin' && <Text style={{ fontSize: 9, color: colors.primary }}> (Admin)</Text>}
                    </Text>
                    <Text style={[styles.time, { color: colors.textTertiary }]}>{item.time}</Text>
                </View>
                <Text style={[styles.message, { color: colors.textSecondary }]} numberOfLines={2}>
                    {item.message}
                </Text>
                {item.link && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <Ionicons name="link" size={12} color={colors.primary} />
                        <Text style={{ fontSize: 10, color: colors.primary, marginLeft: 4 }}>{item.link}</Text>
                    </View>
                )}
            </View>

            {/* Unread Indicator */}
            {!item.read && <View style={[styles.dot, { backgroundColor: colors.primary }]} />}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle={colors.background === '#000' ? 'light-content' : 'dark-content'} />
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Notifications</Text>

                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={() => router.push('/notification-settings')} style={{ marginRight: 16 }}>
                        <Ionicons name="settings-outline" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleMarkAllRead}>
                        <Ionicons name="checkmark-done-outline" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleClearAll} style={{ marginLeft: 16 }}>
                        <Ionicons name="trash-outline" size={24} color={colors.textTertiary} />
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="notifications-off-outline" size={64} color={colors.textTertiary} />
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No notifications</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'ios' ? 20 : 40,
        height: 110,
    },
    headerTitle: {
        fontSize: 24, // High-impact title
        fontWeight: '900', // Maximum bold
        letterSpacing: -0.5,
    },
    headerActions: {
        flexDirection: 'row',
    },
    iconBtn: {
        padding: 4,
    },
    listContent: {
        padding: 16,
        gap: 12,
    },
    card: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: 'transparent',
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    content: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        flex: 1,
        marginRight: 8,
    },
    time: {
        fontSize: 11,
        marginTop: 2,
    },
    message: {
        fontSize: 13,
        lineHeight: 18,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        position: 'absolute',
        top: 16,
        right: 16,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
        opacity: 0.5,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: '600',
    }
});
