import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Animated, Dimensions, Easing, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DASHBOARD_TEXT } from '../../app/(tabs)/dashboard.constants';
import { DashboardCard } from './DashboardCard';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type MetricType = 'served' | 'missed' | 'earnings';

import { useAppStore } from '@/store/useAppStore';

export function LifetimePerformance() {
    const { colors } = useTheme();
    const [modalVisible, setModalVisible] = useState(false);
    const [activeMetric, setActiveMetric] = useState<MetricType>('earnings');
    const { stats } = useAppStore();

    // Slide Animation (Basic)
    const [slideAnim] = useState(new Animated.Value(SCREEN_HEIGHT));

    const openModal = (type: MetricType) => {
        setActiveMetric(type);
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

    // Real Data from store
    const lifetimeData = {
        earnings: stats?.lifetime?.earnings ?? stats?.realTotalEarnings ?? 0,
        customers: stats?.lifetime?.served ?? stats?.realServedBookings ?? 0,
        missed: stats?.lifetime?.missed ?? stats?.realMissedBookings ?? 0,
        since: 'Lifetime'
    };

    const renderMetricContent = () => {
        const s = stats;
        switch (activeMetric) {
            case 'served':
                return (
                    <View style={styles.detailsList}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Served Today</Text>
                            <Text style={styles.detailValue}>{s?.today?.served ?? 0}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Served This Week</Text>
                            <Text style={styles.detailValue}>{s?.weekly?.served ?? 0}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Served This Month</Text>
                            <Text style={styles.detailValue}>{s?.monthly?.served ?? 0}</Text>
                        </View>
                    </View>
                );
            case 'missed':
                return (
                    <View style={styles.detailsList}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Missed Today</Text>
                            <Text style={styles.detailValue}>{s?.today?.missed ?? 0}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Missed This Week</Text>
                            <Text style={styles.detailValue}>{s?.weekly?.missed ?? 0}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Missed This Month</Text>
                            <Text style={styles.detailValue}>{s?.monthly?.missed ?? 0}</Text>
                        </View>
                    </View>
                );
            case 'earnings':
            default:
                return (
                    <View style={styles.detailsList}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Earned Today</Text>
                            <Text style={styles.detailValue}>₹{(s?.today?.earnings ?? 0).toLocaleString()}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Earned This Week</Text>
                            <Text style={styles.detailValue}>₹{(s?.weekly?.earnings ?? 0).toLocaleString()}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Earned This Month</Text>
                            <Text style={styles.detailValue}>₹{(s?.monthly?.earnings ?? 0).toLocaleString()}</Text>
                        </View>
                    </View>
                );
        }
    };

    return (
        <>
            <DashboardCard
                title={DASHBOARD_TEXT.lifetime.title}
                icon="ribbon"
                variant="default" // Clean white background for main card
            >
                <View style={styles.mainGrid}>
                    {/* 1. Served (Blue) */}
                    <TouchableOpacity
                        style={[styles.statBox, styles.boxBlue]}
                        activeOpacity={0.7}
                        onPress={() => openModal('served')}
                    >
                        <Ionicons name="people" size={20} color="#2563EB" />
                        <Text style={[styles.boxValue, { color: '#2563EB' }]}>{lifetimeData.customers}</Text>
                        <Text style={[styles.boxLabel, { color: '#1E40AF' }]}>Served</Text>
                        {/* Tap Indicator */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, opacity: 0.6 }}>
                            <Text style={{ fontSize: 9, fontWeight: '700', color: '#1E40AF', marginRight: 2 }}>INFO</Text>
                            <Ionicons name="chevron-forward" size={10} color="#1E40AF" />
                        </View>
                    </TouchableOpacity>

                    {/* 2. Missed (Red) */}
                    <TouchableOpacity
                        style={[styles.statBox, styles.boxRed]}
                        activeOpacity={0.7}
                        onPress={() => openModal('missed')}
                    >
                        <Ionicons name="alert-circle" size={20} color="#B91C1C" />
                        <Text style={[styles.boxValue, { color: '#B91C1C' }]}>{lifetimeData.missed}</Text>
                        <Text style={[styles.boxLabel, { color: '#991B1B' }]}>Missed</Text>
                        {/* Tap Indicator */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, opacity: 0.6 }}>
                            <Text style={{ fontSize: 9, fontWeight: '700', color: '#991B1B', marginRight: 2 }}>INFO</Text>
                            <Ionicons name="chevron-forward" size={10} color="#991B1B" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* 3. Earnings (Green - Full Width) */}
                <TouchableOpacity
                    style={[styles.earningsBox, styles.boxGreen]}
                    activeOpacity={0.8}
                    onPress={() => openModal('earnings')}
                >
                    <View>
                        <Text style={[styles.earningsLabel, { color: '#064E3B' }]}>{DASHBOARD_TEXT.lifetime.earnings}</Text>
                        <Text style={[styles.earningsValue, { color: '#059669' }]}>₹{(lifetimeData.earnings || 0).toLocaleString()}</Text>
                    </View>
                    <View style={styles.tapIndicator}>
                        <Text style={{ fontSize: 10, color: '#064E3B', fontWeight: '600' }}>TAP FOR INFO</Text>
                        <Ionicons name="chevron-forward" size={12} color="#064E3B" />
                    </View>
                </TouchableOpacity>



            </DashboardCard>

            <Modal
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
                style={{ margin: 0 }}
            >
                <View style={styles.modalOverlay}>
                    {/* Animated Sheet */}
                    <Animated.View style={[
                        styles.modalContent,
                        {
                            backgroundColor: colors.background,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}>
                        {/* Premium Header Container */}
                        <View style={styles.premiumHeader}>
                            <View style={styles.handleBar} />

                            <View style={styles.headerTitleRow}>
                                <View style={[styles.iconContainer, {
                                    backgroundColor: activeMetric === 'served' ? '#EFF6FF' : activeMetric === 'missed' ? '#FEF2F2' : '#ECFDF5'
                                }]}>
                                    <Ionicons
                                        name={activeMetric === 'served' ? 'people' : activeMetric === 'missed' ? 'alert-circle' : 'cash'}
                                        size={24}
                                        color={activeMetric === 'served' ? '#2563EB' : activeMetric === 'missed' ? '#DC2626' : '#059669'}
                                    />
                                </View>
                                <View>
                                    <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                                        {activeMetric === 'served' ? 'Customer Analysis' : activeMetric === 'missed' ? 'Missed Opportunities' : 'Earnings Report'}
                                    </Text>
                                    <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                                        Detailed breakdown and insights
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                                    <Ionicons name="close" size={24} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Content Scroll */}
                        <ScrollView
                            style={{ flex: 1 }}
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Key Statistic Card */}
                            <View style={[styles.keyStatCard, {
                                borderColor: activeMetric === 'served' ? '#BFDBFE' : activeMetric === 'missed' ? '#FECACA' : '#BBF7D0',
                                backgroundColor: activeMetric === 'served' ? '#EFF6FF' : activeMetric === 'missed' ? '#FEF2F2' : '#F0FDF4'
                            }]}>
                                <Text style={[styles.keyStatLabel, { color: colors.textSecondary }]}>
                                    {activeMetric === 'served' ? 'TOTAL SERVED' : activeMetric === 'missed' ? 'TOTAL MISSED' : 'TOTAL REVENUE'}
                                </Text>
                                <Text style={[styles.keyStatValue, {
                                    color: activeMetric === 'served' ? '#1E40AF' : activeMetric === 'missed' ? '#991B1B' : '#065F46'
                                }]}>
                                    {activeMetric === 'served' ? lifetimeData.customers :
                                        activeMetric === 'missed' ? lifetimeData.missed :
                                            `₹${((lifetimeData.earnings || 0) / 100000).toFixed(2)}L`}
                                </Text>
                            </View>

                            {/* Detailed List */}
                            <View style={styles.sectionContainer}>
                                <Text style={[styles.sectionHeader, { color: colors.textPrimary }]}>Performance Metrics</Text>
                                <View style={[styles.metricList, { borderColor: colors.border }]}>
                                    {renderMetricContent()}
                                </View>
                            </View>

                        </ScrollView>

                    </Animated.View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    // Main Card
    mainGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    statBox: {
        flex: 1,
        padding: 12,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    boxBlue: { backgroundColor: '#EFF6FF', },
    boxGreen: { backgroundColor: '#ECFDF5', },
    boxRed: { backgroundColor: '#FEF2F2', },

    boxValue: {
        fontSize: 20,
        fontWeight: '800',
    },
    boxLabel: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },

    earningsBox: {
        padding: 16,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    boxGold: { backgroundColor: '#FFFBEB' },
    earningsLabel: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    earningsValue: {
        fontSize: 24,
        fontWeight: '800',
    },
    tapIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        opacity: 0.6,
        gap: 2,
    },

    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
        marginTop: 4,
    },
    footerText: {
        fontSize: 11,
        fontWeight: '500',
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: '70%',
        width: '100%',
        backgroundColor: '#FFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        overflow: 'hidden',
        paddingHorizontal: 20, // Restore horizontal padding for content safety
        paddingTop: 16,
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    handleBar: {
        width: 48,
        height: 6,
        borderRadius: 3,
    },
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        backgroundColor: '#F1F5F9', // Solid background for slider track
        padding: 4,
        borderRadius: 16,
        height: 56,
        alignItems: 'center',
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        borderRadius: 12,
        borderWidth: 0, // No border for slider items
    },
    tabActive: {
        backgroundColor: '#FFFFFF',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    tabText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B', // Inactive text
    },
    scrollContent: {
        paddingBottom: 20,
    },
    highlightCard: {
        padding: 24,
        alignItems: 'center',
        borderRadius: 24, // Softer corners
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    highlightTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: 12,
        marginBottom: 4,
    },
    highlightValue: {
        fontSize: 32,
        fontWeight: '800',
    },
    detailsList: {
        gap: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    detailLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    detailValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    warningSection: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 20,
    },
    warningTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 8,
    },
    suggestionText: {
        fontSize: 13,
        lineHeight: 20,
        fontStyle: 'italic',
    },
    topCloseButton: {
        position: 'absolute',
        right: 0,
        top: -10, // Adjust position relative to header center
        padding: 4,
    },
    valueDisplay: {
        alignItems: 'center',
        marginVertical: 20,
    },
    bigValue: {
        fontSize: 48,
        fontWeight: '900',
        letterSpacing: -1,
        marginBottom: 4,
    },
    bigLabel: {
        fontSize: 14,
        fontWeight: '700',
        textTransform: 'uppercase',
        opacity: 0.8,
    },
    // Premium Modal Styles
    premiumHeader: {
        paddingTop: 16,
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginTop: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    modalSubtitle: {
        fontSize: 13,
        fontWeight: '500',
    },
    closeButton: {
        marginLeft: 'auto',
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 20,
    },
    keyStatCard: {
        margin: 20,
        padding: 24,
        borderRadius: 24,
        alignItems: 'center',
        borderWidth: 1,
    },
    keyStatLabel: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 8,
    },
    keyStatValue: {
        fontSize: 36,
        fontWeight: '900',
        letterSpacing: -1,
    },
    sectionContainer: {
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },
    metricList: {
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
    }
});
