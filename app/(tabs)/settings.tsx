import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/useAppStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '../../components/ui/GlassCard';
import { ComingSoonModal } from '../../components/ui/ComingSoonModal';

export default function SettingsScreen() {
  const { user, toggleTheme, logout } = useAppStore();
  const { colors, isDarkMode } = useTheme(); // Use Theme Hook
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '', icon: '', gradient: ['#4F46E5', '#818CF8'] });

  const handlePress = (label: string) => {
    setModalConfig({
      title: label,
      message: 'This feature is currently under development. Stay tuned for updates!',
      icon: 'construct',
      gradient: ['#6366f1', '#8b5cf6']
    });
    setModalVisible(true);
  };


  const handleLogout = () => {
    // Clear user session store
    logout();
    // Navigate back to login
    router.replace('/login');
  };

  const SettingItem = ({ icon, label, isDestructive = false, onPress }: { icon: any, label: string, isDestructive?: boolean, onPress?: () => void }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress || (() => handlePress(label))}>
      <View style={[styles.settingIcon, { backgroundColor: colors.background }, isDestructive && styles.destructiveIcon]}>
        <Ionicons name={icon} size={20} color={isDestructive ? colors.error : colors.primary} />
      </View>
      <Text style={[styles.settingLabel, { color: colors.textPrimary }, isDestructive && { color: colors.error }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Profile Card - Featured Sage Variant */}
        <GlassCard style={styles.profileCard} variant="sage">
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={32} color={colors.primary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.textPrimary }]}>{user?.name || 'Partner'}</Text>
            <Text style={[styles.profileShop, { color: colors.textPrimary }]}>{user?.shopName || 'My Shop'}</Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={() => router.push('/profile')}>
            <Text style={[styles.editButtonText, { color: colors.textPrimary }]}>Edit</Text>
          </TouchableOpacity>
        </GlassCard>

        {/* Appearance */}
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>APPEARANCE</Text>
        <GlassCard style={styles.sectionCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.background }]}>
                <Ionicons name={isDarkMode ? "moon" : "sunny"} size={20} color={colors.primary} />
              </View>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Dark Mode</Text>
            </View>
            <Switch
              trackColor={{ false: '#D1D5DB', true: colors.primary }}
              thumbColor={colors.surface}
              ios_backgroundColor="#D1D5DB"
              onValueChange={toggleTheme} // Connected to Global Toggle
              value={isDarkMode}
            />
          </View>
        </GlassCard>

        {/* Account */}
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>ACCOUNT</Text>
        <GlassCard style={styles.sectionCard}>
          <SettingItem icon="wallet-outline" label="Payments & Payouts" onPress={() => router.push('/payment-qr')} />
          <View style={[styles.divider, { backgroundColor: colors.background }]} />
          <SettingItem icon="notifications-outline" label="Notification Preferences" onPress={() => router.push('/notification-settings')} />
          <View style={[styles.divider, { backgroundColor: colors.background }]} />
          <SettingItem
            icon="shield-checkmark-outline"
            label="Privacy & Security"
            onPress={() => WebBrowser.openBrowserAsync('https://slotb.in/privacy.php')}
          />
        </GlassCard>

        {/* Support */}
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>SUPPORT</Text>
        <GlassCard style={styles.sectionCard}>
          <SettingItem
            icon="help-circle-outline"
            label="Help Center"
            onPress={() => WebBrowser.openBrowserAsync('https://slotb.in/help.php')}
          />
          <View style={[styles.divider, { backgroundColor: colors.background }]} />
          <SettingItem icon="log-out-outline" label="Log Out" isDestructive onPress={handleLogout} />
        </GlassCard>
      </ScrollView>
      <ComingSoonModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalConfig.title}
        message={modalConfig.message}
        icon={modalConfig.icon as any}
        gradient={modalConfig.gradient as any}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    padding: 20,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
  },
  profileShop: {
    fontSize: 14,
    opacity: 0.8,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 1,
  },
  sectionCard: {
    padding: 0,
    marginBottom: 24,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Ensure space between text and switch
    padding: 16,
    width: '100%',
  },
  settingLeft: {
    flex: 1, // Added to fill available space
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  destructiveIcon: {
    // backgroundColor: '#FEF2F2', // Handled dynamically if needed, or kept static if error color is constant
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  divider: {
    height: 1,
    marginLeft: 60,
  },
});
