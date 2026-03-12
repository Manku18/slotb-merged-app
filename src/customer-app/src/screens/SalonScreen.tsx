import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    Platform,
    Animated,
    Image,
    Modal,
    ScrollView,
    Alert,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    PanResponder,
    Easing,
    Pressable,
    Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { API_URL, useAuth, createFormData } from '../context/AuthContext';
import {
    MapPin,
    Bell,
    ChevronDown,
    Search,
    X,
    Navigation,
    ChevronRight,
    QrCode,
    Star,
    Clock,
    Navigation2,
    BadgeCheck,
    Info,
    Scissors,
    Calendar,
    Phone,
    MessageSquare,
    Heart,
    Users,
    Sparkles,
    CheckCircle2,
    Timer,
    Hash,
    SlidersHorizontal,
} from 'lucide-react-native';
import { useLocation } from '../context/LocationContext';
import LocationSelectorModal from '../components/LocationSelectorModal';
import SalonFilterModal, { FilterOption } from '../components/SalonFilterModal';
import { LinearGradient } from 'expo-linear-gradient';
import { BookingModal } from '../components/BookingModal';

const { width, height } = Dimensions.get('window');
const CARD_W = width * 0.72;
const RECENT_W = width * 0.72;

// ------ Categories ------------------------------------------------------------------------------------------------------------------------------
const CATEGORIES = [
    { id: '1', label: 'All' },
    { id: '2', label: "Men's Cut" },
    { id: '3', label: "Women's" },
    { id: '4', label: 'Hair & Spa' },
    { id: '5', label: 'Nails' },
    { id: '6', label: 'Makeup' },
];

export interface Salon {
    id: string;
    name: string;
    verified: boolean;
    rating: number;
    distance: string;
    waitingSlots: number;
    maxTime: number;
    liveToken: number;
    isOpen: boolean;
    reviews: number;
    price: string;
    tag: string;
    services?: { id: number; title: string; price: string }[];
    address: string;
    phone: string;
    timings: string;
    image: string;
    latitude?: string | number;
    longitude?: string | number;
}

export interface CarouselItem {
    id: string;
    shopId: string;
    name: string;
    tagline: string;
    offer: string;
    wait: string;
    slots: number;
    liveToken?: number;
    waitingSlots?: number;
    rate: number;
    accent: string;
    gradient: [string, string];
    image: string;
    isOpen: boolean;
}
// ------ Recent Bookings ------------------------------------------------------------------------------------------------------------------
const RECENTS = [
    {
        id: 'r1',
        name: 'Glamour Studio',
        lastService: 'Haircut + Facial',
        lastDate: 'Feb 18, 2026',
        rating: 4.8,
        distance: '1.5 km',
        waitingSlots: 5,
        maxTime: 10,
        liveToken: 14,
        isOpen: true,
        price: '₹299',
        image: 'https://images.unsplash.com/photo-1560066984-138daaa8e25a?w=400&h=280&fit=crop',
        latitude: '25.5941',
        longitude: '85.1376',
    },
    {
        id: 'r2',
        name: 'The Barbers Club',
        lastService: "Men's Cut + Beard Trim",
        lastDate: 'Feb 14, 2026',
        rating: 4.8,
        distance: '1.5 km',
        waitingSlots: 0,
        maxTime: 15,
        liveToken: 22,
        isOpen: true,
        price: '₹199',
        image: 'https://images.unsplash.com/photo-1503951914875--452162b0f3f1?w=400&h=280&fit=crop',
        latitude: '25.6122',
        longitude: '85.1588',
    },
    {
        id: 'r3',
        name: 'Luxe Haven Retreat',
        lastService: 'Bridal Spa Package',
        lastDate: 'Feb 10, 2026',
        rating: 4.9,
        distance: '2.1 km',
        waitingSlots: 3,
        maxTime: 8,
        liveToken: 7,
        isOpen: true,
        price: '₹499',
        image: 'https://images.unsplash.com/photo-1522337360788--8b13dee7a37e?w=400&h=280&fit=crop',
        latitude: '25.6000',
        longitude: '85.1200',
    },
];
type Recent = typeof RECENTS[0];

// -- Helper: Calculate Haversine Distance --
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d.toFixed(1);
};

