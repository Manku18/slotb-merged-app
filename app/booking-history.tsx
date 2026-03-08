import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Modal, ScrollView, Dimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/useAppStore';
import { apiService } from '@/services/api';
import { GlassCard } from '@/components/ui/GlassCard';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

export default function BookingHistoryScreen() {
    const { colors, isDarkMode } = useTheme();
    const { user } = useAppStore();
    const router = useRouter();

    const [type, setType] = useState<'monthly' | 'yearly'>('monthly');
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState<any[]>([]);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);

    useEffect(() => {
        loadHistory();
    }, [type]);

    const loadHistory = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const now = new Date();
            const data = await apiService.getReportData(user.id, type, now.getFullYear(), now.getMonth() + 1);
            if (data && data.detailed_bookings) {
                setBookings(data.detailed_bookings);
            } else {
                setBookings([]);
            }
        } catch (error) {
            console.error('Error loading history:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'served': return '#10B981';
            case 'cancelled': return '#EF4444';
            case 'no-show': return '#F59E0B';
            default: return colors.primary;
        }
    };

    const renderBookingItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.bookingCard, { backgroundColor: colors.surfaceHighlight || colors.surface }]}
            onPress={() => setSelectedBooking(item)}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary + '10' }]}>
                    <Text style={[styles.avatarText, { color: colors.primary }]}>{item.name?.[0].toUpperCase()}</Text>
                </View>
                <View style={styles.mainInfo}>
                    <Text style={[styles.customerName, { color: colors.textPrimary }]} numberOfLines={1}>{item.name}</Text>
                    <Text style={[styles.serviceName, { color: colors.textTertiary }]}>{item.service}</Text>
                </View>
                <View style={styles.endInfo}>
                    <Text style={[styles.priceTag, { color: colors.primary }]}>₹{item.price}</Text>
                    <View style={[styles.statusTag, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                        <Text style={[styles.statusTagText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                    </View>
                </View>
            </View>

            <View style={[styles.cardFooter, { borderTopColor: colors.border + '30' }]}>
                <View style={styles.footerItem}>
                    <Ionicons name="calendar-outline" size={14} color={colors.textTertiary} />
                    <Text style={[styles.footerText, { color: colors.textTertiary }]}>{item.date}</Text>
                </View>
                <Ionicons name="arrow-forward-circle" size={20} color={colors.primary} />
            </View>
        </TouchableOpacity>
    );

    function DetailItem({ label, value, icon, isBold, badgeColor }: any) {
        return (
            <View style={styles.detailItem}>
                <View style={[styles.detailIcon, { backgroundColor: colors.surfaceHighlight }]}>
                    <Ionicons name={icon} size={18} color={badgeColor || colors.textSecondary} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.detailLabel, { color: colors.textTertiary }]}>{label}</Text>
                    {badgeColor ? (
                        <View style={[styles.modalStatusBadge, { backgroundColor: badgeColor + '15' }]}>
                            <Text style={[styles.modalStatusText, { color: badgeColor }]}>{value}</Text>
                        </View>
                    ) : (
                        <Text style={[styles.detailValue, { color: colors.textPrimary, fontWeight: isBold ? '700' : '500' }]}>{value}</Text>
                    )}
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen
                options={{
                    headerTitle: "Booking History",
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                    ),
                    headerStyle: { backgroundColor: colors.background },
                    headerTintColor: colors.textPrimary,
                    headerShadowVisible: false,
                }}
            />

            {/* Selection Header */}
            <View style={[styles.selectionTabContainer, { backgroundColor: colors.surfaceHighlight || colors.surface }]}>
                <TouchableOpacity
                    style={[styles.tabButton, type === 'monthly' && { backgroundColor: colors.primary }]}
                    onPress={() => setType('monthly')}
                >
                    <Text style={[styles.tabText, { color: type === 'monthly' ? '#FFF' : colors.textSecondary }]}>Monthly View</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton, type === 'yearly' && { backgroundColor: colors.primary }]}
                    onPress={() => setType('yearly')}
                >
                    <Text style={[styles.tabText, { color: type === 'yearly' ? '#FFF' : colors.textSecondary }]}>Yearly View</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={{ marginTop: 16, color: colors.textTertiary, fontWeight: '600' }}>Compiling records...</Text>
                </View>
            ) : bookings.length > 0 ? (
                <FlatList
                    data={bookings}
                    renderItem={renderBookingItem}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.center}>
                    <View style={[styles.emptyIconCircle, { backgroundColor: colors.surfaceHighlight }]}>
                        <Ionicons name="receipt-outline" size={48} color={colors.border} />
                    </View>
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No history records found</Text>
                    <Text style={[styles.emptySub, { color: colors.textTertiary }]}>Your completed orders will appear here</Text>
                </View>
            )}

            {/* Detail Modal */}
            <Modal
                visible={!!selectedBooking}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setSelectedBooking(null)}
            >
                <BlurView intensity={20} tint={isDarkMode ? 'dark' : 'light'} style={styles.modalBlur}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <View style={styles.modalDragHandle} />

                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Order Details</Text>
                                <Text style={[styles.modalSubtitle, { color: colors.textTertiary }]}>Transaction Summary</Text>
                            </View>
                            <TouchableOpacity onPress={() => setSelectedBooking(null)}>
                                <Ionicons name="close-circle-outline" size={32} color={colors.textTertiary} />
                            </TouchableOpacity>
                        </View>

                        {selectedBooking && (
                            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
                                <GlassCard style={styles.customerCard}>
                                    <View style={styles.customerRow}>
                                        <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
                                            <Text style={styles.avatarCircleText}>{selectedBooking.name?.[0]}</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.modalCustomerName, { color: colors.textPrimary }]}>{selectedBooking.name}</Text>
                                            <Text style={[styles.modalCustomerPhone, { color: colors.textTertiary }]}>{selectedBooking.phone}</Text>
                                        </View>
                                        <TouchableOpacity style={[styles.actionIconButton, { backgroundColor: colors.primary + '15' }]}>
                                            <Ionicons name="call" size={20} color={colors.primary} />
                                        </TouchableOpacity>
                                    </View>
                                </GlassCard>

                                <View style={styles.detailsList}>
                                    <View style={styles.detailItem}>
                                        <View style={[styles.detailIcon, { backgroundColor: colors.surfaceHighlight }]}>
                                            <Ionicons name="mail-outline" size={18} color={colors.textSecondary} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.detailLabel, { color: colors.textTertiary }]}>Email ID</Text>
                                            <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{selectedBooking.email || 'Not Provided'}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.detailItem}>
                                        <View style={[styles.detailIcon, { backgroundColor: colors.surfaceHighlight }]}>
                                            <Ionicons name="cut-outline" size={18} color={colors.textSecondary} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.detailLabel, { color: colors.textTertiary }]}>Service Taken</Text>
                                            <Text style={[styles.detailValue, { color: colors.textPrimary, fontWeight: '700' }]}>{selectedBooking.service}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.detailItem}>
                                        <View style={[styles.detailIcon, { backgroundColor: colors.surfaceHighlight }]}>
                                            <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.detailLabel, { color: colors.textTertiary }]}>Booking Date</Text>
                                            <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{selectedBooking.date}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.detailItem}>
                                        <View style={[styles.detailIcon, { backgroundColor: colors.surfaceHighlight }]}>
                                            <Ionicons name="checkmark-circle-outline" size={18} color={getStatusColor(selectedBooking.status)} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.detailLabel, { color: colors.textTertiary }]}>Status</Text>
                                            <View style={[styles.modalStatusBadge, { backgroundColor: getStatusColor(selectedBooking.status) + '15' }]}>
                                                <Text style={[styles.modalStatusText, { color: getStatusColor(selectedBooking.status) }]}>{selectedBooking.status.toUpperCase()}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                <View style={[styles.priceBreakdown, { borderTopColor: colors.border }]}>
                                    <Text style={[styles.priceLabel, { color: colors.textTertiary }]}>Total Amount Received</Text>
                                    <Text style={[styles.priceValue, { color: colors.primary }]}>₹{selectedBooking.price}</Text>
                                </View>
                            </ScrollView>
                        )}

                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={[styles.modalCloseBtn, { backgroundColor: colors.primary }]}
                            onPress={() => setSelectedBooking(null)}
                        >
                            <Text style={styles.modalCloseBtnText}>Close Receipt</Text>
                        </TouchableOpacity>
                    </View>
                </BlurView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    backButton: { marginLeft: 8, padding: 4 },
    selectionTabContainer: {
        flexDirection: 'row',
        margin: 16,
        padding: 6,
        borderRadius: 16,
        gap: 6,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    tabText: { fontSize: 13, fontWeight: '700' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
    listContent: { paddingHorizontal: 16, paddingBottom: 40 },
    bookingCard: {
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    cardHeader: { flexDirection: 'row', marginBottom: 12, alignItems: 'center' },
    avatarPlaceholder: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    avatarText: { fontSize: 18, fontWeight: '800' },
    mainInfo: { flex: 1 },
    customerName: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
    serviceName: { fontSize: 12, fontWeight: '500' },
    endInfo: { alignItems: 'flex-end' },
    priceTag: { fontSize: 18, fontWeight: '900', marginBottom: 4 },
    statusTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    statusTagText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1 },
    footerItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    footerText: { fontSize: 11, fontWeight: '500' },
    emptyIconCircle: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    emptyText: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
    emptySub: { fontSize: 14, textAlign: 'center' },
    modalBlur: { flex: 1, justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 24, maxHeight: '85%' },
    modalDragHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.1)', alignSelf: 'center', marginBottom: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    modalTitle: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
    modalSubtitle: { fontSize: 13, fontWeight: '600', marginTop: 2 },
    modalScroll: { marginBottom: 24 },
    customerCard: { padding: 16, borderRadius: 20, marginBottom: 20 },
    customerRow: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    avatarCircle: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
    avatarCircleText: { color: '#FFF', fontSize: 20, fontWeight: '800' },
    modalCustomerName: { fontSize: 18, fontWeight: '800' },
    modalCustomerPhone: { fontSize: 14, fontWeight: '500' },
    actionIconButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    detailsList: { gap: 16 },
    detailItem: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    detailIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    detailLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 2 },
    detailValue: { fontSize: 15, fontWeight: '600' },
    modalStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
    modalStatusText: { fontSize: 11, fontWeight: '800' },
    priceBreakdown: { marginTop: 24, paddingTop: 20, borderTopWidth: 1, alignItems: 'center' },
    priceLabel: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
    priceValue: { fontSize: 36, fontWeight: '900', letterSpacing: -1 },
    modalCloseBtn: { paddingVertical: 18, borderRadius: 18, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
    modalCloseBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' }
});
