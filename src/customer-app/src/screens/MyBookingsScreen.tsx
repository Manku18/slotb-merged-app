import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    RefreshControl,
    Platform,
    StatusBar,
    Alert,
    TextInput,
    Modal,
    Dimensions,
    ScrollView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    CalendarCheck,
    Scissors,
    Clock,
    Hash,
    CheckCircle2,
    XCircle,
    ChevronRight,
    RotateCcw,
    MapPin,
    IndianRupee,
    Search,
    Trash2,
    X,
    Info
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const API_BOOKINGS = 'https://slotb.in/api_bookings.php';

interface Booking {
    id: number;
    shop_id: number;
    shop_name: string;
    shop_image: string;
    shop_address: string;
    user_name: string;
    service_id: number | null;
    service_title: string | null;
    price: string | null;
    token: number;
    booking_date: string;
    status: 'waiting' | 'serving' | 'served' | 'cancelled' | 'no-show';
    created_at: string;
}

const STATUS_COLORS = {
    waiting: { bg: '#FFF8E1', text: '#B45309', label: 'Pending', icon: Clock },
    serving: { bg: '#E0F2FE', text: '#0369A1', label: 'Serving', icon: Scissors },
    served: { bg: '#DCFCE7', text: '#15803D', label: 'Completed', icon: CheckCircle2 },
    cancelled: { bg: '#FEE2E2', text: '#DC2626', label: 'Cancelled', icon: XCircle },
    'no-show': { bg: '#F3F4F6', text: '#6B7280', label: 'No Show', icon: XCircle },
};

