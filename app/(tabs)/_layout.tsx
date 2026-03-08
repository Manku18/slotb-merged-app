import { HapticTab } from '@/components/haptic-tab';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surfaceHighlight || colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 0,
          height: (Platform.OS === 'android' ? 62 : 52) + (insets?.bottom || 0), // Increased by ~10% (55->62)
          paddingBottom: (Platform.OS === 'android' ? 4 : 0) + (insets?.bottom || 0),
          paddingTop: 0,
        },
        tabBarItemStyle: {
          paddingTop: 8, // Shift buttons down ~10%
        },
        tabBarButton: HapticTab,
      }}>

      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size || 24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size || 24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="tokens"
        options={{
          title: 'Tokens',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="ticket-outline" size={size || 24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size || 24} color={color} />
          ),
        }}
      />

      {/* Hide non-screen files */}
      <Tabs.Screen
        name="dashboard.constants"
        options={{
          href: null, // This hides it from the tab bar
        }}
      />
    </Tabs>
  );
}