// -- Helper: Get Waiting Time Display (20-25 min/token) --
const getWaitDisplay = (slots: number) => {
    if (!slots || slots <= 0) return 'No wait';

    const formatTime = (totalMin: number) => {
        const hrs = Math.floor(totalMin / 60);
        const mins = totalMin % 60;
        if (hrs > 0) {
            return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}hr`;
        }
        return `${totalMin}m`;
    };

    const low = slots * 20;
    const high = slots * 25;

    if (low >= 60) {
        return `~${formatTime(low)}-${formatTime(high)}`;
    }
    return `~${low}-${high} min`;
};

// ------ Recent Card (premium re-book card) ------------------------------------------------------------------------------------------
const RecentCard = ({ item, onBook }: { item: Recent, onBook: (salonId: string, salonName: string) => void, key?: string | number }) => (
    <View style={styles.recentCard}>
        {/* Image with scrim */}
        <View style={styles.recentImgWrapper}>
            <Image source={{ uri: item.image }} style={styles.recentImg} resizeMode="cover" />
            <LinearGradient
                colors={['transparent', 'rgba(10,10,20,0.65)']}
                style={styles.cardScrim}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            />
            {/* OPEN pill */}
            <View style={[
                styles.openGlassPill,
                !item.isOpen && { backgroundColor: 'rgba(107,114,128,0.85)' },
            ]}>
                {item.isOpen && <View style={styles.openDot} />}
                <Text style={styles.openPillText}>{item.isOpen ? 'OPEN' : 'CLOSED'}</Text>
            </View>
            {/* RE-BOOK ribbon */}
            <View style={styles.rebookRibbon}>
                <Text style={styles.rebookRibbonText}>RE-BOOK</Text>
            </View>
        </View>

        {/* Accent bar */}
        <View style={[styles.accentBar, { backgroundColor: '#7C3AED' }]} />

        <View style={styles.recentBody}>
            {/* Name */}
            <Text style={styles.recentName} numberOfLines={1}>{item.name}</Text>

            {/* Last visit pill */}
            <View style={styles.recentLastRow}>
                <Clock size={10} color="#7C3AED" strokeWidth={2} />
                <Text style={styles.recentLastText} numberOfLines={1}>{item.lastDate}  -  {item.lastService}</Text>
            </View>

            {/* Stars + distance */}
            <View style={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map(i => <Star key={`star--${i}`} size={10} color="#F59E0B" />)}
                <Text style={styles.ratingNum}> {item.rating}</Text>
                <View style={styles.ratingDot} />
                <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => {
                        if (item.latitude && item.longitude) {
                            const url = Platform.select({
                                ios: `maps:0,0?q=${encodeURIComponent(item.name)}@${item.latitude},${item.longitude}`,
                                android: `geo:0,0?q=${item.latitude},${item.longitude}(${encodeURIComponent(item.name)})`,
                                default: `https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`,
                            });
                            Linking.openURL(url!).catch(err => console.error("Couldn't load page", err));
                        }
                    }}
                    activeOpacity={0.6}
                >
                    <Navigation2 size={10} color="#7C3AED" strokeWidth={2.5} />
                    <Text style={[styles.ratingText, { color: '#7C3AED', fontWeight: '700' }]}> {item.distance}</Text>
                </TouchableOpacity>
            </View>

            {/* Live chips */}
            <View style={styles.badgesRow}>
                <View style={[styles.liveChip, { backgroundColor: '#F0FDF4' }]}>
                    <Timer size={10} color="#16A34A" strokeWidth={2.5} />
                    <Text
                        style={[styles.liveChipText, { color: '#16A34A' }]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                    >
                        Wait: {getWaitDisplay(item.waitingSlots)}
                    </Text>
                </View>
            </View>

            {/* Book Again button */}
            <TouchableOpacity activeOpacity={0.75} style={styles.bookSlotBtn} onPress={() => onBook(item.id, item.name)}>
                <LinearGradient
                    colors={['#6D28D9', '#7C3AED']}
                    style={styles.bookSlotGrad}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <Calendar size={13} color="#fff" strokeWidth={2.5} />
                    <Text style={styles.bookSlotText}>Book Again</Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    </View>
);


// ------ Instant Booking Modal --------------------------------------------------------------------------------------------------------
const InstantBookingModal = ({
    salon,
    visible,
    onClose,
    onBook,
}: {
    salon: CarouselItem | null;
    visible: boolean;
    onClose: () => void;
    onBook: (salonId: string, salonName: string, address?: string) => void;
}) => {
    if (!salon) return null;
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.ibOverlay}>
                <View style={styles.ibCard}>
                    <View style={styles.ibHeaderRow}>
                        <View style={styles.ibChip}>
                            <View style={styles.ibChipDot} />
                            <Text style={styles.ibChipText}>INSTANT BOOKING</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.ibCloseBtn}>
                            <X size={16} color="#555" strokeWidth={2.5} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.ibSalonName}>{salon.name}</Text>
                    <View style={styles.ibStatsRow}>
                        <View style={styles.ibStat}>
                            <Text style={styles.ibStatLabel}>WAIT</Text>
                            <Text style={styles.ibStatValue}>{salon.wait}</Text>
                        </View>
                        <View style={styles.ibDivider} />
                        <View style={styles.ibStat}>
                            <Text style={styles.ibStatLabel}>RATE</Text>
                            <Text style={styles.ibStatValue}>⭐ {salon.rate}</Text>
                        </View>
                    </View>
                    <View style={styles.ibBtnRow}>
                        <TouchableOpacity style={styles.ibViewBtn} onPress={onClose}>
                            <Text style={styles.ibViewBtnText}>VIEW</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.ibBookBtn} activeOpacity={0.85} onPress={() => { onBook(salon.shopId, salon.name, ''); onClose(); }}>
                            <LinearGradient
                                colors={['#6C3FC5', '#4A1A9E']}
                                style={styles.ibBookBtnGrad}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Text style={styles.ibBookBtnText}>BOOK NOW</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};






// ------ Details Modal ------------------------------------------------------------------------------------------------------------------------
const DetailsModal = ({ visible, onClose, salon, onBook }: { visible: boolean; onClose: () => void; salon: Salon; onBook: (sid: string, sname: string, addr: string, initialServices?: any[]) => void }) => {
    const translateY = useRef(new Animated.Value(0)).current;
    const [selectedServices, setSelectedServices] = useState<any[]>([]);

    useEffect(() => {
        if (visible) setSelectedServices([]);
    }, [visible]);

    const toggleService = (svc: any) => {
        setSelectedServices(prev => {
            const exists = prev.find(s => s.id === svc.id);
            if (exists) return prev.filter(s => s.id !== svc.id);
            return [...prev, svc];
        });
    };

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return gestureState.dy > 10;
            },
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    translateY.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 100 || gestureState.vy > 0.5) {
                    Animated.timing(translateY, {
                        toValue: height,
                        duration: 200,
                        useNativeDriver: true,
                    }).start(onClose);
                } else {
                    Animated.spring(translateY, {
                        toValue: 0,
                        useNativeDriver: true,
                    }).start();
                }
            },
        })
    ).current;

    useEffect(() => {
        if (visible) {
            translateY.setValue(0);
        }
    }, [visible]);

    if (!salon) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
            transparent={Platform.OS === 'android'}
        >
            <Animated.View
                style={[
                    styles.modalRoot,
                    { transform: [{ translateY }] }
                ]}
                {...panResponder.panHandlers}
            >
                <StatusBar barStyle="light-content" />
                <ScrollView showsVerticalScrollIndicator={false} bounces={false} contentContainerStyle={{ paddingBottom: 100 }}>
                    {/* Hero Section */}
                    <View style={styles.modalHeroContainer}>
                        <Image source={{ uri: salon.image }} style={styles.modalHeroImage} resizeMode="cover" />
                        <LinearGradient colors={['rgba(0,0,0,0.6)', 'transparent']} style={styles.modalHeroOverlay} />

                        {/* Swipe Handle for Stylist cue */}
                        <View style={styles.modalSwipeHandle} />

                        <View style={[styles.modalHeaderActions, { top: 20 }]}>
                            <TouchableOpacity onPress={onClose} style={styles.modalTransparentBtn}>
                                <X size={20} color="#fff" strokeWidth={2.5} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalTransparentBtn}>
                                <Heart size={20} color="#fff" strokeWidth={2} />
                            </TouchableOpacity>
                        </View>

                        {salon.isOpen && (
                            <View style={styles.modalStatusPill}>
                                <View style={styles.modalStatusDot} />
                                <Text style={styles.modalStatusText}>OPEN NOW</Text>
                            </View>
                        )}
                    </View>

                    {/* Content Section */}
                    <View style={styles.modalContentWrapper}>
                        <View style={styles.modalMainInfo}>
                            <View style={styles.modalNameRow}>
                                <Text style={styles.modalSalonName}>{salon.name}</Text>
                                {salon.verified && <BadgeCheck size={22} color="#3B82F6" fill="#3B82F6" />}
                            </View>

                            <View style={styles.modalMetaRow}>
                                <View style={styles.modalRatingRow}>
                                    <Star size={16} color="#F59E0B" fill="#F59E0B" />
                                    <Text style={styles.modalRatingVal}>{salon.rating}</Text>
                                    <Text style={styles.modalReviewCount}>({salon.reviews} reviews)</Text>
                                </View>
                                <View style={styles.modalDotSeparator} />
                                <Text style={styles.modalDistText}>📍 {salon.distance}</Text>
                            </View>

                            {/* Quick Stats Bar */}
                            <View style={styles.modalStatsBar}>
                                <View style={styles.modalStatItem}>
                                    <View style={[styles.modalStatIcon, { backgroundColor: '#F0FDF4' }]}>
                                        <Timer size={18} color="#16A34A" />
                                    </View>
                                    <View>
                                        <Text style={styles.modalStatLabel}>WAITING</Text>
                                        <Text style={styles.modalStatValue}>{salon.waitingSlots} Slots</Text>
                                    </View>
                                </View>
                                <View style={styles.modalStatDivider} />
                                <View style={styles.modalStatItem}>
                                    <View style={[styles.modalStatIcon, { backgroundColor: '#EFF6FF' }]}>
                                        <Clock size={18} color="#3B82F6" />
                                    </View>
                                    <View>
                                        <Text style={styles.modalStatLabel}>TIMINGS</Text>
                                        <Text style={styles.modalStatValue}>9AM - 8PM</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Location Details */}
                        <View style={styles.modalSection}>
                            <Text style={styles.modalSectionTitle}>Location</Text>
                            <TouchableOpacity style={styles.modalLocationCard} activeOpacity={0.7}>
                                <View style={styles.modalLocIconWrap}>
                                    <MapPin size={20} color="#E91E63" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.modalAddressText} numberOfLines={2}>{salon.address}</Text>
                                    <Text style={styles.modalCityText}>Patna, Bihar</Text>
                                </View>
                                <ChevronRight size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        {/* Popular Services Section */}
                        <View style={styles.modalSection}>
                            <View style={styles.modalSectionHeader}>
                                <Text style={styles.modalSectionTitle}>Popular Services</Text>
                                <Text style={styles.modalRealTimeBadge}>LIVE</Text>
                            </View>
                            <View style={styles.modalServicesGrid}>
                                {salon.services?.map((svc, index) => {
                                    const isSelected = selectedServices.some(s => s.id === svc.id);
                                    return (
                                        <View key={index} style={styles.modalServiceItem}>
                                            <View style={styles.modalServiceInfo}>
                                                <Text style={styles.modalServiceTitle}>{svc.title}</Text>
                                                <Text style={styles.modalServicePrice}>₹{svc.price}</Text>
                                            </View>
                                            <TouchableOpacity
                                                style={[styles.modalAddBtn, isSelected && styles.modalAddedBtn]}
                                                onPress={() => toggleService(svc)}
                                            >
                                                <Text style={[styles.modalAddBtnText, isSelected && styles.modalAddedBtnText]}>
                                                    {isSelected ? 'Remove' : 'Add'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>

                        {/* About/Bio */}
                        <View style={styles.modalSection}>
                            <Text style={styles.modalSectionTitle}>About This Salon</Text>
                            <Text style={styles.modalAboutText}>
                                Experience premium grooming services with our expert professionals. We use high-quality products to ensure you get the best look and feel.
                            </Text>
                        </View>
                    </View>
                </ScrollView>

                {/* Bottom Booking Bar */}
                <View style={styles.modalBottomBar}>
                    <View style={styles.modalPriceInfo}>
                        <Text style={styles.modalPriceLabel}>Starting from</Text>
                        <Text style={styles.modalPriceTotal}>{salon.price}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.modalPrimaryBookBtn}
                        activeOpacity={0.9}
                        onPress={() => onBook(salon.id, salon.name, salon.address, selectedServices)}
                    >
                        <LinearGradient
                            colors={['#E91E63', '#C2185B']}
                            style={styles.modalBookGrad}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.modalBookBtnText}>
                                {selectedServices.length > 0 ? `BOOK ${selectedServices.length} SERVICES` : 'BOOK APPOINTMENT'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </Modal>
    );
};

// ------ Salon Card (premium horizontal portrait card) ------------------------------------------------------
const SalonCard = ({ salon, userCoords, onDetails, onBook, isGrid = false }: { salon: Salon; userCoords: any; onDetails: () => void; onBook: (salonId: string, salonName: string, address?: string, services?: any[]) => void, key?: string | number, isGrid?: boolean }) => {
    const exactDist = React.useMemo(() => {
        if (!userCoords || !salon.latitude || !salon.longitude) return salon.distance;
        const d = calculateDistance(userCoords.latitude, userCoords.longitude, Number(salon.latitude), Number(salon.longitude));
        return d ? `${d} km` : salon.distance;
    }, [userCoords, salon.latitude, salon.longitude, salon.distance]);

    const openMaps = () => {
        const url = Platform.select({
            ios: `maps:0,0?q=${encodeURIComponent(salon.name)}@${salon.latitude},${salon.longitude}`,
            android: `geo:0,0?q=${salon.latitude},${salon.longitude}(${encodeURIComponent(salon.name)})`,
            default: `https://www.google.com/maps/search/?api=1&query=${salon.latitude},${salon.longitude}`,
        });
        Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    };

    return (
        <View style={[styles.card, isGrid && { width: '100%', elevation: 4 }]}>
            {/* Image block with overlay */}
            <View style={styles.cardImgWrapper}>
                <Image source={{ uri: salon.image }} style={[styles.cardImg, isGrid && { width: '100%', height: 100 }]} resizeMode="cover" />

                {/* Dark scrim at bottom */}
                <LinearGradient
                    colors={['transparent', 'rgba(10,10,20,0.72)']}
                    style={styles.cardScrim}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                />

                {/* OPEN/CLOSED glass pill */}
                <View style={[
                    styles.openGlassPill,
                    !salon.isOpen && { backgroundColor: 'rgba(107,114,128,0.85)' },
                    isGrid && { paddingHorizontal: 6, paddingVertical: 3, top: 6, left: 6 }
                ]}>
                    {salon.isOpen && <View style={styles.openDot} />}
                    <Text style={styles.openPillText}>{salon.isOpen ? 'OPEN' : 'CLOSED'}</Text>
                </View>

                {/* Info icon */}
                <TouchableOpacity style={styles.infoBtn} onPress={onDetails}>
                    <Info size={14} color="#fff" strokeWidth={2.5} />
                </TouchableOpacity>

                {/* Price tag floating on image */}
                <View style={styles.priceBubble}>
                    <Text style={styles.priceBubbleText}>{salon.price}</Text>
                </View>
            </View>

            {/* Indigo accent stripe */}
            <View style={styles.accentBar} />

            {/* Card body */}
            <View style={styles.cardBody}>
                <View style={styles.cardNameRow}>
                    <Text style={styles.cardName} numberOfLines={1}>{salon.name}</Text>
                    {salon.verified && <BadgeCheck size={18} color="#2196F3" fill="#2196F3" />}
                </View>

                {/* 5 star-s + distance */}
                <View style={styles.ratingRow}>
                    {[1, 2, 3, 4, 5].map(i => <Star key={`star--${i}`} size={11} color="#F59E0B" fill="#F59E0B" />)}
                    <Text style={styles.ratingNum}> {salon.rating}</Text>
                    <View style={styles.ratingDot} />
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={openMaps} activeOpacity={0.6}>
                        <Navigation2 size={10} color="#1D4ED8" strokeWidth={2.5} />
                        <Text style={[styles.ratingText, { color: '#1D4ED8', fontWeight: '700' }]}> {exactDist}</Text>
                    </TouchableOpacity>
                </View>

                {/* Frosted live info chips */}
                <View style={styles.badgesRow}>
                    <View style={[styles.liveChip, { backgroundColor: '#F0FDF4' }]}>
                        <Timer size={10} color="#16A34A" strokeWidth={2.5} />
                        <Text
                            style={[styles.liveChipText, { color: '#16A34A' }]}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                        >
                            Wait: {getWaitDisplay(salon.waitingSlots)}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Book button with glow */}
            <TouchableOpacity activeOpacity={0.75} hitSlop={{ top: 2, bottom: 2 }} style={styles.bookSlotBtn} onPress={() => onBook(salon.id, salon.name)}>
                <LinearGradient
                    colors={['#1E40AF', '#1D4ED8']}
                    style={styles.bookSlotGrad}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <Calendar size={13} color="#fff" strokeWidth={2.5} />
                    <Text style={styles.bookSlotText}>Book My Slot</Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
};
// ------ Main Screen ----------------------------------------------------------------------------------------------------------------------------
export default function SalonScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const { userLocation, coords } = useLocation();
    const [locationModalVisible, setLocationModalVisible] = useState(false);
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState<FilterOption[]>([]);
    const { user } = useAuth();

    const [activeCategory, setActiveCategory] = useState('1');
    const [salons, setSalons] = useState<Salon[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [featuredSalon, setFeaturedSalon] = useState<CarouselItem | null>(null);
    const [carouselData, setCarouselData] = useState<CarouselItem[]>([]);
    const [ibVisible, setIbVisible] = useState(false);
    const route = useRoute<any>();
    const [recentBookings, setRecentBookings] = useState<any[]>([]);
    const [activeDot, setActiveDot] = useState(0);
    const [searchText, setSearchText] = useState('');

    // -- Distance-based Sorting Logic --
    const sortedSalons = useMemo(() => {
        if (!coords || !salons.length) return salons;
        return [...salons].sort((a, b) => {
            const distA = a.latitude && a.longitude ?
                parseFloat(calculateDistance(coords.latitude, coords.longitude, Number(a.latitude), Number(a.longitude)) || '9999') : 9999;
            const distB = b.latitude && b.longitude ?
                parseFloat(calculateDistance(coords.latitude, coords.longitude, Number(b.latitude), Number(b.longitude)) || '9999') : 9999;
            return distA - distB;
        });
    }, [salons, coords]);

    const sortedRecents = useMemo(() => {
        if (!coords || !recentBookings.length) return recentBookings;
        return [...recentBookings].sort((a, b) => {
            const distA = a.latitude && a.longitude ?
                parseFloat(calculateDistance(coords.latitude, coords.longitude, Number(a.latitude), Number(a.longitude)) || '9999') : 9999;
            const distB = b.latitude && b.longitude ?
                parseFloat(calculateDistance(coords.latitude, coords.longitude, Number(b.latitude), Number(b.longitude)) || '9999') : 9999;
            return distA - distB;
        });
    }, [recentBookings, coords]);

    // -- Scroll-driven header collapse --
    const scrollY = useRef(new Animated.Value(0)).current;

    // ---- Booking Modal State ----
    const [bookingModalVisible, setBookingModalVisible] = useState(false);
    const [bookingShopId, setBookingShopId] = useState('');
    const [bookingShopName, setBookingShopName] = useState('');
    const [bookingShopAddress, setBookingShopAddress] = useState('');

    // ---- Fetch Salons from Database API ----
    useEffect(() => {
        const fetchSalons = async () => {
            try {
                // Ensure the base URL resolves perfectly relative to the centrally configured domain.
                const endpointURL = API_URL.replace('api_auth.php', 'api_shops.php');
                const res = await fetch(endpointURL);
                const raw = await res.text();

                // Hostinger Firewall Anti-Bot Check
                if (raw.trim().startsWith('<')) {
                    console.log('Server HTML Challenge intercepted.', raw.substring(0, 50));
                    return;
                }

                const startIdx = raw.indexOf('{');
                if (startIdx !== -1) {
                    try {
                        const parsed = JSON.parse(raw.substring(startIdx));
                        if (parsed.status === 'ok') {
                            setSalons(parsed.shops);
                        }
                    } catch (e: any) {
                        console.warn('JSON Parse Warning:', e.message);
                    }
                }
            } catch (err: any) {
                // Removed specific error logging
            } finally {
                // Removed setIsLoading(false);
            }
        };

        const fetchCarousel = async () => {
            try {
                const endpointURL = API_URL.replace('api_auth.php', 'api_home.php?action=get_salon_carousel');
                const res = await fetch(endpointURL);
                const raw = await res.text();
                const startIdx = raw.indexOf('{');
                if (startIdx !== -1) {
                    const data = JSON.parse(raw.substring(startIdx));
                    if (data.status === 'ok' && data.carousel && data.carousel.length > 0) {
                        setCarouselData(data.carousel);
                    }
                }
            } catch (err) {
                console.warn('Failed to fetch carousel:', err);
            }
        };

        // Initial fetch
        fetchSalons();
        fetchCarousel();
        checkUnread();

        // ── LIVE POLLING ────────────────────────────────────────────────────────
        // refetch every 15 seconds to keep token numbers live
        const pollInterval = setInterval(() => {
            fetchSalons();
            fetchCarousel();
            checkUnread();
        }, 15000);

        return () => clearInterval(pollInterval);
    }, [API_URL]);

    // ---- Fetch Recent Bookings ----
    const fetchRecents = useCallback(async () => {
        if (!user?.email) return;
        try {
            const res = await fetch(`https://slotb.in/api_bookings.php?email=${user.email}`);
            const data = await res.json();
            if (data.status === 'ok') {
                const uniqueShops: any[] = [];
                const seen = new Set();
                data.bookings.forEach((b: any) => {
                    if (!seen.has(b.shop_id) && uniqueShops.length < 10) {
                        seen.add(b.shop_id);
                        uniqueShops.push({
                            id: String(b.shop_id),
                            name: b.shop_name,
                            lastService: b.service_title || 'Service',
                            lastDate: new Date(b.booking_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
                            image: b.shop_image,
                            address: b.shop_address,
                            liveToken: b.liveToken, // Will be merged if available from salons list
                        });
                    }
                });
                setRecentBookings(uniqueShops);
            }
        } catch (e) {
            console.log('Fetch recents error:', e);
        }
    }, [user?.email]);

    useFocusEffect(
        useCallback(() => {
            fetchRecents();
        }, [fetchRecents])
    );

    // ---- Handle External "Book Again" Nav ----
    useEffect(() => {
        if (route.params?.bookAgainShopId) {
            handleBooking(
                String(route.params.bookAgainShopId),
                route.params.bookAgainShopName,
                route.params.bookAgainAddress
            );
            navigation.setParams({ bookAgainShopId: undefined, bookAgainShopName: undefined, bookAgainAddress: undefined });
        }

        if (route.params?.scanShopId) {
            const sid = String(route.params.scanShopId);
            const shop = salons.find(s => String(s.id) === sid);
            if (shop) {
                handleBooking(shop.id, shop.name, shop.address);
                navigation.setParams({ scanShopId: undefined });
            } else if (salons.length > 0) {
                Alert.alert("Shop Not Found", "The shop you scanned could not be found.");
                navigation.setParams({ scanShopId: undefined });
            }
        }
    }, [route.params, salons]);

    const [unreadCount, setUnreadCount] = useState(0);
    const [isTopSalonsExpanded, setIsTopSalonsExpanded] = useState(false);

    const [initialBookingServices, setInitialBookingServices] = useState<any[]>([]);

    const checkUnread = useCallback(async () => {
        if (!user?.email) { setUnreadCount(0); return; }
        try {
            const url = `https://slotb.in/api_notifications.php?action=get_unread_count&email=${encodeURIComponent(user.email)}&district=${encodeURIComponent(userLocation)}`;
            const res = await fetch(url);
            const text = await res.text();
            const startIdx = text.indexOf('{');
            if (startIdx !== -1) {
                const d = JSON.parse(text.substring(startIdx));
                if (d.status === 'ok') setUnreadCount(d.count);
            }
        } catch (e) { }
    }, [user?.email, userLocation]);

    useFocusEffect(
        useCallback(() => {
            checkUnread();
        }, [checkUnread])
    );

    // ---- Open Booking Modal ----
    const handleBooking = (shopId: string, shopName: string, address?: string, initialServices?: any[]) => {
        setBookingShopId(shopId);
        setBookingShopName(shopName);
        setBookingShopAddress(address || '');
        setInitialBookingServices(initialServices || []);
        setBookingModalVisible(true);
        // If coming from details modal, it might be open
        setModalVisible(false);
    };

    // -- Header collapse interpolations --
    const SCROLL_DISTANCE = 130;
    const EXPANDED_HEADER = 112;
    const COLLAPSED_HEADER = 52;

    const headerHeight = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE],
        outputRange: [EXPANDED_HEADER + insets.top, COLLAPSED_HEADER + insets.top],
        extrapolate: 'clamp',
    });
    const gradientOpacity = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE * 0.65],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });
    const topRowOpacity = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE * 0.6],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });
    const topRowTranslateY = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE * 0.6],
        outputRange: [0, -30],
        extrapolate: 'clamp',
    });
    const searchTranslateY = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE],
        outputRange: [0, -60],
        extrapolate: 'clamp',
    });
    const searchBgOpacity = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE * 0.5],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });
    // ── Search bar animations matching CollapsibleSearchBar in HomeHeader ──
    const searchBarHeight = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE],
        outputRange: [52, 44],
        extrapolate: 'clamp',
    });
    const searchBarRadius = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE],
        outputRange: [16, 22],
        extrapolate: 'clamp',
    });
    const searchBarShadowOpacity = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE],
        outputRange: [0.06, 0.14],
        extrapolate: 'clamp',
    });
    const searchBarElevation = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE],
        outputRange: [2, 5],
        extrapolate: 'clamp',
    });
    const GRAD_H = insets.top + 140;

    const baseFiltered = salons.filter(s => {
        const searchLower = searchText.toLowerCase();
        // Search filter
        const matchesSearch = s.name.toLowerCase().includes(searchLower) ||
            s.address.toLowerCase().includes(searchLower) ||
            (s.services && s.services.some(service => service.title.toLowerCase().includes(searchLower)));

        // Category filter
        // If "All" (id: '1') is selected, return true. Otherwise check if salon tag or services match category label
        const currentCat = CATEGORIES.find(c => c.id === activeCategory);
        let matchesCategory = true;
        if (activeCategory !== '1' && currentCat) {
            const catLabel = currentCat.label.toLowerCase();
            matchesCategory = (s.tag && s.tag.toLowerCase().includes(catLabel)) ||
                (catLabel === "men's cut" && s.tag?.toLowerCase().includes("men")) ||
                (catLabel === "women's" && s.tag?.toLowerCase().includes("women")) ||
                (s.services && s.services.some(service => service.title.toLowerCase().includes(catLabel)));
        }

        return matchesSearch && matchesCategory;
    });

    const filteredSalons = useMemo(() => {
        let list = [...baseFiltered];

        // 1. Initial sorting: Nearest first (Default)
        if (coords) {
            list.sort((a, b) => {
                const distA = a.latitude && a.longitude ?
                    parseFloat(calculateDistance(coords.latitude, coords.longitude, Number(a.latitude), Number(a.longitude)) || '9999') : 9999;
                const distB = b.latitude && b.longitude ?
                    parseFloat(calculateDistance(coords.latitude, coords.longitude, Number(b.latitude), Number(b.longitude)) || '9999') : 9999;
                return distA - distB;
            });
        }

        if (selectedFilters.length > 0) {
            list.sort((a, b) => {
                // We go through each active filter to determine order priority
                for (const filter of selectedFilters) {
                    if (filter === 'location') {
                        const district = userLocation.split(',')[0].trim().toLowerCase();
                        const aMatch = a.address.toLowerCase().includes(district);
                        const bMatch = b.address.toLowerCase().includes(district);

                        if (aMatch && !bMatch) return -1;
                        if (!aMatch && bMatch) return 1;

                        // Tie-break with distance
                        const dA = parseFloat(a.distance) || 999;
                        const dB = parseFloat(b.distance) || 999;
                        if (dA !== dB) return dA - dB;
                    }

                    if (filter === 'ratings') {
                        if (b.rating !== a.rating) return b.rating - a.rating;
                    }

                    if (filter === 'waiting_time') {
                        // Priority to lower maxTime
                        if (a.maxTime !== b.maxTime) return a.maxTime - b.maxTime;
                    }

                    if (filter === 'persons') {
                        // Higher waitingSlots might imply more person-handling capacity or availability
                        if (b.waitingSlots !== a.waitingSlots) return b.waitingSlots - a.waitingSlots;
                    }
                }
                return 0;
            });
        }
        return list;
    }, [baseFiltered, selectedFilters, userLocation]);

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

            {/* -- SALON HEADER (Synced with Home Style) -- */}
            <Animated.View style={[styles.salonHeader, { height: headerHeight }]}>
                {/* Background Gradient Layer like HomeHeader */}
                <Animated.View
                    style={[StyleSheet.absoluteFillObject, { opacity: gradientOpacity }]}
                    pointerEvents="none"
                >
                    <LinearGradient
                        colors={['rgba(179,224,255,0.45)', 'rgba(214,238,255,0.25)', 'transparent'] as any}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={StyleSheet.absoluteFillObject}
                    />
                </Animated.View>

                {/* Content Overlay */}
                <View style={[styles.salonHeaderContent, { paddingTop: insets.top + 4 }]}>
                    {/* -- Top Row: Location pill (left) + Bell (right) -- */}
                    <Animated.View
                        style={[
                            styles.salonTopRow,
                            { opacity: topRowOpacity, transform: [{ translateY: topRowTranslateY }] },
                        ]}
                    >
                        <Pressable
                            style={styles.salonLocationPill}
                            onPress={() => setLocationModalVisible(true)}
                        >
                            <MapPin size={14} color="#1A73E8" strokeWidth={2.2} />
                            <View style={styles.salonLocationText}>
                                <Text style={styles.salonLocationCity} numberOfLines={1}>
                                    {userLocation}
                                </Text>
                                <Text style={styles.salonLocationSub} numberOfLines={1}>
                                    Current
                                </Text>
                            </View>
                            <ChevronDown size={14} color="#6B7280" strokeWidth={2} />
                        </Pressable>

                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Pressable
                                style={styles.salonBellBtn}
                                onPress={() => setFilterModalVisible(true)}
                                hitSlop={8}
                            >
                                <SlidersHorizontal size={18} color={selectedFilters.length > 0 ? '#1D4ED8' : '#374151'} strokeWidth={2} />
                                {selectedFilters.length > 0 && <View style={[styles.salonBellDot, { backgroundColor: '#1D4ED8' }]} />}
                            </Pressable>

                            <Pressable
                                style={styles.salonBellBtn}
                                onPress={() => navigation.navigate('Notifications')}
                                hitSlop={8}
                            >
                                <Bell size={18} color="#374151" strokeWidth={2} />
                                {unreadCount > 0 && <View style={styles.salonBellDot} />}
                            </Pressable>
                        </View>
                    </Animated.View>

                    {/* -- Search Bar (matches HomeScreen CollapsibleSearchBar exactly) -- */}
                    <Animated.View
                        style={[
                            styles.salonSearchSpace,
                            { transform: [{ translateY: searchTranslateY }] },
                        ]}
                    >
                        <Animated.View
                            style={[styles.salonSearchBlurBg, { opacity: searchBgOpacity }]}
                            pointerEvents="none"
                        />
                        {/* Animated bar — height/radius/shadow match CollapsibleSearchBar */}
                        <Animated.View
                            style={[
                                styles.salonSearchWrapper,
                                {
                                    height: searchBarHeight,
                                    borderRadius: searchBarRadius,
                                    shadowOpacity: searchBarShadowOpacity,
                                    elevation: searchBarElevation,
                                },
                            ]}
                        >
                            <Search size={18} color="#9CA3AF" strokeWidth={2} />
                            <TextInput
                                style={styles.searchPlaceholder}
                                placeholder="Search salons, services..."
                                placeholderTextColor="#9CA3AF"
                                value={searchText}
                                onChangeText={setSearchText}
                                selectionColor="#1D4ED8"
                            />
                            {searchText ? (
                                <TouchableOpacity onPress={() => setSearchText('')} style={{ marginRight: 4 }}>
                                    <X size={14} color="#9CA3AF" strokeWidth={2} />
                                </TouchableOpacity>
                            ) : null}
                            <TouchableOpacity
                                style={styles.qrBtn}
                                activeOpacity={0.8}
                                hitSlop={12}
                                onPress={() => navigation.navigate('ScanQR')}
                            >
                                <QrCode size={18} color="#6B7280" strokeWidth={1.8} />
                            </TouchableOpacity>
                        </Animated.View>
                    </Animated.View>
                    <LocationSelectorModal
                        visible={locationModalVisible}
                        onClose={() => setLocationModalVisible(false)}
                    />
                    <SalonFilterModal
                        visible={filterModalVisible}
                        onClose={() => setFilterModalVisible(false)}
                        selectedFilters={selectedFilters}
                        onToggleFilter={(opt) => {
                            setSelectedFilters(prev =>
                                prev.includes(opt) ? prev.filter(x => x !== opt) : [...prev, opt]
                            );
                        }}
                        onApply={() => setFilterModalVisible(false)}
                        onReset={() => setSelectedFilters([])}
                    />
                </View>
            </Animated.View>

            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: EXPANDED_HEADER + insets.top + 4, paddingBottom: 40 }}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
            >

                {/* ---- CATEGORY CHIPS ---- */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipsRow}
                >
                    {CATEGORIES.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            style={[styles.chip, activeCategory === cat.id && styles.chipActive]}
                            onPress={() => setActiveCategory(cat.id)}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.chipText, activeCategory === cat.id && styles.chipTextActive]}>
                                {cat.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* ---- FEATURED CAROUSEL ---- */}
                <View style={styles.carouselSection}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        pagingEnabled={false}
                        decelerationRate="fast"
                        snapToInterval={width - 32}
                        snapToAlignment="start"
                        contentContainerStyle={styles.carouselContent}
                        onScroll={(e) => {
                            const idx = Math.round(e.nativeEvent.contentOffset.x / (width - 32));
                            setActiveDot(Math.max(0, Math.min(idx, carouselData.length - 1)));
                        }}
                        scrollEventThrottle={16}
                    >
                        {carouselData.map((f) => (
                            <View key={f.id} style={styles.heroCard}>
                                <Image source={{ uri: f.image }} style={styles.heroImg} resizeMode="cover" />
                                <LinearGradient
                                    colors={f.gradient}
                                    style={styles.heroOverlay}
                                    start={{ x: 0.1, y: 0 }}
                                    end={{ x: 0, y: 1 }}
                                />

                                {/* Live dot */}
                                <View style={styles.heroLivePill}>
                                    <View style={styles.heroLiveDot} />
                                    <Text style={styles.heroLiveText}>{f.isOpen ? 'Open Now' : 'Closed'}</Text>
                                </View>

                                {/* Bottom content */}
                                <View style={styles.heroContent}>
                                    <Text style={styles.heroName}>{f.name}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                                        <Text style={styles.heroOffer}>{f.offer}</Text>
                                        <Text style={[styles.heroOffer, { fontSize: 13, opacity: 0.8, marginLeft: 8 }]}>• {f.tagline}</Text>
                                    </View>
                                    <View style={styles.heroRow}>
                                        <View style={styles.heroMeta}>
                                            <Star size={11} color="#FCD34D" fill="#FCD34D" />
                                            <Text style={styles.heroMetaText}>
                                                {f.rate}  •  {getWaitDisplay(f.waitingSlots || 0)}  •  Token #{f.liveToken || 0}
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            style={styles.heroBookBtn}
                                            activeOpacity={0.75}
                                            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                                            onPress={() => { setFeaturedSalon(f); setIbVisible(true); }}
                                        >
                                            <Text style={styles.heroBookBtnText}>Book Now</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </ScrollView>

                    <View style={styles.carouselDots}>
                        {carouselData.map((f, i) => (
                            <View key={i} style={[
                                styles.cDot,
                                i === activeDot && { width: 20, backgroundColor: carouselData[activeDot].accent },
                            ]} />
                        ))}
                    </View>
                </View>

                {/* ---- SECTION HEADER ---- */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Top Salons Near You</Text>
                    <TouchableOpacity onPress={() => setIsTopSalonsExpanded(!isTopSalonsExpanded)}>
                        <Text style={styles.seeAll}>{isTopSalonsExpanded ? 'Show Less' : 'See All'}</Text>
                    </TouchableOpacity>
                </View>

                {/* ---- SALON CARDS ---- */}
                {!isTopSalonsExpanded ? (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.cardsRow}
                        decelerationRate="fast"
                        snapToInterval={CARD_W + 14}
                        snapToAlignment="start"
                        disableIntervalMomentum={true}
                    >
                        {filteredSalons.map((salon) => (
                            <SalonCard
                                key={salon.id}
                                salon={salon}
                                userCoords={coords}
                                onDetails={() => { setSelectedSalon(salon); setModalVisible(true); }}
                                onBook={handleBooking}
                            />
                        ))}
                    </ScrollView>
                ) : (
                    <View style={styles.expandedGrid}>
                        {filteredSalons.map((salon) => (
                            <View key={salon.id} style={styles.gridItem}>
                                <SalonCard
                                    salon={salon}
                                    userCoords={coords}
                                    onDetails={() => { setSelectedSalon(salon); setModalVisible(true); }}
                                    onBook={handleBooking}
                                    isGrid={true}
                                />
                            </View>
                        ))}
                    </View>
                )}

                {/* ---- SECTION: BOOK FROM RECENTS ---- */}
                <View style={[styles.sectionHeader, { marginTop: 16 }]}>
                    <View>
                        <Text style={styles.sectionTitle}>Book from Recents</Text>
                        <Text style={styles.sectionSubtitle}>Your last visited salons</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('MyBookings')}><Text style={styles.seeAll}>See All </Text></TouchableOpacity>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.recentsRow}
                    decelerationRate="fast"
                    snapToInterval={RECENT_W + 14}
                    snapToAlignment="start"
                    disableIntervalMomentum={true}
                >
                    {sortedRecents.map((item) => {
                        // Merge with live data if salon exists in main list
                        const liveSalon = salons.find(s => s.id === item.id);
                        const mergedItem = {
                            ...item,
                            rating: liveSalon?.rating || 4.5,
                            distance: liveSalon?.latitude && coords ?
                                `${calculateDistance(coords.latitude, coords.longitude, Number(liveSalon.latitude), Number(liveSalon.longitude))} km` :
                                item.distance || '--- km',
                            latitude: liveSalon?.latitude,
                            longitude: liveSalon?.longitude,
                            waitingSlots: liveSalon?.waitingSlots ?? 0,
                            maxTime: liveSalon?.maxTime ?? 0,
                            liveToken: liveSalon?.liveToken ?? 0,
                            isOpen: liveSalon?.isOpen ?? true,
                            price: liveSalon?.price || '₹--',
                        };
                        return (
                            <View key={item.id}>
                                <RecentCard item={mergedItem} onBook={handleBooking} />
                            </View>
                        );
                    })}
                </ScrollView>
            </Animated.ScrollView >

            {/* ---- DETAILS MODAL ---- */}
            < DetailsModal
                salon={selectedSalon}
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onBook={(id, name) => {
                    setModalVisible(false);
                    handleBooking(id, name, selectedSalon?.address);
                }}
            />

            {/* ---- INSTANT BOOKING MODAL ---- */}
            <InstantBookingModal
                salon={featuredSalon}
                visible={ibVisible}
                onClose={() => setIbVisible(false)}
                onBook={handleBooking}
            />

            {/* ---- FULL BOOKING MODAL ---- */}
            <BookingModal
                visible={bookingModalVisible}
                onClose={() => setBookingModalVisible(false)}
                shopId={bookingShopId}
                shopName={bookingShopName}
                shopAddress={bookingShopAddress}
                user={user}
                navigation={navigation}
                initialSelectedServices={initialBookingServices}
            />
        </View >
    );
}

