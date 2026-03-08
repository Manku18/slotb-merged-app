import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Animated, Dimensions, Easing, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TimeRange } from '../../app/(tabs)/dashboard.constants';
import { DashboardCard } from './DashboardCard';
import { TimeTab } from './TimeTab';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface UnifiedBusinessInsightsProps {
    stats: any;
    earnings: any;
}

type MetricType = 'bookings' | 'earnings' | 'missed';

export function UnifiedBusinessInsights({ stats, earnings }: UnifiedBusinessInsightsProps) {
    const { colors } = useTheme();
    const [timeRange, setTimeRange] = useState<TimeRange>(TimeRange.Today);
    const [modalVisible, setModalVisible] = useState(false);
    const [activeMetric, setActiveMetric] = useState<MetricType>('bookings');
    const [slideAnim] = useState(new Animated.Value(SCREEN_HEIGHT));

    // Dynamic Data Calculation from Real Stats
    const getBookings = () => {
        if (timeRange === TimeRange.Today) return stats?.today?.bookings ?? stats?.realServedBookings ?? 0;
        if (timeRange === TimeRange.Weekly) return stats?.weekly?.bookings ?? 0;
        if (timeRange === TimeRange.Monthly) return stats?.monthly?.bookings ?? 0;
        return 0;
    };
    const getEarnings = () => {
        if (timeRange === TimeRange.Today) return stats?.today?.earnings ?? stats?.realTotalEarnings ?? 0;
        if (timeRange === TimeRange.Weekly) return stats?.weekly?.earnings ?? 0;
        if (timeRange === TimeRange.Monthly) return stats?.monthly?.earnings ?? 0;
        return 0;
    };
    const getMissed = () => {
        if (timeRange === TimeRange.Today) return stats?.today?.missed ?? stats?.realMissedBookings ?? 0;
        if (timeRange === TimeRange.Weekly) return stats?.weekly?.missed ?? 0;
        if (timeRange === TimeRange.Monthly) return stats?.monthly?.missed ?? 0;
        return 0;
    };

    const data = {
        bookings: getBookings(),
        earnings: getEarnings(),
        missed: getMissed(),
    };

    const openDetails = (metric: MetricType) => {
        setActiveMetric(metric);
        setModalVisible(true);
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.out(Easing.poly(4)),
        }).start();
    };

    const closeModal = () => {
        Animated.timing(slideAnim, {
            toValue: SCREEN_HEIGHT,
            duration: 250,
            useNativeDriver: true,
        }).start(() => setModalVisible(false));
    };

    // Extract Real Data with proper validation
    const history = stats?.history || { days: [], bookings: [], earnings: [], missed: [] };
    const breakdown = stats?.breakdown || { online: 0, offline: 0, cancelled: 0, noshow: 0, topServices: [] };

    // Construct History Array for Charts with safety checks
    const historyData = Array.isArray(history.days) && history.days.length > 0
        ? history.days.map((day: string, i: number) => ({
            day,
            bookings: history.bookings?.[i] || 0,
            earnings: history.earnings?.[i] || 0,
            missed: history.missed?.[i] || 0
        }))
        : [];

    const renderHistoryGraph = (metric: MetricType) => {
        // Safety check for empty data
        if (!historyData || historyData.length === 0) {
            return (
                <View>
                    <Text style={[styles.historyTitle, { color: colors.textPrimary }]}>Past 7 Days Trend</Text>
                    <Text style={[styles.historyLabel, { color: colors.textSecondary, textAlign: 'center', paddingVertical: 20 }]}>
                        No historical data available yet
                    </Text>
                </View>
            );
        }

        // Find max for scaling - with fallback
        const values = historyData.map((d: any) => d[metric] || 0).filter((v: number) => typeof v === 'number');
        const maxVal = values.length > 0 ? Math.max(...values, 1) : 1;

        return (
            <View>
                <Text style={[styles.historyTitle, { color: colors.textPrimary }]}>Past 7 Days Trend</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 10 }}>
                    {historyData.map((item: any, index: number) => (
                        <View key={index} style={styles.historyCard}>
                            <Text style={[styles.historyLabel, { color: colors.textSecondary }]}>{item.day}</Text>
                            <View style={{
                                height: Math.max(((item[metric] || 0) / maxVal) * 50, 4), // Scale height, min 4
                                width: 6,
                                backgroundColor: metric === 'missed' ? '#EF4444' : (metric === 'earnings' ? '#10B981' : colors.primary),
                                borderRadius: 3,
                                marginVertical: 4
                            }} />
                            <Text style={[styles.historyValue, { color: colors.textPrimary }]}>
                                {metric === 'earnings' ? ((item[metric] || 0) >= 1000 ? ((item[metric] || 0) / 1000).toFixed(1) + 'k' : (item[metric] || 0)) : (item[metric] || 0)}
                            </Text>
                        </View>
                    ))}
                </ScrollView>
            </View>
        );
    };

    const renderAISuggestions = (category: string) => {
        const suggestions = {
            bookings: [
                "Weekend par ek extra staff rakhein.",
                "Friday offer se 20% growth payein."
            ],
            earnings: [
                "Combo packs se ₹5k extra kamayein.",
                "Facial demand high hai, promote karein."
            ],
            missed: [
                "Lunch time me auto-reply on karein.",
                "Wait time kam karne par dhyan dein."
            ]
        };

        const currentSuggestions = suggestions[category as keyof typeof suggestions] || suggestions.bookings;

        return (
            <View style={styles.aiSection}>
                <View style={styles.aiHeader}>
                    <Ionicons name="sparkles" size={18} color="#7C3AED" />
                    <Text style={styles.aiTitle}>Smart Suggestions</Text>
                </View>
                <View style={styles.suggestionList}>
                    {currentSuggestions.map((suggestion, index) => (
                        <View key={index} style={styles.suggestionItem}>
                            <View style={styles.bulletPoint} />
                            <Text style={styles.aiText}>{suggestion}</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };


    const renderDetailContent = () => {
        switch (activeMetric) {
            case 'bookings':
                const totalBookings = (breakdown.online + breakdown.offline) || 1;
                return (
                    <View>
                        <View style={styles.detailHeader}>
                            <Text style={[styles.detailTitle, { color: colors.textSecondary }]}>Total Bookings</Text>
                            <Text style={[styles.detailValue, { color: colors.primary }]}>{data.bookings}</Text>
                        </View>

                        {renderHistoryGraph('bookings')}

                        {renderAISuggestions('bookings')}

                        <View style={styles.detailSection}>
                            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Source Breakdown</Text>
                            <View style={styles.row}>
                                <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>Online App</Text>
                                <Text style={[styles.rowValue, { color: colors.textPrimary }]}>
                                    {Math.round((breakdown.online / totalBookings) * 100)}% ({breakdown.online})
                                </Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>Walk-in</Text>
                                <Text style={[styles.rowValue, { color: colors.textPrimary }]}>
                                    {Math.round((breakdown.offline / totalBookings) * 100)}% ({breakdown.offline})
                                </Text>
                            </View>
                        </View>
                    </View>
                );
            case 'earnings':
                return (
                    <View>
                        <View style={styles.detailHeader}>
                            <Text style={[styles.detailTitle, { color: colors.textSecondary }]}>Total Earnings</Text>
                            <Text style={[styles.detailValue, { color: '#059669' }]}>₹{data.earnings.toLocaleString()}</Text>
                        </View>

                        {renderHistoryGraph('earnings')}

                        {renderAISuggestions('earnings')}

                        <View style={styles.detailSection}>
                            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Top Revenue Sources</Text>
                            {breakdown.topServices && breakdown.topServices.length > 0 ? (
                                breakdown.topServices.map((svc: any, idx: number) => (
                                    <View key={idx} style={styles.row}>
                                        <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>{svc.name}</Text>
                                        <Text style={[styles.rowValue, { color: colors.textPrimary }]}>₹{svc.value}</Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={{ color: colors.textTertiary, fontStyle: 'italic' }}>No revenue data yet</Text>
                            )}
                        </View>
                    </View>
                );
            case 'missed':
                const totalMissed = (breakdown.cancelled + breakdown.noshow) || 1;
                return (
                    <View>
                        <View style={styles.detailHeader}>
                            <Text style={[styles.detailTitle, { color: colors.textSecondary }]}>Missed Customers</Text>
                            <Text style={[styles.detailValue, { color: '#DC2626' }]}>{data.missed}</Text>
                        </View>

                        {renderHistoryGraph('missed')}

                        {renderAISuggestions('missed')}

                        <View style={styles.detailSection}>
                            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Why they left?</Text>
                            <View style={styles.row}>
                                <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>Cancelled</Text>
                                <Text style={[styles.rowValue, { color: colors.textPrimary }]}>
                                    {Math.round((breakdown.cancelled / totalMissed) * 100)}% ({breakdown.cancelled})
                                </Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>No Show</Text>
                                <Text style={[styles.rowValue, { color: colors.textPrimary }]}>
                                    {Math.round((breakdown.noshow / totalMissed) * 100)}% ({breakdown.noshow})
                                </Text>
                            </View>
                        </View>
                    </View>
                );
        }
    };

    return (
        <DashboardCard
            title="Shop Growth" // Simpler Name
            icon="trending-up"
            variant="default"
        >
            <TimeTab selectedTab={timeRange} onTabChange={setTimeRange} />

            {/* Metrics Grid - Redesigned for more space */}
            <View style={styles.gridContainer}>
                {/* Bookings */}
                <TouchableOpacity
                    style={[styles.metricCard, { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }]}
                    onPress={() => openDetails('bookings')}
                >
                    <View style={styles.iconCircleBlue}>
                        <Ionicons name="calendar-outline" size={20} color="#2563EB" />
                    </View>
                    <View>
                        <Text style={[styles.metricLabel, { color: '#64748B' }]}>Bookings</Text>
                        <Text style={[styles.metricValue, { color: '#0F172A' }]}>{data.bookings}</Text>
                    </View>
                    <View style={styles.tapIndicator}>
                        <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
                    </View>
                </TouchableOpacity>

                {/* Earnings */}
                <TouchableOpacity
                    style={[styles.metricCard, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}
                    onPress={() => openDetails('earnings')}
                >
                    <View style={styles.iconCircleGreen}>
                        <Ionicons name="cash-outline" size={20} color="#059669" />
                    </View>
                    <View>
                        <Text style={[styles.metricLabel, { color: '#065F46' }]}>Revenue</Text>
                        <Text style={[styles.metricValue, { color: '#064E3B' }]}>₹{((data.earnings || 0)).toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={styles.tapIndicator}>
                        <Ionicons name="chevron-forward" size={14} color="#059669" />
                    </View>
                </TouchableOpacity>

                {/* Missed */}
                <TouchableOpacity
                    style={[styles.metricCard, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}
                    onPress={() => openDetails('missed')}
                >
                    <View style={styles.iconCircleRed}>
                        <Ionicons name="alert-circle-outline" size={20} color="#DC2626" />
                    </View>
                    <View>
                        <Text style={[styles.metricLabel, { color: '#991B1B' }]}>Missed</Text>
                        <Text style={[styles.metricValue, { color: '#7F1D1D' }]}>{data.missed}</Text>
                    </View>
                    <View style={styles.tapIndicator}>
                        <Ionicons name="chevron-forward" size={14} color="#EF4444" />
                    </View>
                </TouchableOpacity>
            </View>

            {/* Modal Slider */}
            <Modal
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <Animated.View style={[
                        styles.modalContent,
                        { backgroundColor: colors.background, transform: [{ translateY: slideAnim }] }
                    ]}>
                        {/* Header with Close */}
                        <View style={styles.modalHeader}>
                            <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
                            <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
                                <Ionicons name="close-circle" size={32} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        {/* Content */}
                        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                            {renderDetailContent()}
                        </ScrollView>
                    </Animated.View>
                </View>
            </Modal>

        </DashboardCard>
    );
}

const styles = StyleSheet.create({
    gridContainer: {
        flexDirection: 'column', // Changed to column for "increased size" and better list view feeling
        gap: 12,
        marginBottom: 8,
    },
    metricCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        gap: 16,
    },
    iconCircleBlue: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center' },
    iconCircleGreen: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center' },
    iconCircleRed: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' },

    metricValue: {
        fontSize: 22,
        fontWeight: '800',
    },
    metricLabel: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    tapIndicator: {
        marginLeft: 'auto',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: '70%', // Increased height
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 24,
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 24,
        position: 'relative',
    },
    handleBar: {
        width: 48,
        height: 6,
        borderRadius: 3,
        opacity: 0.5,
    },
    closeBtn: {
        position: 'absolute',
        right: 0,
        top: -6,
    },
    // Detail Styles
    detailHeader: {
        marginBottom: 24,
        alignItems: 'center', // Center align for impact
    },
    detailTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
        opacity: 0.7,
        textTransform: 'uppercase',
        // color handled in render
    },
    detailValue: {
        fontSize: 48,
        fontWeight: '900',
        letterSpacing: -1,
        // color handled in render
    },
    // History Styles
    historyTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 12,
        // color handled in render or use default text
    },
    historyCard: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: 40,
    },
    historyLabel: {
        fontSize: 10,
        // color handled
    },
    historyValue: {
        fontSize: 10,
        fontWeight: '700',
        // color handled
    },
    monthlyGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    monthlyCard: {
        width: '30%',
        backgroundColor: 'rgba(0,0,0,0.03)', // content neutral
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    monthlyLabel: {
        fontSize: 12,
        opacity: 0.7,
        marginBottom: 4,
    },
    monthlyValue: {
        fontSize: 14,
        fontWeight: '700',
    },
    // AI Section
    aiSection: {
        backgroundColor: 'rgba(124, 58, 237, 0.05)', // Transparent purple
        padding: 16,
        borderRadius: 16,
        marginVertical: 20,
        borderWidth: 1,
        borderColor: 'rgba(124, 58, 237, 0.2)',
    },
    aiHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    aiTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#7C3AED',
    },
    suggestionList: {
        gap: 8,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    bulletPoint: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#7C3AED',
        opacity: 0.6,
    },
    aiText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#7C3AED',
        flex: 1,
    },
    // General Section
    detailSection: {
        marginTop: 10,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 8,
        opacity: 0.7,
        textTransform: 'uppercase',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    rowLabel: {
        fontSize: 15,
        fontWeight: '500',
        opacity: 0.8,
    },
    rowValue: {
        fontSize: 16,
        fontWeight: '700',
    },
});
