import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppState, Platform, LogBox, View, Text, StyleSheet, Dimensions } from 'react-native';
import 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might cause this to error */
});

// Ignore the SDK 54+ Expo Go push notification warning as we are in development mode
LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications (remote notifications) functionality',
]);

import { SlotBColors, SlotBColorsDark, SlotBColorsLight } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import { usePushNotifications } from '@/hooks/usePushNotifications'; // Import Hook
import { useTheme } from '@/hooks/useTheme';
import { useWebSocket } from '@/hooks/useWebSocket';
import { apiService } from '@/services/api';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { AuthProvider } from '@/src/customer-app/src/context/AuthContext';
import { LocationProvider } from '@/src/customer-app/src/context/LocationContext';

// unstable_settings removed for multi-role support

const customLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: SlotBColors.background,
    card: SlotBColors.background, // Navigate/Tab bar background
    text: SlotBColors.textPrimary,
    border: SlotBColors.border,
    primary: SlotBColors.primary,
  },
};

const RootLayoutNav = () => {
  const segments = useSegments();
  const router = useRouter();
  // Ensure navigation is ready
  const rootNavigationState = useRootNavigationState();
  const authKey = useAppStore((state) => state.authKey);
  const isHydrated = useAppStore((state) => state.isHydrated);
  const maintenance = useAppStore((state) => state.maintenance);
  const setMaintenance = useAppStore((state) => state.setMaintenance);
  const setShowPlans = useAppStore((state) => state.setShowPlans);

  // Initialize Push Notifications
  usePushNotifications();

  // Initialize Real-time Updates
  useWebSocket();

  // Global Maintenance Polling
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const data = await apiService.checkMaintenance();
        if (data && data.ok) {
          setMaintenance({
            isActive: data.maintenance_mode === 1,
            until: data.maintenance_until || '',
            description: data.maintenance_description || 'System maintenance in progress.'
          });
        }
        if (data && data.show_plans_section !== undefined) {
          setShowPlans(data.show_plans_section === 1);
        }
      } catch (e) {
        // Silent fail
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Show splash for 1.5s then hide
    const timer = setTimeout(async () => {
      if (isHydrated) {
        await SplashScreen.hideAsync().catch(() => {
          /* ignore */
        });
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [isHydrated]);

  useEffect(() => {
    const checkNavigation = async () => {
      // 1. Wait for hydration and navigation ready
      // 2. Ensure the root layout is fully mounted
      if (!isHydrated || !rootNavigationState?.key) return;

      // Handling redirection safely
      const firstSegment = segments[0] as string | undefined;
      const inAuthGroup = firstSegment === '(tabs)';
      const onAuthPage = firstSegment === 'login' || firstSegment === 'signup';

      if (!authKey && inAuthGroup) {
        // Use setImmediate or setTimeout to ensure navigation happens after render commit
        setTimeout(() => {
          router.replace('/login');
        }, 0);
      } else if (authKey && onAuthPage) {
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 0);
      }
    };

    checkNavigation();
  }, [authKey, segments, isHydrated, rootNavigationState?.key]);


  useEffect(() => {
    // Run for immersive mode and ensure it stays hidden on resume
    if (Platform.OS === 'android') {
      const setupNav = async () => {
        try {
          // Edge-to-edge is enabled by default in SDK 52+, causing these to warn
          // await NavigationBar.setPositionAsync('absolute');
          // await NavigationBar.setBackgroundColorAsync('#ffffff00');
          // await NavigationBar.setBehaviorAsync('overlay-swipe');
          await NavigationBar.setVisibilityAsync('hidden');
        } catch (e) {
          // Ignore
        }
      };

      setupNav();

      const subscription = AppState.addEventListener('change', (nextAppState) => {
        if (nextAppState === 'active') {
          // Re-apply when coming back to foreground
          setupNav();
        }
      });

      return () => {
        subscription.remove();
      };
    }
  }, []);

  const { colors, isDarkMode } = useTheme();

  if (!isHydrated) {
    return <LoadingScreen />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(customer-tabs)/index" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="preferences" options={{ headerShown: false }} />
        <Stack.Screen name="notification-settings" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="ranking" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="shop-qr" options={{ headerShown: false }} />
        <Stack.Screen name="payment-qr" options={{ headerShown: false }} />
        <Stack.Screen name="privacy" options={{ headerShown: false }} />
        <Stack.Screen name="help" options={{ headerShown: false }} />
        <Stack.Screen name="coming-soon" options={{ headerShown: false }} />
      </Stack>

      {/* Maintenance Overlay */}
      {maintenance.isActive && (
        <Animated.View
          entering={FadeIn}
          style={[StyleSheet.absoluteFill, styles.maintenanceOverlay]}
        >
          <BlurView intensity={Platform.OS === 'ios' ? 90 : 100} tint="dark" style={StyleSheet.absoluteFill}>
            <View style={styles.maintenanceContent}>
              <Animated.View entering={FadeInDown.delay(200).springify()}>
                <View style={styles.iconContainer}>
                  <Ionicons name="construct" size={60} color="#F59E0B" />
                </View>
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(400).springify()}>
                <Text style={styles.maintenanceTitle}>Under Maintenance</Text>
                <Text style={styles.maintenanceDesc}>{maintenance.description}</Text>
              </Animated.View>

              {maintenance.until && (
                <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.timeContainer}>
                  <Text style={styles.timeLabel}>Expected back by:</Text>
                  <Text style={styles.timeValue}>{maintenance.until}</Text>
                </Animated.View>
              )}

              <View style={styles.footer}>
                <Text style={styles.footerText}>Thank you for your patience.</Text>
                <Text style={styles.brandText}>SlotB Partner</Text>
              </View>
            </View>
          </BlurView>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  maintenanceOverlay: {
    zIndex: 99999,
  },
  maintenanceContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  maintenanceTitle: {
    fontSize: 28,
    fontFamily: 'Outfit-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 15,
  },
  maintenanceDesc: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  timeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 5,
  },
  timeValue: {
    fontSize: 18,
    fontFamily: 'Outfit-Bold',
    color: '#F59E0B',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.4)',
    marginBottom: 10,
  },
  brandText: {
    fontSize: 12,
    fontFamily: 'Outfit-Bold',
    color: 'rgba(255, 255, 255, 0.2)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  }
});

export default function RootLayout() {
  const isDarkMode = useAppStore((state) => state.isDarkMode);
  const themeColors = isDarkMode ? SlotBColorsDark : SlotBColorsLight;
  const { expoPushToken, notification } = usePushNotifications();

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: themeColors.background }}>
        <StatusBar
          style={isDarkMode ? 'light' : 'dark'}
          backgroundColor="transparent"
          translucent={true}
        />
        <LocationProvider>
          <AuthProvider>
            <ThemeProvider value={customLightTheme}>
              <RootLayoutNav />
            </ThemeProvider>
          </AuthProvider>
        </LocationProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