// ------ Styles --------------------------------------------------------------------------------------------------------------------------------------
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F6F7FA' },

    // -- Salon Header (Light theme - matches screenshot) -------------------
    salonHeader: {
        position: 'absolute', top: 0, left: 0, right: 0,
        zIndex: 100,
    },
    salonHeaderShadowLine: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 1, backgroundColor: 'rgba(0,0,0,0.06)',
    },
    salonHeaderContent: {
        flex: 1, paddingHorizontal: 16,
    },
    salonTopRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 6,
    },
    salonLocationPill: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 22, paddingHorizontal: 12, paddingVertical: 7,
        gap: 6,
        flexShrink: 1,
        maxWidth: '72%',
    },
    salonLocationText: { flexShrink: 1 },
    salonLocationCity: { fontSize: 14, fontWeight: '700', color: '#111827', letterSpacing: 0.1 },
    salonLocationSub: { fontSize: 10, color: '#6B7280', fontWeight: '500' },
    salonBellBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center', justifyContent: 'center',
    },
    salonBellDot: {
        position: 'absolute', top: 8, right: 9,
        width: 7, height: 7, borderRadius: 4,
        backgroundColor: '#EF4444', borderWidth: 1.5, borderColor: 'rgba(235, 235, 235, 0.1)',
    },
    salonSearchSpace: { width: '100%' },
    salonSearchBlurBg: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(246,247,250,0.96)',
        borderRadius: 16, top: -4, bottom: -4,
    },
    salonSearchWrapper: {
        // Static values — borderRadius/height/shadowOpacity/elevation driven by animated interpolations
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1, borderColor: '#E8ECF0',
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 8,
        overflow: 'hidden',
        paddingHorizontal: 14,
        gap: 10,
    },
    expandedGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        justifyContent: 'space-between',
        gap: 12,
    },
    gridItem: {
        width: (width - 44) / 2, // 2 columns with gaps
        marginBottom: 12,
    },

    // Header -- legacy (kept for reference, not used by new header)
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingBottom: 10, backgroundColor: '#F6F7FA',
    },
    locationPill: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#ECECEC', borderRadius: 22,
        paddingHorizontal: 12, paddingVertical: 7, gap: 5,
    },
    locationText: { fontSize: 14, fontWeight: '600', color: '#222', marginLeft: 2 },
    locationChevron: { fontSize: 12, color: '#555', marginLeft: 2 },
    bellBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#ECECEC', alignItems: 'center', justifyContent: 'center',
    },
    bellDot: {
        position: 'absolute', top: 8, right: 8,
        width: 8, height: 8, borderRadius: 4,
        backgroundColor: '#FF3B30', borderWidth: 1.5, borderColor: '#F6F7FA',
    },

    // Search sticky wrapper (becomes elevated header on scroll)
    searchStickyWrap: {
        backgroundColor: '#F6F7FA',
        zIndex: 10,
    },
    // Search -- identical to HomeScreen
    searchWrapper: {
        flexDirection: 'row', alignItems: 'center',
        marginHorizontal: 16, marginBottom: 14,
        backgroundColor: '#fff', borderRadius: 28,
        paddingHorizontal: 14, paddingVertical: 11,
    },
    searchIcon: { marginRight: 8 },
    searchPlaceholder: { flex: 1, fontSize: 14, color: '#111827', fontWeight: '400', paddingVertical: 0 },
    qrBtn: { padding: 2 },

    // Category chips
    chipsRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 14 },
    chip: {
        paddingHorizontal: 16, paddingVertical: 8,
        backgroundColor: '#fff', borderRadius: 30,
        borderWidth: 1, borderColor: '#E5E7EB',
    },
    chipActive: { backgroundColor: '#E91E63', borderColor: '#E91E63' },
    chipText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
    chipTextActive: { color: '#fff' },

    // Featured carousel -- minimal, clean
    carouselSection: { marginBottom: 20 },
    carouselContent: { paddingHorizontal: 16, gap: 12 },
    heroCard: {
        width: width - 32,
        height: 172,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#1E1040',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.28,
        shadowRadius: 18,
        elevation: 10,
    },
    heroImg: { position: 'absolute', width: '100%', height: '100%' },
    heroOverlay: { position: 'absolute', width: '100%', height: '100%' },
    heroLivePill: {
        position: 'absolute', top: 12, left: 12,
        flexDirection: 'row', alignItems: 'center', gap: 5,
        backgroundColor: 'rgba(0,0,0,0.35)',
        borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
    },
    heroLiveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80' },
    heroLiveText: { fontSize: 10, fontWeight: '700', color: '#fff', letterSpacing: 0.4 },
    heroContent: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: 14,
        paddingBottom: 14,
    },
    heroName: { fontSize: 17, fontWeight: '800', color: '#fff', marginBottom: 2, letterSpacing: 0.2 },
    heroOffer: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginBottom: 6, fontWeight: '500' },
    heroRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1, marginRight: 4 },
    heroMetaText: { fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: '500', flexShrink: 1 },
    heroBookBtn: {
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 7,
        marginLeft: 8,
    },
    heroBookBtnText: { fontSize: 12, fontWeight: '800', color: '#1E1040' },
    carouselDots: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 10 },
    cDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D1C4E9' },
    cDotActive: {},

    // unused stubs
    featuredCard: { display: 'none' },
    featuredLeft: {}, featuredName: {}, featuredDiscount: {},
    featuredBookBtn: {}, featuredBookBtnText: {}, featuredRight: {}, featuredImgCircle: {},
    heroBadgeRow: {}, heroPremiumBadge: {}, heroPremiumText: {}, heroLiveBadge: {},
    heroTagline: {}, heroStarsRow: {}, heroRating: {}, heroOfferPill: {}, heroOfferText: {},
    heroStatsRow: {}, heroStat: {}, heroStatDivider: {}, heroStatText: {}, heroStatBold: {},
    heroBookBtnInner: {}, heroBookArrow: {}, heroBookArrowText: {},

    // Section header
    sectionHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, marginBottom: 12,
    },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A2E' },
    seeAll: { fontSize: 13, fontWeight: '700', color: '#E91E63' },

    // ---- Premium card styles ------------------------------------------------------------------------------------------------------
    cardsRow: { paddingHorizontal: 16, gap: 14, paddingBottom: 4 },
    card: {
        width: CARD_W,
        backgroundColor: '#fff',
        borderRadius: 22,
        overflow: 'hidden',
        shadowColor: '#1E3A8A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.14,
        shadowRadius: 20,
        elevation: 8,
    },
    cardImgWrapper: { position: 'relative' },
    cardImg: { width: CARD_W, height: 120 },
    cardScrim: {
        position: 'absolute', left: 0, right: 0, bottom: 0,
        height: 50,
    },
    openGlassPill: {
        position: 'absolute', top: 10, left: 10,
        flexDirection: 'row', alignItems: 'center', gap: 5,
        backgroundColor: 'rgba(16,185,129,0.88)',
        borderRadius: 20, paddingHorizontal: 9, paddingVertical: 5,
    },
    openDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
    openPillText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.6 },
    infoBtn: {
        position: 'absolute', top: 10, right: 10,
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
        alignItems: 'center', justifyContent: 'center',
    },
    priceBubble: {
        position: 'absolute', bottom: 10, right: 10,
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
    },
    priceBubbleText: { fontSize: 12, fontWeight: '800', color: '#1E3A8A' },
    accentBar: {
        height: 3,
        backgroundColor: '#1D4ED8',
        marginHorizontal: 0,
    },
    cardBody: { padding: 12, paddingTop: 10 },
    cardNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
    cardName: { fontSize: 15, fontWeight: '800', color: '#0F172A', flex: 1 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 8 },
    ratingNum: { fontSize: 12, fontWeight: '700', color: '#0F172A', marginLeft: 2 },
    ratingDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#CBD5E1', marginHorizontal: 4 },
    ratingText: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },
    badgesRow: { flexDirection: 'row', gap: 5, marginBottom: 8, flexWrap: 'wrap' },
    liveChip: {
        flexDirection: 'row', alignItems: 'center', gap: 3,
        borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4,
    },
    liveChipText: { fontSize: 10, fontWeight: '700' },
    tokenRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
    tokenText: { fontSize: 11, color: '#64748B' },
    tokenNum: { fontWeight: '800', color: '#1D4ED8' },
    bookSlotBtn: { borderRadius: 30, overflow: 'hidden' },
    bookSlotGrad: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
        paddingVertical: 10, borderRadius: 30,
        shadowColor: '#1D4ED8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
    bookSlotText: { fontSize: 13, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },

    // old unused badge styles kept for modal compat
    slotBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#16A34A', borderRadius: 20,
        paddingHorizontal: 8, paddingVertical: 5,
    },
    slotBadgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },
    maxTimeBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#DC2626', borderRadius: 20,
        paddingHorizontal: 8, paddingVertical: 5,
    },
    maxTimeBadgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },

    // List cards (not used but kept for compat)
    listCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#fff', marginHorizontal: 16,
        marginBottom: 10, borderRadius: 16, overflow: 'hidden',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    },
    listCardImg: { width: 80, height: 80 },
    listCardBody: { flex: 1, paddingHorizontal: 12, paddingVertical: 10 },
    listCardName: { fontSize: 14, fontWeight: '800', color: '#1A1A2E', flex: 1 },
    listBadgesRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
    listBookBtn: { paddingRight: 12, borderRadius: 20, overflow: 'hidden' },
    listBookGrad: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
    listBookText: { fontSize: 12, fontWeight: '800', color: '#fff' },

    // ---- Modal ----------------------------------------------------------------------------------------------------------------------------------
    modalRoot: { flex: 1, backgroundColor: '#fff' },
    modalHeroContainer: { height: height * 0.35, position: 'relative' },
    modalHeroImage: { width: '100%', height: '100%' },
    modalHeroOverlay: { ...StyleSheet.absoluteFillObject },
    modalHeaderActions: {
        position: 'absolute', left: 20, right: 20,
        flexDirection: 'row', justifyContent: 'space-between',
    },
    modalCircularBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
    },
    modalStatusPill: {
        position: 'absolute', bottom: 20, left: 20,
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    },
    modalStatusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80' },
    modalStatusText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

    modalContentWrapper: {
        backgroundColor: '#fff',
        marginTop: -30,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingTop: 24,
    },
    modalMainInfo: { paddingHorizontal: 20 },
    modalNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    modalSalonName: { fontSize: 24, fontWeight: '900', color: '#1A1A2E', letterSpacing: -0.5 },
    modalMetaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    modalRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    modalRatingVal: { fontSize: 14, fontWeight: '800', color: '#1A1A2E' },
    modalReviewCount: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
    modalDotSeparator: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', marginHorizontal: 12 },
    modalDistText: { fontSize: 13, color: '#6B7280', fontWeight: '600' },

    modalStatsBar: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 20, padding: 16,
        borderWidth: 1, borderColor: '#F3F4F6',
    },
    modalStatItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
    modalStatIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    modalStatLabel: { fontSize: 9, fontWeight: '800', color: '#9CA3AF', marginBottom: 2 },
    modalStatValue: { fontSize: 13, fontWeight: '700', color: '#1A1A2E' },
    modalStatDivider: { width: 1, height: 30, backgroundColor: '#E5E7EB', marginHorizontal: 10 },

    modalSection: { paddingHorizontal: 20, marginTop: 32 },
    modalSectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    modalSectionTitle: { fontSize: 17, fontWeight: '800', color: '#1A1A2E' },
    modalViewAll: { fontSize: 13, fontWeight: '700', color: '#E91E63' },

    modalLocationCard: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        padding: 14, backgroundColor: '#FFF',
        borderRadius: 18, borderWidth: 1, borderColor: '#F3F4FB',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
    },
    modalLocIconWrap: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center' },
    modalAddressText: { fontSize: 14, color: '#4B5563', lineHeight: 20, fontWeight: '500' },
    modalCityText: { fontSize: 12, color: '#9CA3AF', marginTop: 2, fontWeight: '600' },

    modalSwipeHandle: {
        width: 40, height: 5, backgroundColor: 'rgba(255,255,255,0.4)',
        borderRadius: 3, position: 'absolute', top: 10, alignSelf: 'center', zIndex: 10,
    },
    modalTransparentBtn: {
        width: 42, height: 42, borderRadius: 21,
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignItems: 'center', justifyContent: 'center',
    },
    modalRealTimeBadge: {
        fontSize: 10, fontWeight: '800', color: '#10B981',
        backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 4,
        borderRadius: 6,
    },
    modalServicesGrid: { gap: 14 },
    modalServiceItem: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#F9FAFB', padding: 16, borderRadius: 16,
        borderWidth: 1, borderColor: '#F3F4F6',
    },
    modalServiceInfo: { flex: 1, gap: 2 },
    modalServiceTitle: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
    modalServicePrice: { fontSize: 14, fontWeight: '800', color: '#10B981', marginTop: 2 },
    modalAddBtn: {
        backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB',
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
    },
    modalAddBtnText: { fontSize: 13, fontWeight: '800', color: '#1A1A2E' },
    modalAddedBtn: {
        backgroundColor: '#E91E63',
        borderColor: '#E91E63',
    },
    modalAddedBtnText: {
        color: '#FFFFFF',
    },

    modalAboutText: { fontSize: 14, color: '#6B7280', lineHeight: 22, fontWeight: '500' },

    modalBottomBar: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 34,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        borderTopWidth: 1, borderTopColor: '#F3F4F6',
    },
    modalPriceInfo: { flex: 0.4 },
    modalPriceLabel: { fontSize: 11, fontWeight: '600', color: '#9CA3AF', marginBottom: 2 },
    modalPriceTotal: { fontSize: 20, fontWeight: '800', color: '#1A1A2E' },
    modalPrimaryBookBtn: { flex: 0.6, height: 54, borderRadius: 16, overflow: 'hidden' },
    modalBookGrad: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
    modalBookBtnText: { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },

    // ---- Instant booking modal styles ------------------------------------------------------------------------------------
    ibOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end', paddingHorizontal: 16, paddingBottom: 32,
    },
    ibCard: {
        backgroundColor: '#fff', borderRadius: 24, padding: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1, shadowRadius: 20, elevation: 10,
    },
    ibHeaderRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12,
    },
    ibChip: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: '#EDE7F6', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
    },
    ibChipDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#7C3AED' },
    ibChipText: { fontSize: 11, fontWeight: '800', color: '#7C3AED', letterSpacing: 0.8 },
    ibCloseBtn: {
        width: 30, height: 30, borderRadius: 15,
        backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center',
    },
    ibSalonName: { fontSize: 22, fontWeight: '900', color: '#1A1A2E', marginBottom: 18 },
    ibStatsRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#FAFAFA', borderRadius: 16,
        padding: 16, marginBottom: 20,
    },
    ibStat: { flex: 1, alignItems: 'center' },
    ibStatLabel: { fontSize: 10, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1, marginBottom: 6 },
    ibStatValue: { fontSize: 24, fontWeight: '900', color: '#F59E0B' },
    ibDivider: { width: 1, height: 40, backgroundColor: '#E5E7EB', marginHorizontal: 8 },
    ibBtnRow: { flexDirection: 'row', gap: 10 },
    ibViewBtn: {
        flex: 1, borderWidth: 1.5, borderColor: '#D1D5DB',
        borderRadius: 30, paddingVertical: 14,
        alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff',
    },
    ibViewBtnText: { fontSize: 14, fontWeight: '800', color: '#374151' },
    ibBookBtn: { flex: 2, borderRadius: 30, overflow: 'hidden' },
    ibBookBtnGrad: { paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
    ibBookBtnText: { fontSize: 14, fontWeight: '800', color: '#fff' },

    // ---- Section subtitle ----------------------------------------------------------------------------------------------------------
    sectionSubtitle: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },

    // ---- Book from Recents cards ----------------------------------------------------------------------------------------------
    recentsRow: { paddingHorizontal: 16, gap: 14, paddingBottom: 4 },
    recentCard: {
        width: RECENT_W,
        backgroundColor: '#fff',
        borderRadius: 22,
        overflow: 'hidden',
        shadowColor: '#6D28D9',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.14,
        shadowRadius: 20,
        elevation: 8,
    },
    recentImgWrapper: { position: 'relative' },
    recentImg: { width: RECENT_W, height: 120 },
    recentBody: { padding: 12, paddingTop: 10 },
    recentName: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
    recentLastRow: {
        flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 5,
        backgroundColor: '#F5F3FF', borderRadius: 20,
        paddingHorizontal: 8, paddingVertical: 4,
        alignSelf: 'flex-start',
    },
    recentLastText: { fontSize: 10, color: '#6D28D9', fontWeight: '600', flexShrink: 1 },
    rebookRibbon: {
        position: 'absolute', bottom: 10, right: 10,
        backgroundColor: 'rgba(109,40,217,0.88)',
        borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
    },
    rebookRibbonText: { fontSize: 9, fontWeight: '900', color: '#fff', letterSpacing: 0.8 },
});




