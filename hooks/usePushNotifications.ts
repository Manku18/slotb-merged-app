import { useState, useEffect, useRef } from 'react';
import { Platform, Alert } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { apiService } from '@/services/api';
import { useAppStore } from '@/store/useAppStore';

// Configure notification handler to show alerts, play sound, and update badge
Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
        // Get user preferences from store
        const { settings } = useAppStore.getState();

        // Check if notifications are enabled based on type
        const notificationData = notification.request.content.data;
        const notificationType = notificationData?.type || 'system';

        let shouldShow = true;
        if (notificationType === 'booking' && !settings.notifyTokens) {
            shouldShow = false;
        } else if (notificationType !== 'booking' && !settings.notifyAlerts) {
            shouldShow = false;
        }

        return {
            shouldShowAlert: shouldShow,
            shouldPlaySound: shouldShow && settings.notifyAlerts,
            shouldSetBadge: shouldShow,
            shouldShowBanner: shouldShow,
            shouldShowList: shouldShow,
        };
    },
});

export function usePushNotifications() {
    const [expoPushToken, setExpoPushToken] = useState<string | undefined>(undefined);
    const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
    const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
    const responseListener = useRef<Notifications.Subscription | undefined>(undefined);
    const router = useRouter();
    const { user, setNotifications } = useAppStore();

    useEffect(() => {
        const executionEnvironment = Constants.executionEnvironment;
        if (executionEnvironment === 'storeClient') {
            return; // Bypass for Expo Go
        }

        registerForPushNotificationsAsync()
            .then(async (token) => {
                if (token) {
                    setExpoPushToken(token);
                    console.log("✅ Push Token Registered:", token);

                    // Save token to backend
                    if (user?.id) {
                        try {
                            await apiService.savePushToken(user.id, token);
                            console.log("✅ Push token saved to backend");
                        } catch (error) {
                            console.error("❌ Failed to save push token:", error);
                        }
                    }
                }
            })
            .catch(error => console.error("❌ Failed to register for push notifications:", error));

        // Listen for notifications received while app is in foreground
        notificationListener.current = Notifications.addNotificationReceivedListener((notification: Notifications.Notification) => {
            console.log("📬 Notification received:", notification);
            setNotification(notification);

            // Update badge count
            const { notifications: badgeCount } = useAppStore.getState();
            useAppStore.getState().setNotifications(badgeCount + 1);
        });

        // Listen for user interactions with notifications
        responseListener.current = Notifications.addNotificationResponseReceivedListener((response: Notifications.NotificationResponse) => {
            console.log("👆 Notification tapped:", response);

            const data = response.notification.request.content.data;

            // Handle navigation based on notification type or data
            if (data?.screen) {
                // If notification has a specific screen to navigate to
                router.push(data.screen as any);
            } else if (data?.type === 'booking') {
                // Navigate to bookings screen
                router.push('/(tabs)/bookings');
            } else {
                // Default: navigate to notifications screen
                router.push('/notifications');
            }
        });

        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, [user?.id]);

    return {
        expoPushToken,
        notification,
    };
}

async function registerForPushNotificationsAsync() {
    let token;

    // Configure Android notification channel
    if (Platform.OS === 'android') {
        try {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'Default Notifications',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#10B981',
                sound: 'default',
                enableVibrate: true,
                showBadge: true,
            });

            // Create separate channels for different notification types
            await Notifications.setNotificationChannelAsync('bookings', {
                name: 'Booking Notifications',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 300, 200, 300],
                lightColor: '#3B82F6',
                sound: 'default',
                enableVibrate: true,
                showBadge: true,
            });

            await Notifications.setNotificationChannelAsync('alerts', {
                name: 'Important Alerts',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 500],
                lightColor: '#EF4444',
                sound: 'default',
                enableVibrate: true,
                showBadge: true,
            });

            console.log("✅ Android notification channels created");
        } catch (error) {
            console.error("❌ Error creating notification channels:", error);
        }
    }

    if (Device.isDevice) {
        try {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.warn('⚠️ Push notification permission denied');
                Alert.alert(
                    'Enable Notifications',
                    'To receive important updates about bookings and payments, please enable notifications in your device settings.',
                    [{ text: 'OK' }]
                );
                return undefined;
            }

            // Get Expo push token
            try {
                const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
                if (projectId) {
                    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
                } else {
                    token = (await Notifications.getExpoPushTokenAsync()).data;
                }
                console.log("✅ Push token generated:", token);
            } catch (e) {
                console.error("❌ Error fetching push token:", e);
                token = (await Notifications.getExpoPushTokenAsync()).data;
            }
        } catch (error) {
            console.error("❌ Error in permission flow:", error);
        }
    } else {
        console.log('ℹ️ Must use physical device for Push Notifications');
    }

    return token;
}
