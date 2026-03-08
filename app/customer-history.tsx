import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Modal, ScrollView, Dimensions, Linking } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/useAppStore';
import { apiService } from '@/services/api';
import { GlassCard } from '@/components/ui/GlassCard';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

export default function CustomerHistoryScreen() {
    const { colors, isDarkMode } = useTheme();
    const { user } = useAppStore();
    const router = useRouter();

    const [type, setType] = useState<'monthly' | 'yearly'>('monthly');
    const [loading, setLoading] = useState(true);
    const [customers, setCustomers] = useState<any[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [customerHistory, setCustomerHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        loadCustomers();
    }, [type]);

    const loadCustomers = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const now = new Date();
            const data = await apiService.getCustomers(user.id, type, now.getFullYear(), now.getMonth() + 1);
            setCustomers(data || []);
        } catch (error) {
            console.error('Error loading customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async (customer: any) => {
        setSelectedCustomer(customer);
        setLoadingHistory(true);
        try {
            const data = await apiService.getCustomerHistory(user?.id || '', customer.phone);
            if (data.ok) {
                setCustomerHistory(data.history || []);
            }
        } catch (e) {
            console.error("Error fetching individual history", e);
        } finally {
            setLoadingHistory(false);
        }
    }

    const handleCall = (phone: string) => {
        if (!phone) return;
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        Linking.openURL(`tel:${cleanPhone}`);
    };

    const handleWhatsApp = (phone: string) => {
        if (!phone) return;
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        // Default to Indian country code if not present
        const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
        Linking.openURL(`whatsapp://send?phone=${finalPhone}&text=Hello ${selectedCustomer?.name || ''}, greeting from ${user?.shopName || 'SlotB Partner'}!`);
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'served': return '#10B981';
            case 'cancelled': return '#EF4444';
            case 'no-show': return '#F59E0B';
            default: return colors.primary;
        }
    };

    const renderCustomerItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.customerCard, { backgroundColor: colors.surfaceHighlight || colors.surface }]}
            onPress={() => fetchHistory(item)}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary + '10' }]}>
                    <Text style={[styles.avatarText, { color: colors.primary }]}>{item.name?.[0].toUpperCase()}</Text>
                </View>
                <View style={styles.mainInfo}>
                    <Text style={[styles.customerName, { color: colors.textPrimary }]} numberOfLines={1}>{item.name}</Text>
                    <Text style={[styles.customerPhone, { color: colors.textTertiary }]}>{item.phone}</Text>
                </View>
                <View style={styles.endInfo}>
                    <Text style={[styles.visitsTag, { color: colors.primary }]}>{item.bookingsCount} Visits</Text>
                    <Text style={[styles.spentText, { color: colors.textSecondary }]}>Spent ₹{item.spent}</Text>
                </View>
            </View>

            <View style={[styles.cardFooter, { borderTopColor: colors.border + '30' }]}>
                <Text style={[styles.lastVisitText, { color: colors.textTertiary }]}>Last visit: {item.lastVisit}</Text>
                <View style={styles.quickActions}>
                    <TouchableOpacity onPress={() => handleCall(item.phone)} style={styles.miniActionBtn}>
                        <Ionicons name="call" size={16} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleWhatsApp(item.phone)} style={styles.miniActionBtn}>
                        <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen
                options={{
                    headerTitle: "Customer History",
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
                    <Text style={[styles.tabText, { color: type === 'monthly' ? '#FFF' : colors.textSecondary }]}>Monthly List</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton, type === 'yearly' && { backgroundColor: colors.primary }]}
                    onPress={() => setType('yearly')}
                >
                    <Text style={[styles.tabText, { color: type === 'yearly' ? '#FFF' : colors.textSecondary }]}>Yearly List</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={{ marginTop: 16, color: colors.textTertiary, fontWeight: '600' }}>Fetching customers...</Text>
                </View>
            ) : customers.length > 0 ? (
                <FlatList
                    data={customers}
                    renderItem={renderCustomerItem}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.center}>
                    <View style={[styles.emptyIconCircle, { backgroundColor: colors.surfaceHighlight }]}>
                        <Ionicons name="people-outline" size={48} color={colors.border} />
                    </View>
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No customers found</Text>
                    <Text style={[styles.emptySub, { color: colors.textTertiary }]}>Customers who booked with you will appear here</Text>
                </View>
            )}

            {/* Individual History Detail Modal */}
            <Modal
                visible={!!selectedCustomer}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setSelectedCustomer(null)}
            >
                <BlurView intensity={20} tint={isDarkMode ? 'dark' : 'light'} style={styles.modalBlur}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <View style={styles.modalDragHandle} />

                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Customer Profile</Text>
                                <Text style={[styles.modalSubtitle, { color: colors.textTertiary }]}>{selectedCustomer?.name}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setSelectedCustomer(null)}>
                                <Ionicons name="close-circle-outline" size={32} color={colors.textTertiary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.customerActionRow}>
                            <TouchableOpacity onPress={() => handleCall(selectedCustomer?.phone)} style={[styles.mainActionBtn, { backgroundColor: colors.primary + '15' }]}>
                                <Ionicons name="call" size={20} color={colors.primary} />
                                <Text style={[styles.mainActionText, { color: colors.primary }]}>Call Now</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleWhatsApp(selectedCustomer?.phone)} style={[styles.mainActionBtn, { backgroundColor: '#25D36615' }]}>
                                <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                                <Text style={[styles.mainActionText, { color: '#25D366' }]}>WhatsApp</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.historyLabel, { color: colors.textPrimary }]}>Complete Booking History</Text>

                        {loadingHistory ? (
                            <ActivityIndicator color={colors.primary} style={{ margin: 20 }} />
                        ) : (
                            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
                                {customerHistory.map((item, idx) => (
                                    <View key={idx} style={[styles.historyItem, { borderLeftColor: getStatusColor(item.status) }]}>
                                        <View style={styles.historyMain}>
                                            <Text style={[styles.histService, { color: colors.textPrimary }]}>{item.service}</Text>
                                            <Text style={[styles.histDate, { color: colors.textTertiary }]}>{item.date}</Text>
                                        </View>
                                        <View style={styles.histEnd}>
                                            <Text style={[styles.histPrice, { color: colors.primary }]}>₹{item.price}</Text>
                                            <Text style={[styles.histStatus, { color: getStatusColor(item.status) }]}>{item.status.toUpperCase()}</Text>
                                        </View>
                                    </View>
                                ))}
                            </ScrollView>
                        )}

                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={[styles.modalCloseBtn, { backgroundColor: colors.primary }]}
                            onPress={() => setSelectedCustomer(null)}
                        >
                            <Text style={styles.modalCloseBtnText}>Close Profile</Text>
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
    customerCard: {
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
    customerPhone: { fontSize: 12, fontWeight: '500' },
    endInfo: { alignItems: 'flex-end' },
    visitsTag: { fontSize: 14, fontWeight: '900', marginBottom: 2 },
    spentText: { fontSize: 10, fontWeight: '700' },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1 },
    lastVisitText: { fontSize: 11, fontWeight: '500' },
    quickActions: { flexDirection: 'row', gap: 12 },
    miniActionBtn: { padding: 4 },
    emptyIconCircle: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    emptyText: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
    emptySub: { fontSize: 14, textAlign: 'center' },
    modalBlur: { flex: 1, justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 24, maxHeight: '85%' },
    modalDragHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.1)', alignSelf: 'center', marginBottom: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    modalTitle: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
    modalSubtitle: { fontSize: 16, fontWeight: '700', marginTop: 2 },
    customerActionRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    mainActionBtn: { flex: 1, flexDirection: 'row', padding: 12, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 8 },
    mainActionText: { fontWeight: '700', fontSize: 14 },
    historyLabel: { fontSize: 15, fontWeight: '800', marginBottom: 16 },
    modalScroll: { marginBottom: 24 },
    historyItem: { flexDirection: 'row', padding: 12, borderLeftWidth: 4, backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 8, marginBottom: 8, justifyContent: 'space-between' },
    historyMain: { flex: 1 },
    histService: { fontSize: 14, fontWeight: '700' },
    histDate: { fontSize: 11, fontWeight: '500', marginTop: 2 },
    histEnd: { alignItems: 'flex-end' },
    histPrice: { fontSize: 15, fontWeight: '800' },
    histStatus: { fontSize: 9, fontWeight: '900', marginTop: 2, textAlign: 'right' },
    modalCloseBtn: { paddingVertical: 18, borderRadius: 18, alignItems: 'center' },
    modalCloseBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' }
});