export default function MyBookingsScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchText, setSearchText] = useState('');

    // Details Modal State
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [detailsVisible, setDetailsVisible] = useState(false);

    const fetchBookings = useCallback(async (isRefreshing = false) => {
        if (!user?.email) {
            setLoading(false);
            return;
        }
        const cleanEmail = user.email.trim().toLowerCase();
        if (!isRefreshing) setLoading(true);
        try {
            const url = `${API_BOOKINGS}?email=${cleanEmail}`;
            console.log('Fetching bookings from:', url);
            const res = await fetch(url);
            const data = await res.json();
            console.log('Bookings received:', data.bookings?.length || 0, 'items');
            if (data.status === 'ok') {
                setBookings(data.bookings);
            }
        } catch (error) {
            console.error('Fetch bookings error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?.email]);

    useFocusEffect(
        useCallback(() => {
            fetchBookings();
        }, [fetchBookings])
    );

    const handleRefresh = () => {
        setRefreshing(true);
        fetchBookings(true);
    };

    const handleDelete = (id: number) => {
        Alert.alert(
            "Delete Booking?",
            "This will permanently remove this booking from your history. This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Permanently Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const params = new URLSearchParams();
                            params.append('action', 'delete');
                            params.append('booking_id', String(id));
                            params.append('email', user?.email?.trim().toLowerCase() || '');

                            const res = await fetch(API_BOOKINGS, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                body: params.toString()
                            });
                            const data = await res.json();
                            if (data.status === 'ok') {
                                Alert.alert("Deleted", "Booking has been removed.");
                                fetchBookings(true);
                            } else {
                                Alert.alert("Error", data.message || "Could not delete.");
                            }
                        } catch (e) {
                            Alert.alert("Error", "Network error while deleting.");
                        }
                    }
                }
            ]
        );
    };

    const handleBookAgain = (booking: Booking) => {
        navigation.navigate('Salon', {
            bookAgainShopId: booking.shop_id,
            bookAgainShopName: booking.shop_name,
            bookAgainAddress: booking.shop_address
        });
    };

    const handleDetails = (item: Booking) => {
        setSelectedBooking(item);
        setDetailsVisible(true);
    };

    const renderBookingItem = ({ item }: { item: Booking }) => {
        const status = STATUS_COLORS[item.status] || STATUS_COLORS.waiting;
        const formattedDate = new Date(item.booking_date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Image source={{ uri: item.shop_image }} style={styles.shopImg} />
                    <View style={styles.headerInfo}>
                        <Text style={styles.shopName} numberOfLines={1}>{item.shop_name}</Text>
                        <View style={styles.locRow}>
                            <MapPin size={12} color="#6B7280" />
                            <Text style={styles.shopAddr} numberOfLines={1}>{item.shop_address || 'No address provided'}</Text>
                        </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                        <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <View style={styles.infoRow}>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoLabel}>SERVICE</Text>
                            <Text style={styles.infoValue} numberOfLines={1}>{item.service_title || 'N/A'}</Text>
                        </View>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoLabel}>TOKEN</Text>
                            <View style={styles.tokenBadge}>
                                <Hash size={10} color="#fff" strokeWidth={3} />
                                <Text style={styles.tokenValue}>#{item.token}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Clock size={14} color="#6B7280" />
                            <Text style={styles.metaText}>{formattedDate}</Text>
                        </View>
                        {item.price && (
                            <View style={styles.metaItem}>
                                <IndianRupee size={12} color="#15803D" strokeWidth={3} />
                                <Text style={[styles.metaText, { color: '#15803D', fontWeight: '800' }]}>{item.price}</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <TouchableOpacity
                        style={styles.bookAgainBtn}
                        onPress={() => handleBookAgain(item)}
                        activeOpacity={0.8}
                    >
                        <RotateCcw size={16} color="#4F46E5" strokeWidth={2.5} />
                        <Text style={styles.bookAgainText}>Book Again</Text>
                    </TouchableOpacity>

                    <View style={styles.actionGroup}>
                        <TouchableOpacity
                            style={styles.deleteBtn}
                            onPress={() => handleDelete(item.id)}
                            activeOpacity={0.7}
                        >
                            <Trash2 size={18} color="#EF4444" strokeWidth={2} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.detailsBtn}
                            onPress={() => handleDetails(item)}
                        >
                            <Text style={styles.detailsText}>Details</Text>
                            <ChevronRight size={16} color="#6B7280" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    const filteredBookings = bookings.filter(b =>
        b.shop_name.toLowerCase().includes(searchText.toLowerCase()) ||
        (b.service_title && b.service_title.toLowerCase().includes(searchText.toLowerCase()))
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <LinearGradient
                colors={['#fff', '#F6F7FA']}
                style={[styles.header, { paddingTop: insets.top + 10 }]}
            >
                <View style={styles.headerTop}>
                    <CalendarCheck size={28} color="#1D4ED8" strokeWidth={2} />
                    <View style={{ marginLeft: 12 }}>
                        <Text style={styles.headerTitle}>My Bookings</Text>
                        <Text style={styles.headerSub}>Manage your hair & glow appointments</Text>
                    </View>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Search size={18} color="#9CA3AF" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by shop or service..."
                        value={searchText}
                        onChangeText={setSearchText}
                        placeholderTextColor="#9CA3AF"
                    />
                    {searchText.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchText('')}>
                            <XCircle size={18} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>
            </LinearGradient>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#1D4ED8" />
                </View>
            ) : filteredBookings.length === 0 ? (
                <View style={styles.center}>
                    <View style={styles.emptyCircle}>
                        <CalendarCheck size={48} color="#D1D5DB" />
                    </View>
                    <Text style={styles.emptyTitle}>No Bookings Found</Text>
                    <Text style={styles.emptySub}>
                        {searchText.length > 0
                            ? "Try searching for something else."
                            : `We couldn't find any appointments for ${user?.email}.`}
                    </Text>
                    {searchText.length === 0 && (
                        <TouchableOpacity
                            style={styles.exploreBtn}
                            onPress={() => navigation.navigate('Salon')}
                        >
                            <Text style={styles.exploreBtnText}>Book Now</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={{ marginTop: 20 }}
                        onPress={() => {
                            setSearchText('');
                            fetchBookings(true);
                        }}
                    >
                        <Text style={{ color: '#1D4ED8', fontWeight: '600' }}>Refresh List</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={filteredBookings}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderBookingItem}
                    contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 20 }]}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#1D4ED8" />
                    }
                />
            )}

            {/* Professional Details Modal */}
            <Modal
                visible={detailsVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setDetailsVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedBooking && (
                            <>
                                <View style={styles.modalHeader}>
                                    <View style={styles.modalHeaderTop}>
                                        <View style={styles.modalTitleRow}>
                                            <Info size={20} color="#1D4ED8" />
                                            <Text style={styles.modalTitle}>Booking Receipt</Text>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => setDetailsVisible(false)}
                                            style={styles.closeBtn}
                                        >
                                            <X size={20} color="#6B7280" />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalBody}>
                                    <View style={styles.modalShopSection}>
                                        <Image source={{ uri: selectedBooking.shop_image }} style={styles.modalShopImg} />
                                        <View style={styles.modalShopInfo}>
                                            <Text style={styles.modalShopName}>{selectedBooking.shop_name}</Text>
                                            <View style={styles.modalLocRow}>
                                                <MapPin size={12} color="#6B7280" />
                                                <Text style={styles.modalShopAddr}>{selectedBooking.shop_address || 'N/A'}</Text>
                                            </View>
                                        </View>
                                    </View>

                                    <View style={styles.divider} />

                                    <View style={styles.receiptGrid}>
                                        <View style={styles.receiptItem}>
                                            <Text style={styles.receiptLabel}>SERVICE</Text>
                                            <Text style={styles.receiptValue}>{selectedBooking.service_title || 'N/A'}</Text>
                                        </View>
                                        <View style={styles.receiptItem}>
                                            <Text style={styles.receiptLabel}>TOKEN NUMBER</Text>
                                            <View style={styles.modalTokenBadge}>
                                                <Text style={styles.modalTokenValue}>#{selectedBooking.token}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.receiptItem}>
                                            <Text style={styles.receiptLabel}>BOOKING DATE</Text>
                                            <Text style={styles.receiptValue}>{new Date(selectedBooking.booking_date).toLocaleDateString()}</Text>
                                        </View>
                                        <View style={styles.receiptItem}>
                                            <Text style={styles.receiptLabel}>STATUS</Text>
                                            <View style={[styles.modalStatusBadge, { backgroundColor: (STATUS_COLORS[selectedBooking.status] || STATUS_COLORS.waiting).bg }]}>
                                                <Text style={[styles.modalStatusText, { color: (STATUS_COLORS[selectedBooking.status] || STATUS_COLORS.waiting).text }]}>
                                                    {(STATUS_COLORS[selectedBooking.status] || STATUS_COLORS.waiting).label}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    <View style={styles.costSection}>
                                        <Text style={styles.totalLabel}>Total Amount</Text>
                                        <View style={styles.totalRow}>
                                            <IndianRupee size={22} color="#1A1D26" strokeWidth={3} />
                                            <Text style={styles.totalAmount}>{selectedBooking.price || '0'}</Text>
                                        </View>
                                    </View>
                                </ScrollView>

                                <View style={styles.modalFooter}>
                                    <TouchableOpacity
                                        style={styles.doneBtn}
                                        onPress={() => setDetailsVisible(false)}
                                    >
                                        <Text style={styles.doneBtnText}>Close Receipt</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F6F7FA' },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#EBEBEB',
    },
    headerTop: { flexDirection: 'row', alignItems: 'center' },
    headerTitle: { fontSize: 24, fontWeight: '800', color: '#1A1D26' },
    headerSub: { fontSize: 13, color: '#6B7280', fontWeight: '500', marginTop: 2 },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
        marginTop: 16,
        gap: 8
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#1A1D26',
        fontWeight: '500',
        paddingVertical: 8,
    },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
    list: { padding: 16 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        marginBottom: 16,
        padding: 16,
        ...Platform.select({
            android: { elevation: 3 },
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10 },
        }),
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    shopImg: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#F3F4F6' },
    headerInfo: { flex: 1, marginLeft: 12 },
    shopName: { fontSize: 16, fontWeight: '800', color: '#1A1D26' },
    locRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    shopAddr: { fontSize: 12, color: '#6B7280', marginLeft: 4, flex: 1 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    statusText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
    cardBody: {
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 12,
        marginBottom: 14,
    },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    infoBox: { flex: 1 },
    infoLabel: { fontSize: 9, color: '#9CA3AF', fontWeight: '800', letterSpacing: 0.5, marginBottom: 2 },
    infoValue: { fontSize: 14, fontWeight: '700', color: '#374151' },
    tokenBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1F2937',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        alignSelf: 'flex-start'
    },
    tokenValue: { color: '#fff', fontSize: 13, fontWeight: '800', marginLeft: 2 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    metaText: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 4,
    },
    bookAgainBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        gap: 6
    },
    bookAgainText: { fontSize: 13, fontWeight: '700', color: '#4F46E5' },
    actionGroup: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    deleteBtn: {
        padding: 8,
        backgroundColor: '#FEF2F2',
        borderRadius: 10,
    },
    detailsBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    detailsText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
    emptyCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    emptyTitle: { fontSize: 20, fontWeight: '800', color: '#374151', marginBottom: 8 },
    emptySub: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
    exploreBtn: { backgroundColor: '#1D4ED8', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16 },
    exploreBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
    },
    modalContent: {
        width: '100%',
        maxHeight: SCREEN_HEIGHT * 0.8,
        backgroundColor: '#fff',
        borderRadius: 30,
        overflow: 'hidden',
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
    },
    modalHeader: {
        padding: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    modalHeaderTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    modalTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1A1D26'
    },
    closeBtn: {
        padding: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 20
    },
    modalBody: {
        padding: 20
    },
    modalShopSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16
    },
    modalShopImg: {
        width: 70,
        height: 70,
        borderRadius: 15,
        backgroundColor: '#F3F4F6'
    },
    modalShopInfo: {
        flex: 1
    },
    modalShopName: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1A1D26'
    },
    modalLocRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 4
    },
    modalShopAddr: {
        fontSize: 13,
        color: '#6B7280',
        flex: 1
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 20,
        width: '100%'
    },
    receiptGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 20
    },
    receiptItem: {
        width: '45%'
    },
    receiptLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#9CA3AF',
        letterSpacing: 1,
        marginBottom: 6
    },
    receiptValue: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1A1D26'
    },
    modalTokenBadge: {
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: 'flex-start'
    },
    modalTokenValue: {
        fontSize: 16,
        fontWeight: '900',
        color: '#1D4ED8'
    },
    modalStatusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start'
    },
    modalStatusText: {
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase'
    },
    costSection: {
        marginTop: 30,
        padding: 20,
        backgroundColor: '#F9FAFB',
        borderRadius: 20,
        alignItems: 'center'
    },
    totalLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6B7280',
        marginBottom: 8
    },
    totalRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    totalAmount: {
        fontSize: 32,
        fontWeight: '900',
        color: '#1A1D26',
        marginLeft: 4
    },
    modalFooter: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6'
    },
    doneBtn: {
        backgroundColor: '#1A1D26',
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center'
    },
    doneBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700'
    }
});
