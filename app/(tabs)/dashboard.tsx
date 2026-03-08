import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/useAppStore';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Vibration,
    SafeAreaView
} from 'react-native';
import { Image } from 'expo-image';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
// import { SafeAreaView } from 'react-native-safe-area-context';
import { DownloadReports } from '@/components/dashboard/DownloadReports';
import { LeaderboardCard } from '../../components/dashboard/LeaderboardCard';
import { ServiceManagementCard } from '../../components/dashboard/ServiceManagementCard';
import { LifetimePerformance } from '../../components/dashboard/LifetimePerformance';
import { GrowBusinessSection } from '../../components/dashboard/GrowBusinessSection';
import { ReviewsCard } from '../../components/dashboard/ReviewsCard';
import { ShopLeaderboard } from '../../components/dashboard/ShopLeaderboard';
import { UnifiedBusinessInsights } from '../../components/dashboard/UnifiedBusinessInsights';
import { ShopMediaModal } from '../../components/dashboard/ShopMediaModal';
import { SalonManagementTools } from '../../components/dashboard/SalonManagementTools';
import { ExpenseManager } from '../../components/dashboard/ExpenseManager';



import { useRanking } from '../../components/ranking/useRanking';

export default function DashboardScreen() {
    const router = useRouter();
    const { user, stats, earnings, partners, notifications, notificationsBreakdown, settings, setStats, setEarnings, setPartners, setTokens, setReviews, setNotifications } = useAppStore();
    const { colors } = useTheme();

    // Ranking Logic Hook
    const {
        myRanking,
        period: rankingPeriod,
        setPeriod: setRankingPeriod,
        isEligible: isRankingEligible
    } = useRanking();

    const [refreshing, setRefreshing] = useState(false);
    const [isShopOpen, setShopOpen] = useState(true);
    const [mediaModalVisible, setMediaModalVisible] = useState(false);

    // Vibration Ref
    const prevTokenIds = React.useRef<string[]>([]);


    const refreshDashboard = async () => {
        if (!user?.id) return;

        try {
            const { apiService } = require('@/services/api');
            const data = await apiService.getDashboard();

            if (data) {
                // Safely update with optional chaining
                if (data?.stats) setStats(data.stats);
                if (data?.earnings) setEarnings(data.earnings);
                if (data?.partners) setPartners(data.partners);
                if (data?.tokens) setTokens(data.tokens);
                if (data?.reviews) setReviews(data.reviews);
                if (data?.notificationsCount !== undefined) {
                    setNotifications(data.notificationsCount, data.notificationsBreakdown || { bookings: 0, alerts: 0 });
                }

                // Vibrate on New Booking
                if (data?.tokens && Array.isArray(data.tokens)) {
                    const currentIds = data.tokens.map((t: any) => t.id).filter(Boolean);
                    const hasNew = currentIds.some((id: string) => !prevTokenIds.current.includes(id));
                    if (prevTokenIds.current.length > 0 && hasNew) {
                        // Trigger Haptic Feedback (Success)
                        if (settings?.vibrateOnBooking !== false) {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        }

                        // Trigger Local Notification as fallback
                        if (settings?.notifyTokens !== false) {
                            Notifications.scheduleNotificationAsync({
                                content: {
                                    title: "New Booking! 💇‍♂️",
                                    body: "A new token has been generated for your shop.",
                                    sound: true,
                                },
                                trigger: null,
                            });
                        }
                    }
                    prevTokenIds.current = currentIds;
                }

                // SYNC USER DATA
                if (data?.shop && user) {
                    try {
                        const { authKey, login } = useAppStore.getState();
                        const updatedUser = {
                            ...user,
                            shopName: data.shop.name || user.shopName,
                            upiId: data.shop.upi_id || user.upiId,
                            paymentQr: data.shop.payment_qr || user.paymentQr,
                            qrCode: data.shop.qr_code || user.qrCode,
                            image: data.shop.image || data.shop.profileImage || user.image,
                            avatar: data.shop.image || data.shop.profileImage || user.avatar
                        };
                        if (authKey) login(updatedUser, authKey);
                    } catch (e) {
                        // Keep existing user data
                    }
                }
            }
        } catch (e: any) {
            console.error("Dashboard refresh failed:", e?.message || e);
            // Don't crash - just skip this update
        }
    };

    // Fetch Shop Status and Dashboard Data
    React.useEffect(() => {
        if (user?.id) {
            const { apiService } = require('@/services/api');
            apiService.getShopStatus(user.id).then(setShopOpen);
            refreshDashboard();

            const interval = setInterval(refreshDashboard, 15000); // 15s Real-time
            return () => clearInterval(interval);
        }
    }, [user?.id]);

    // Manual refresh logic
    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await refreshDashboard();
        setRefreshing(false);
    }, [user?.id]);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    {/* Avatar / Shop Logo */}
                    <TouchableOpacity style={styles.avatarContainer} onPress={() => router.push('/profile')}>
                        <Image
                            source={(() => {
                                const img = user?.avatar || user?.image;
                                if (!img) return { uri: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (user?.name || 'Partner') };
                                const uri = img.startsWith('http')
                                    ? img + (img.includes('?') ? '&' : '?') + 't=' + Date.now()
                                    : img;
                                return { uri };
                            })()}
                            style={styles.avatarImage}
                            transition={200}
                            cachePolicy="none"
                        />
                        <View style={styles.onlineBadge} />
                    </TouchableOpacity>

                    <View style={styles.headerContent}>
                        <Text style={[styles.shopName, { color: colors.textPrimary }]}>{user?.shopName || 'My Salon'}</Text>
                        <Text style={[styles.dateText, { color: colors.textTertiary }]}>
                            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
                        </Text>
                    </View>
                </View>



                <View style={styles.headerActions}>

                    <TouchableOpacity onPress={() => router.push('/customer-history')} style={[styles.actionButton, { backgroundColor: colors.surface }]}>
                        <Ionicons name="people-outline" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/notifications')} style={[styles.actionButton, { backgroundColor: colors.surface }]}>
                        <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
                        {(notifications > 0) &&
                            <View style={[styles.badge, { backgroundColor: '#FF3B30', borderColor: colors.background, borderWidth: 2, top: 8, right: 8, width: 12, height: 12, borderRadius: 6 }]} />
                        }
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
            >
                {/* 1. Shop Ranking (Top) */}
                <ShopLeaderboard isOpen={isShopOpen} />

                {/* 2. Lifetime Journey */}
                <LifetimePerformance />
                <UnifiedBusinessInsights stats={stats} earnings={earnings} />

                {/* 3. Expense Tracker (New) */}
                <ExpenseManager />

                {/* 4. Shop Service - Moved Here */}
                <ServiceManagementCard />

                {/* 5. Shop Media and Reels */}
                <TouchableOpacity
                    style={[styles.manageServicesBtn, { backgroundColor: colors.surface, borderColor: colors.border, marginBottom: 16 }]}
                    onPress={() => setMediaModalVisible(true)}
                >
                    <View style={styles.manageServicesIcon}>
                        <Ionicons name="videocam-outline" size={24} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.manageServicesTitle, { color: colors.textPrimary }]}>Shop Media & Reels</Text>
                        <Text style={[styles.manageServicesSubtitle, { color: colors.textTertiary }]}>Upload photos, videos & promos</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                </TouchableOpacity>

                {/* 6. Review and Summary (Combined Reviews + Business Insights) */}
                <ReviewsCard onRefresh={refreshDashboard} />

                {/* 7. Download Report */}
                <DownloadReports stats={stats} />

                {/* 8. Employee Ranking Section */}
                <LeaderboardCard employees={partners} onRefresh={refreshDashboard} />

                {/* 9. Salon Management (Moved Below Employee Ranking) */}
                <SalonManagementTools />

                {/* 10. Shop Growth (Moved to Bottom) */}
                <GrowBusinessSection />

                <ShopMediaModal
                    visible={mediaModalVisible}
                    onClose={() => setMediaModalVisible(false)}
                />

                <Text style={[styles.footerText, { color: colors.textTertiary }]}>
                    Data updated just now
                </Text>
            </ScrollView>

            {/* FAB Removed as requested */}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 29, // Shifted down slightly for better visibility
        paddingBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: -2,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatarImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#E2E8F0',
    },
    onlineBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#22C55E', // Green for online
        borderWidth: 2,
        borderColor: '#FFF',
    },
    headerContent: {
        justifyContent: 'center',
        flex: 1,
    },
    greeting: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 2,
    },
    shopName: {
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: -0.5,
        marginBottom: 2,
    },
    dateText: {
        fontSize: 11,
        fontWeight: '500',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        width: 48, // Increased from 44
        height: 48, // Increased from 44
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badge: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 2,
    },
    scrollContent: {
        paddingTop: 8,
        padding: 20,
        paddingBottom: 100,
    },
    spacer: {
        height: 8,
    },
    footerText: {
        textAlign: 'center',
        fontSize: 10,
        marginTop: 20,
    },
    manageServicesBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginTop: 8, // Reduced from 20
    },
    manageServicesIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    manageServicesTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    manageServicesSubtitle: {
        fontSize: 12,
        marginTop: 2,
    }
});

