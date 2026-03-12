import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    FlatList,
    Animated,
    TouchableOpacity,
    Dimensions,
    NativeSyntheticEvent,
    NativeScrollEvent,
    Image,
    Modal,
    StatusBar,
    Share,
    Pressable,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import {
    Zap,
    Wrench,
    Scissors,
    Dumbbell,
    Wifi,
    Car,
    Shirt,
    Sparkles,
    ShoppingBag,
    BookOpen,
    Home,
    Coffee,
    ArrowRight,
    Star,
    Stethoscope,
    ChevronDown,
    ChevronUp,
    MapPin,
    Bell,
    ShieldCheck,
    ChevronRight,
} from 'lucide-react-native';
import Reanimated, { FadeIn, FadeInDown, useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { BookingModal } from '../components/BookingModal';

import HomeHeader, { CardColorConfig } from '../components/HomeHeader';

const { width: W } = Dimensions.get('window');
const CARD_W = W - 32;      // card width = screen width minus 16px each side
const REEL_H = 180;         // reel card height in horizontal carousel
const REEL_CARD_W = W * 0.68; // reel card width in carousel

// ─── Card definitions ─────────────────────────────────────────────────────────
const CARDS = [
    {
        id: 'salon',
        title: 'SlotB Salon & Parlour',
        subtitle: 'Discover top-rated salons\n& parlours near you',
        badge: 'Book Your Token Instantly',
        cta: 'Find Nearby',
        emoji: '💆',
        floatLabel: 'Zero Wait',
        cardGrad: ['#1A0D08', '#3D2010', '#7A4428'] as [string, string, string],
        accentColor: '#F0C98A',
        ctaTextColor: '#1A0D08',
        floatColor: '#3D2010',
        dotColor: '#F0C98A',
        headerGrad: ['#160A04', '#3D2010', '#7A4428'] as [string, string, string],
        headerAccent: '#F0C98A',
    },
    {
        id: 'services',
        title: 'SlotB Home-Service',
        subtitle: 'Electricians, Plumbers &\nlocal pros at your doorstep',
        badge: 'Trusted Local Experts',
        cta: 'Book Now',
        emoji: '🔧',
        floatLabel: '50+ Services',
        cardGrad: ['#0A0A1A', '#0D1B4B', '#1A0050'] as [string, string, string],
        accentColor: '#7C3AFF',
        ctaTextColor: '#fff',
        floatColor: '#1A0050',
        dotColor: '#7C3AFF',
        headerGrad: ['#0D1445', '#0D1B4B', '#1A0050'] as [string, string, string],
        headerAccent: '#7C3AFF',
    },
    {
        id: 'doctor',
        title: 'SlotB Medical',
        subtitle: 'Book nearby hospitals\n& clinics around you',
        badge: 'Verified Local Doctors',
        cta: 'Find Doctors',
        emoji: '🩺',
        floatLabel: 'Walk-in / Online',
        cardGrad: ['#042F2E', '#0F766E', '#14B8A6'] as [string, string, string],
        accentColor: '#5EEAD4',
        ctaTextColor: '#042F2E',
        floatColor: '#0F766E',
        dotColor: '#14B8A6',
        headerGrad: ['#042F2E', '#0F766E', '#14B8A6'] as [string, string, string],
        headerAccent: '#5EEAD4',
    },
    {
        id: 'gym',
        title: 'SlotB Gym',
        subtitle: 'Find gyms & trainers\nin your neighbourhood',
        badge: 'Instant Token Booking',
        cta: 'Explore Gyms',
        emoji: '🏋️',
        floatLabel: 'Day Pass Available',
        cardGrad: ['#212121', '#37474F', '#6D4C00'] as [string, string, string],
        accentColor: '#FFD740',
        ctaTextColor: '#1A1000',
        floatColor: '#5D4037',
        dotColor: '#FFD740',
        headerGrad: ['#1A1A1A', '#37474F', '#4E342E'] as [string, string, string],
        headerAccent: '#FFD740',
    },
    {
        id: 'grocery',
        title: 'SlotB Grocery',
        subtitle: 'Order from local kirana\n& fresh produce stores',
        badge: 'Hyperlocal Delivery',
        cta: 'Order Now',
        emoji: '🛒',
        floatLabel: 'From Your Area',
        cardGrad: ['#022C22', '#064E3B', '#065F46'] as [string, string, string],
        accentColor: '#34D399',
        ctaTextColor: '#022C22',
        floatColor: '#064E3B',
        headerGrad: ['#022C22', '#064E3B', '#065F46'] as [string, string, string],
        headerAccent: '#34D399',
        dotColor: '#10B981',
    },
];

// ─── Explore grid data ────────────────────────────────────────────────────────
const EXPLORE = [
    { label: 'Electrician', Icon: Zap, color: '#1565C0', bg: '#E3F2FD' },
    { label: 'Plumber', Icon: Wrench, color: '#00695C', bg: '#E0F2F1' },
    { label: 'Salon', Icon: Scissors, color: '#AD1457', bg: '#FCE4EC' },
    { label: 'Gym', Icon: Dumbbell, color: '#E65100', bg: '#FBE9E7' },
    { label: 'Internet', Icon: Wifi, color: '#0277BD', bg: '#E1F5FE' },
    { label: 'Car Wash', Icon: Car, color: '#B71C1C', bg: '#FFEBEE' },
    { label: 'Laundry', Icon: Shirt, color: '#6A1B9A', bg: '#F3E5F5' },
    { label: 'Beauty', Icon: Sparkles, color: '#C2185B', bg: '#FCE4EC' },
    { label: 'Grocery', Icon: ShoppingBag, color: '#2E7D32', bg: '#E8F5E9' },
    { label: 'Tutor', Icon: BookOpen, color: '#283593', bg: '#E8EAF6' },
    { label: 'Home Repair', Icon: Home, color: '#E64A19', bg: '#FBE9E7' },
    { label: 'Café', Icon: Coffee, color: '#4E342E', bg: '#EFEBE9' },
];

// ─── Daily Needs (Grocery) ────────────────────────────────────────────────────
const DAILY_NEEDS = [
    { id: 'd1', label: 'Vegetables', emoji: '🥦', bg: '#ECFDF5', color: '#059669' },
    { id: 'd2', label: 'Dairy', emoji: '🥛', bg: '#EFF6FF', color: '#1D4ED8' },
    { id: 'd3', label: 'Fruits', emoji: '🍎', bg: '#FFF1F2', color: '#E11D48' },
    { id: 'd4', label: 'Bakery', emoji: '🥖', bg: '#FFFBEB', color: '#D97706' },
    { id: 'd5', label: 'Snacks', emoji: '🍿', bg: '#F5F3FF', color: '#7C3AED' },
    { id: 'd6', label: 'Beverages', emoji: '☕', bg: '#FDF4FF', color: '#A21CAF' },
];

// ─── Nearby providers ─────────────────────────────────────────────────────────
const NEARBY = [
    { name: 'Sharma Electricals', rating: '4.8', dist: '0.3 km', tag: 'Services', image: { uri: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=300&q=80' } },
    { name: 'Radha Beauty Salon', rating: '4.9', dist: '0.4 km', tag: 'Salon', image: { uri: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300&q=80' } },
    { name: 'FitLife Gym', rating: '4.7', dist: '0.5 km', tag: 'Gym', image: { uri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&q=80' } },
    { name: 'Quick Plumber Pro', rating: '4.6', dist: '0.6 km', tag: 'Services', image: { uri: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80' } },
];

// ─── Top Salons Near You ───────────────────────────────────────────────────────
const TOP_SALONS = [
    {
        id: '1',
        name: 'Luxe Haven Retreat',
        rating: '4.8',
        reviews: 245,
        wait: '20 min wait',
        dist: '1.2 km',
        price: '₹499',
        isOpen: true,
        image: { uri: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80' },
    },
    {
        id: '2',
        name: 'Glamour Studio',
        rating: '4.7',
        reviews: 189,
        wait: '10 min wait',
        dist: '0.8 km',
        price: '₹349',
        isOpen: true,
        image: { uri: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80' },
    },
    {
        id: '3',
        name: 'Urban Cuts Salon',
        rating: '4.6',
        reviews: 312,
        wait: '30 min wait',
        dist: '2.1 km',
        price: '₹249',
        isOpen: false,
        image: { uri: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600&q=80' },
    },
    {
        id: '4',
        name: 'Bliss Beauty Lounge',
        rating: '4.9',
        reviews: 98,
        wait: '5 min wait',
        dist: '0.5 km',
        price: '₹599',
        isOpen: true,
        image: { uri: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=600&q=80' },
    },
];

// ── Helper: Calculate Haversine Distance ──
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

// ── Auto-scroll config ────────────────────────────────────────────────────────
const AUTO_SCROLL_INTERVAL = 2500; // 2.5 seconds

const FloatingMascot = ({ source, style }: { source: any, style: any }) => {
    const translateY = useSharedValue(0);

    React.useEffect(() => {
        translateY.value = withRepeat(
            withSequence(
                withTiming(-6, { duration: 2500 }),
                withTiming(0, { duration: 2500 })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <Reanimated.View style={[style, animatedStyle]}>
            <Image source={source} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
        </Reanimated.View>
    );
};

export default function HomeScreen() {
    const insets = useSafeAreaInsets();
    const [activeIndex, setActiveIndex] = useState(0);
    const [topSalons, setTopSalons] = useState<any[]>(TOP_SALONS);

    const navigation = useNavigation<any>();

    // Booking Modal State
    const [bookingVisible, setBookingVisible] = useState(false);
    const [selectedShop, setSelectedShop] = useState<any>(null);

    // Horizontal scroll for carousel card transitions
    const scrollX = useRef(new Animated.Value(0)).current;
    // Vertical scroll for header collapse
    const scrollY = useRef(new Animated.Value(0)).current;

    // FlatList ref for auto-scroll
    const carouselRef = useRef<any>(null);
    const autoScrollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
    const isUserTouching = useRef(false);

    // Header expanded height (matching HomeHeader EXPANDED_HEADER + insets.top)
    const HEADER_H = 185 + insets.top;

    // ── Auto-scroll logic ─────────────────────────────────────────
    const startAutoScroll = useCallback(() => {
        if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
        autoScrollTimer.current = setInterval(() => {
            if (isUserTouching.current) return;
            setActiveIndex(prev => {
                const next = (prev + 1) % CARDS.length;
                carouselRef.current?.scrollToOffset({
                    offset: next * CARD_W,
                    animated: true,
                });
                return next;
            });
        }, AUTO_SCROLL_INTERVAL);
    }, []);

    const { user } = useAuth();
    const { userLocation, coords } = useLocation();

    useEffect(() => {
        if (user?.email && userLocation && userLocation !== 'Locating...') {
            fetch('https://slotb.in/api_notifications.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'sync_location',
                    email: user.email,
                    district: userLocation
                })
            }).catch(e => console.log('Location sync error:', e));
        }
    }, [user?.email, userLocation]);

    // Memoized sorted salons based on distance
    const sortedSalons = useMemo(() => {
        if (!coords || !topSalons.length) return topSalons;

        return [...topSalons].sort((a, b) => {
            const distA = a.latitude && a.longitude ?
                parseFloat(calculateDistance(coords.latitude, coords.longitude, Number(a.latitude), Number(a.longitude)) || '9999') : 9999;
            const distB = b.latitude && b.longitude ?
                parseFloat(calculateDistance(coords.latitude, coords.longitude, Number(b.latitude), Number(b.longitude)) || '9999') : 9999;
            return distA - distB;
        });
    }, [topSalons, coords]);

    useEffect(() => {
        startAutoScroll();

        // Fetch Top Salons
        fetch(`${HOME_API}?action=get_top_salons`)
            .then(res => res.json())
            .then(data => {
                if (data.status === 'ok' && data.salons?.length) {
                    setTopSalons(data.salons);
                }
            })
            .catch(err => console.log('Top Salons Fetch Error:', err));

        return () => {
            if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
        };
    }, [startAutoScroll]);

    const onScrollBeginDrag = useCallback(() => {
        isUserTouching.current = true;
        // Pause auto-scroll when user starts interacting
        if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
    }, []);

    // Only update active index AFTER momentum fully stops (prevents shape-glitch mid-swipe)
    const onMomentumScrollEnd = useCallback(
        (e: NativeSyntheticEvent<NativeScrollEvent>) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / CARD_W);
            setActiveIndex(Math.max(0, Math.min(idx, CARDS.length - 1)));
            isUserTouching.current = false;
            startAutoScroll();
        },
        [startAutoScroll],
    );

    // When drag ends but momentum hasn't started — snap and track
    const onScrollEndDrag = useCallback(
        (e: NativeSyntheticEvent<NativeScrollEvent>) => {
            const velocity = e.nativeEvent.velocity?.x ?? 0;
            // If very low velocity, momentum won't fire — handle here
            if (Math.abs(velocity) < 0.2) {
                const idx = Math.round(e.nativeEvent.contentOffset.x / CARD_W);
                setActiveIndex(Math.max(0, Math.min(idx, CARDS.length - 1)));
                isUserTouching.current = false;
                startAutoScroll();
            }
        },
        [startAutoScroll],
    );

    const activeCard = CARDS[activeIndex];

    // Extract color config for header morphing
    const headerCards: CardColorConfig[] = CARDS.map(c => ({
        id: c.id,
        headerGrad: c.headerGrad,
        headerAccent: c.headerAccent,
    }));

    const renderCard = ({ item, index }: { item: typeof CARDS[0], index: number }) => {
        // scrollX at card centre = index * CARD_W (no padding offset)
        const inputRange = [
            (index - 1) * CARD_W,
            index * CARD_W,
            (index + 1) * CARD_W,
        ];
        const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.92, 1, 0.92],
            extrapolate: 'clamp',
        });
        const translateY = scrollX.interpolate({
            inputRange,
            outputRange: [8, 0, 8],
            extrapolate: 'clamp',
        });
        const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.78, 1, 0.78],
            extrapolate: 'clamp',
        });

        return (
            <Animated.View style={[styles.cardOuter, { transform: [{ scale }, { translateY }], opacity }]}>
                <LinearGradient
                    colors={item.cardGrad}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1.2, y: 1 }}
                    style={styles.card}
                >
                    <View style={styles.cardGlassShimmer} />

                    {/* Decorative rings */}
                    <View style={[styles.ring, { width: 130, height: 130, top: -35, right: -25, opacity: 0.14 }]} />
                    <View style={[styles.ring, { width: 80, height: 80, bottom: -20, right: 65, opacity: 0.10 }]} />
                    <View style={[styles.ring, { width: 50, height: 50, top: 10, right: 80, opacity: 0.08 }]} />

                    {/* Left section */}
                    <View style={styles.cardLeft}>
                        <View style={styles.badgePill}>
                            <Zap size={9} color={item.accentColor} fill={item.accentColor} />
                            <Text style={[styles.badgeText, { color: item.accentColor }]}>
                                {item.badge}
                            </Text>
                        </View>

                        <Text
                            style={styles.cardTitle}
                            numberOfLines={2}
                            adjustsFontSizeToFit
                            minimumFontScale={0.8}
                        >{item.title}</Text>
                        <Text style={styles.cardSubtitle} numberOfLines={2}>{item.subtitle}</Text>

                        <TouchableOpacity
                            activeOpacity={0.75}
                            style={[styles.ctaBtn, { backgroundColor: item.accentColor }]}
                            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                            onPress={() => {
                                if (item.id === 'services') {
                                    navigation.navigate('coming-soon', {
                                        title: 'SlotB Home-Service',
                                        subtitle: 'Electricians, Plumbers & local pros will be available at your doorstep soon!',
                                        emoji: '🔧',
                                        primaryColor: '#7C3AFF',
                                        secondaryColor: '#0A0A1A'
                                    });
                                }
                                else if (item.id === 'salon') navigation.navigate('Salon');
                                else if (item.id === 'doctor') {
                                    navigation.navigate('coming-soon', {
                                        title: 'SlotB Medical',
                                        subtitle: 'Booking nearby hospitals & clinics will be live shortly.',
                                        emoji: '🩺',
                                        primaryColor: '#14B8A6',
                                        secondaryColor: '#042F2E'
                                    });
                                }
                                else if (item.id === 'gym') {
                                    navigation.navigate('coming-soon', {
                                        title: 'SlotB Gym',
                                        subtitle: 'Gym booking & memberships are arriving soon.',
                                        emoji: '🏋️',
                                        primaryColor: '#FFD740',
                                        secondaryColor: '#1A1A1A'
                                    });
                                }
                                else if (item.id === 'grocery') {
                                    navigation.navigate('coming-soon', {
                                        title: 'SlotB Grocery',
                                        subtitle: 'Hyperlocal grocery delivery is on its way!',
                                        emoji: '🛒',
                                        primaryColor: '#10B981',
                                        secondaryColor: '#022C22'
                                    });
                                }
                            }}
                        >
                            <Text style={[styles.ctaText, { color: item.ctaTextColor }]}>
                                {item.cta}
                            </Text>
                            <ArrowRight size={14} color={item.ctaTextColor} strokeWidth={2.5} />
                        </TouchableOpacity>
                    </View>

                    {/* Right illustration */}
                    <View style={styles.cardRight}>
                        <View style={[styles.illCircle, { backgroundColor: item.accentColor + '28' }]}>
                            <Text style={styles.illEmoji}>{item.emoji}</Text>
                        </View>
                        <View style={[styles.floatTag, { backgroundColor: item.floatColor + 'EE', borderColor: item.accentColor + '55' }]}>
                            <Text style={styles.floatText}>{item.floatLabel}</Text>
                        </View>
                    </View>

                </LinearGradient>
            </Animated.View>
        );
    };

    return (
        <View style={styles.screen}>
            {/* ══ COLLAPSIBLE HEADER ═══════════════════════════════════ */}
            <HomeHeader scrollY={scrollY} scrollX={scrollX} cards={headerCards} cardWidth={CARD_W} />

            {/* ══ SCROLLABLE BODY ══════════════════════════════════════ */}
            <Animated.ScrollView
                style={styles.body}
                contentContainerStyle={{ paddingTop: HEADER_H, paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false },
                )}
            >
                {/* ─── CAROUSEL ─── */}
                <View style={styles.carouselSection}>
                    <Animated.FlatList
                        ref={carouselRef}
                        data={CARDS}
                        keyExtractor={c => c.id}
                        horizontal
                        snapToInterval={CARD_W}
                        snapToAlignment="start"
                        decelerationRate="fast"
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingLeft: 16, paddingRight: 16 }}
                        onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                            { useNativeDriver: false },
                        )}
                        scrollEventThrottle={16}
                        onScrollBeginDrag={onScrollBeginDrag}
                        onScrollEndDrag={onScrollEndDrag}
                        onMomentumScrollEnd={onMomentumScrollEnd}
                        renderItem={renderCard}
                        getItemLayout={(_: any, index: number) => ({
                            length: CARD_W,
                            offset: CARD_W * index,
                            index,
                        })}
                    />

                    {/* Animated dot indicators */}
                    <View style={styles.dotsRow}>
                        {CARDS.map((c, i) => {
                            // Smooth animated width: 6 → 24 → 6
                            const dotWidth = scrollX.interpolate({
                                inputRange: [
                                    (i - 1) * CARD_W,
                                    i * CARD_W,
                                    (i + 1) * CARD_W,
                                ],
                                outputRange: [6, 24, 6],
                                extrapolate: 'clamp',
                            });
                            // Smooth animated opacity: 0.3 → 1 → 0.3
                            const dotOpacity = scrollX.interpolate({
                                inputRange: [
                                    (i - 1) * CARD_W,
                                    i * CARD_W,
                                    (i + 1) * CARD_W,
                                ],
                                outputRange: [0.3, 1, 0.3],
                                extrapolate: 'clamp',
                            });
                            return (
                                <Animated.View
                                    key={c.id}
                                    style={[
                                        styles.dot,
                                        {
                                            width: dotWidth,
                                            opacity: dotOpacity,
                                            backgroundColor: c.dotColor,
                                        },
                                    ]}
                                />
                            );
                        })}
                    </View>
                </View>

                {/* ─── HOME SERVICE DEALS ─── */}
                <View style={styles.section}>
                    <View style={styles.secHeader}>
                        <Text style={styles.secTitle}>Home Service Deals</Text>
                        <TouchableOpacity activeOpacity={0.7} style={styles.seeAllBtn} onPress={() => navigation.navigate('coming-soon', { title: 'Home Services', subtitle: 'On-demand home services are arriving soon!', emoji: '🔧', primaryColor: '#7C3AFF', secondaryColor: '#0A0A1A' })}>
                            <Text style={styles.seeAllText}>View all</Text>
                            <ArrowRight size={13} color="#1565C0" strokeWidth={2.5} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 35, paddingBottom: 15, gap: 16 }}>
                        {[
                            { title: 'AC Service & Repair', price: '₹9', tag: 'Summer Deal', image: require('../../../../assets/images/monkey_ac_tech_v2.png'), colors: ['#0EA5E9', '#0284C7'] as const },
                            { title: 'Full Home Cleaning', price: '₹9', tag: 'Best Seller', image: require('../../../../assets/images/monkey_cleaner_v2.png'), colors: ['#10B981', '#059669'] as const },
                            { title: 'Electrician Visit', price: '₹9', tag: 'Instant', image: require('../../../../assets/images/monkey_electrician_v2.png'), colors: ['#F59E0B', '#D97706'] as const },
                        ].map((s, i) => (
                            <TouchableOpacity
                                key={i}
                                style={styles.promoCard}
                                activeOpacity={0.85}
                                onPress={() => navigation.navigate('coming-soon', {
                                    title: 'SlotB Home-Service',
                                    subtitle: 'Electricians, Plumbers & local pros will be available at your doorstep soon!',
                                    emoji: '🔧',
                                    primaryColor: '#7C3AFF',
                                    secondaryColor: '#0A0A1A'
                                })}
                            >
                                <FloatingMascot source={s.image} style={styles.promoCardMascotFlying} />
                                <View style={styles.promoCardTop}>
                                    <View style={[styles.promoCardTag, { backgroundColor: '#F1F5F9' }]}>
                                        <Text style={[styles.promoCardTagTxt, { color: '#64748B' }]}>{s.tag}</Text>
                                    </View>
                                </View>
                                <Text style={styles.promoCardTitle} numberOfLines={1}>{s.title}</Text>
                                <Text style={styles.promoCardPrice}>Book from <Text style={styles.promoCardPriceBold}>{s.price}</Text></Text>
                                <LinearGradient colors={s.colors} style={styles.promoCardBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                    <Text style={styles.promoCardBtnTxt}>Book Now</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* ─── TOP SALONS NEAR YOU ─── */}
                <View style={styles.section}>
                    <View style={styles.secHeader}>
                        <Text style={styles.secTitle}>Top Salons Near You</Text>
                        <TouchableOpacity activeOpacity={0.7} style={styles.seeAllBtn} onPress={() => navigation.navigate('Salon')}>
                            <View style={styles.seeAllCircle}>
                                <ArrowRight size={13} color="#1565C0" strokeWidth={2.5} />
                            </View>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }}>
                        {sortedSalons.map((salon: any) => (
                            <TouchableOpacity key={salon.id} style={styles.salonCard} activeOpacity={0.88}>
                                <View style={styles.salonImgWrap}>
                                    <Image source={salon.image} style={styles.salonImg} resizeMode="cover" />
                                    <View style={[styles.openBadge, { backgroundColor: salon.isOpen ? '#16A34A' : '#DC2626' }]}>
                                        <Text style={styles.openBadgeText}>{salon.isOpen ? 'Open' : 'Closed'}</Text>
                                    </View>
                                </View>
                                <View style={styles.salonBody}>
                                    <View style={styles.salonNameRow}>
                                        <Text style={styles.salonName} numberOfLines={1}>{salon.name}</Text>
                                        <View style={styles.verifiedBadge}>
                                            <Text style={styles.verifiedTick}>✓</Text>
                                        </View>
                                    </View>
                                    <View style={styles.salonRatingRow}>
                                        <Star size={13} color="#FBBF24" fill="#FBBF24" />
                                        <Text style={styles.salonRating}>{salon.rating}</Text>
                                        <Text style={styles.salonReviews}>({salon.reviews} reviews)</Text>
                                    </View>
                                    <View style={styles.salonMetaRow}>
                                        <View style={[styles.salonMetaPill, { backgroundColor: '#F0FDF4' }]}>
                                            <Text style={[styles.salonMetaText, { color: '#16A34A' }]}>🕐 {salon.wait}</Text>
                                        </View>
                                        <View style={styles.salonMetaPill}>
                                            <Text style={styles.salonMetaText}>
                                                📍 {coords && salon.latitude && salon.longitude ?
                                                    `${calculateDistance(coords.latitude, coords.longitude, Number(salon.latitude), Number(salon.longitude))} km` :
                                                    salon.dist}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.salonFooter}>
                                        <Text style={styles.salonPrice}>{salon.price}</Text>
                                        <TouchableOpacity
                                            style={styles.bookNowBtn}
                                            activeOpacity={0.85}
                                            onPress={() => {
                                                setSelectedShop(salon);
                                                setBookingVisible(true);
                                            }}
                                        >
                                            <Text style={styles.bookNowText}>Book Now</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* ─── FEATURED SERVICE PROVIDERS ─── */}
                <View style={{ marginTop: 24 }}>
                    <FeaturedProviders />
                </View>

                {/* ─── SLOTB REELS ─── */}
                <ReelCarousel />

            </Animated.ScrollView>

            {/* Booking Modal */}
            {selectedShop && (
                <BookingModal
                    visible={bookingVisible}
                    onClose={() => setBookingVisible(false)}
                    shopId={selectedShop.id}
                    shopName={selectedShop.name}
                    shopAddress={selectedShop.address || selectedShop.dist} // fallback to dist if address missing
                    user={user}
                    navigation={navigation}
                />
            )}
        </View>
    );
}

// ─── SlotB Reels Carousel (DB-driven) ────────────────────────────────────────
const HOME_API = 'https://slotb.in/api_home.php';

const FALLBACK_REELS = [
    { id: 'r1', thumb: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80', title: 'Glam Up at SlotB Salons 💇', tag: 'Salon', tagColor: '#E91E8C', views: '124K', likes: '8.2K', duration: '0:32', accent: '#E91E8C' },
    { id: 'r2', thumb: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80', title: 'Book in 10 seconds ⏱️', tag: 'SlotB App', tagColor: '#3B82F6', views: '89K', likes: '5.4K', duration: '0:18', accent: '#3B82F6' },
    { id: 'r3', thumb: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&q=80', title: 'Best Salon Deals Near You ✨', tag: 'Offer', tagColor: '#F59E0B', views: '211K', likes: '14K', duration: '0:45', accent: '#F59E0B' },
    { id: 'r4', thumb: 'https://images.unsplash.com/photo-1457972729786-0411a3b2b626?w=400&q=80', title: 'No-wait Queue System 🔥', tag: 'Feature', tagColor: '#10B981', views: '67K', likes: '3.9K', duration: '0:27', accent: '#10B981' },
];

type ReelItem = { id: string | number; thumb: string; title: string; tag: string; tagColor: string; views: string; likes: string; duration: string; accent: string; };

const CAT_IMAGES_MAP: Record<string, any> = {
    Plumber: require('../assets/services/plumber.png'),
    Electrician: require('../assets/services/electrician.png'),
    Painter: require('../assets/services/painter.png'),
    Carpenter: require('../assets/services/carpenter.png'),
};


interface FeaturedProvider {
    id: number; name: string; category: string; rating: number; reviews: number;
    image: string; skills: string[]; price: string; is_available: boolean;
    status: string; verified: boolean; exp: string; slot_label: string;
    section_label: string; phone: string;
}

// ─── Featured Service Providers ───────────────────────────────────────────
function FeaturedProviders() {
    const [providers, setProviders] = React.useState<FeaturedProvider[]>([]);
    const [loading, setLoading] = React.useState(true);
    const navigation = useNavigation<any>();

    React.useEffect(() => {
        fetch(`${HOME_API}?action=get_featured_providers`)
            .then(r => r.json())
            .then(d => { if (d.status === 'ok') setProviders(d.providers || []); })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <View style={fp.section}>
            <Text style={fp.sectionTitle}>Service Providers</Text>
            <View style={fp.loaderRow}>
                {[1, 2].map(i => <View key={i} style={fp.skeleton} />)}
            </View>
        </View>
    );

    if (!providers.length) return null;

    const sectionLabel = providers[0]?.section_label || 'Service Providers';

    return (
        <View style={fp.section}>
            <View style={fp.header}>
                <View>
                    <Text style={fp.sectionTitle}>{sectionLabel}</Text>
                    <Text style={fp.sectionSub}>Handpicked experts near you</Text>
                </View>
                <TouchableOpacity
                    style={fp.seeAllBtn}
                    onPress={() => navigation.navigate('coming-soon', { title: 'Service Providers', subtitle: 'Connecting you with the best local pros shortly.', emoji: '✨', primaryColor: '#7C3AFF', secondaryColor: '#4C1D95' })}
                    activeOpacity={0.8}
                >
                    <Text style={fp.seeAllText}>See All</Text>
                    <ArrowRight size={13} color="#7C3AFF" strokeWidth={2.5} />
                </TouchableOpacity>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 4 }}
            >
                {providers.map(p => (
                    <FeaturedProviderCard key={p.id} provider={p} />
                ))}
            </ScrollView>
        </View>
    );
}

function FeaturedProviderCard({ provider: p }: { provider: FeaturedProvider }) {
    const catImg = CAT_IMAGES_MAP[p.category];
    const imgSource = catImg ? catImg : { uri: p.image };
    const navigation = useNavigation<any>();

    return (
        <TouchableOpacity
            style={fp.card}
            activeOpacity={0.92}
            onPress={() => navigation.navigate('coming-soon', { title: p.name, subtitle: `Book ${p.name} and other experts directly from the app soon!`, emoji: '🔧', primaryColor: '#1D4ED8', secondaryColor: '#1E3A8A' })}
        >
            {/* Fixed-height image area */}
            <View style={fp.imgWrap}>
                <Image source={imgSource} style={fp.img} resizeMode="cover" />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={fp.scrim} />
                <View style={[fp.availPill, { backgroundColor: p.is_available ? '#10B981' : '#F59E0B' }]}>
                    <Text style={fp.availText}>{p.status}</Text>
                </View>
                {p.verified && (
                    <View style={fp.verifiedBadge}>
                        <Text style={fp.verifiedText}>&#10003; Verified</Text>
                    </View>
                )}
                <View style={fp.slotBadge}>
                    <Text style={fp.slotText}>{p.slot_label}</Text>
                </View>
            </View>

            {/* Body — flex so Book Now always at bottom */}
            <View style={fp.body}>
                <View style={fp.bodyTop}>
                    <Text style={fp.name} numberOfLines={1}>{p.name}</Text>
                    <View style={fp.metaRow}>
                        <Text style={fp.starText}>&#11088; {p.rating.toFixed(1)}</Text>
                        <Text style={fp.dotSep}>·</Text>
                        <View style={fp.catChip}>
                            <Text style={fp.catText}>{p.category}</Text>
                        </View>
                    </View>
                    <Text style={fp.skills} numberOfLines={1}>
                        {p.skills.length > 0 ? p.skills.join(' • ') : p.exp}
                    </Text>
                </View>
                {/* Book Now always at bottom */}
                <TouchableOpacity
                    style={fp.bookBtn}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('coming-soon', { title: p.name, subtitle: `Book ${p.name} and other experts directly from the app soon!`, emoji: '🔧', primaryColor: '#1D4ED8', secondaryColor: '#1E3A8A' })}
                >
                    <Text style={fp.bookText}>Book Now</Text>
                    <View style={fp.pricePill}>
                        <Text style={fp.priceText}>{p.price}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

// ─── Reel Full-Screen Modal ───────────────────────────────────────────────────────────────
function ReelFullScreen({ reel, onClose }: { reel: ReelItem; onClose: () => void }) {
    const [liked, setLiked] = React.useState(false);
    const [saved, setSaved] = React.useState(false);
    const [playing, setPlaying] = React.useState(true);
    const progress = useRef(new Animated.Value(0)).current;
    const heartScale = useRef(new Animated.Value(1)).current;
    const animRef = useRef<Animated.CompositeAnimation | null>(null);
    const videoRef = useRef<any>(null);
    const hasVideo = !!(reel as any).videoUrl;

    // Progress bar animation (used when no real video)
    React.useEffect(() => {
        if (hasVideo) return; // let video control itself
        progress.setValue(0);
        animRef.current = Animated.timing(progress, {
            toValue: 1, duration: 15000, useNativeDriver: false,
        });
        animRef.current.start();
        return () => animRef.current?.stop();
    }, [reel.id]);

    const togglePlay = async () => {
        if (hasVideo && videoRef.current) {
            const status = await videoRef.current.getStatusAsync();
            if (status.isPlaying) {
                await videoRef.current.pauseAsync();
            } else {
                await videoRef.current.playAsync();
            }
        } else {
            if (playing) animRef.current?.stop();
            else {
                animRef.current = Animated.timing(progress, {
                    toValue: 1, duration: 10000, useNativeDriver: false,
                });
                animRef.current.start();
            }
        }
        setPlaying(p => !p);
    };

    const handleLike = () => {
        setLiked(p => !p);
        Animated.sequence([
            Animated.spring(heartScale, { toValue: 1.5, useNativeDriver: true, speed: 40 }),
            Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, speed: 30 }),
        ]).start();
    };

    const handleShare = () => {
        Share.share({ message: `🎬 ${reel.title} — Check out SlotB!` });
    };

    const barWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

    return (
        <Modal visible animationType="slide" statusBarTranslucent onRequestClose={onClose}>
            <StatusBar hidden />
            <View style={fs.container}>

                {/* Video player or image background */}
                {hasVideo ? (
                    <Video
                        ref={videoRef}
                        source={{ uri: (reel as any).videoUrl }}
                        style={fs.bg}
                        resizeMode={ResizeMode.COVER}
                        shouldPlay
                        isLooping
                        onPlaybackStatusUpdate={s => {
                            if (s.isLoaded && s.durationMillis) {
                                const frac = (s.positionMillis || 0) / s.durationMillis;
                                progress.setValue(frac);
                            }
                        }}
                    />
                ) : (
                    <Image source={{ uri: reel.thumb }} style={fs.bg} resizeMode="cover" />
                )}

                <LinearGradient
                    colors={['rgba(0,0,0,0.3)', 'transparent', 'transparent', 'rgba(0,0,0,0.85)']}
                    style={StyleSheet.absoluteFill}
                />

                {/* Center tap → play / pause (Move this before other interactive overlays) */}
                <Pressable style={fs.playArea} onPress={togglePlay}>
                    <Animated.View style={[
                        fs.playCircle,
                        { opacity: playing ? 0 : 1, transform: [{ scale: playing ? 0.7 : 1 }] }
                    ]}>
                        <Text style={fs.playIcon}>&#9654;</Text>
                    </Animated.View>
                </Pressable>

                {/* Top bar: tag | progress | close */}
                <View style={fs.topBar}>
                    <View style={[fs.tagPill, { backgroundColor: reel.tagColor }]}>
                        <Text style={fs.tagText}>{reel.tag}</Text>
                    </View>
                    <View style={fs.progressTrack}>
                        <Animated.View style={[fs.progressFill, { width: barWidth, backgroundColor: reel.accent }]} />
                    </View>
                    <TouchableOpacity style={fs.closeBtn} onPress={onClose} activeOpacity={0.8}>
                        <Text style={fs.closeBtnText}>✕</Text>
                    </TouchableOpacity>
                </View>

                {/* Right action buttons */}
                <View style={fs.actions}>
                    <TouchableOpacity style={fs.actionBtn} onPress={handleLike} activeOpacity={0.8}>
                        <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                            <Text style={fs.actionEmoji}>{liked ? '❤️' : '🤍'}</Text>
                        </Animated.View>
                        <Text style={fs.actionLabel}>{reel.likes}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={fs.actionBtn} onPress={handleShare} activeOpacity={0.8}>
                        <Text style={fs.actionEmoji}>👮‍♂️</Text>
                        <Text style={fs.actionLabel}>Share</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={fs.actionBtn} onPress={() => setSaved(p => !p)} activeOpacity={0.8}>
                        <Text style={fs.actionEmoji}>{saved ? '🔖' : '🔖'}</Text>
                        <Text style={[fs.actionLabel, saved && { color: reel.accent }]}>{saved ? 'Saved' : 'Save'}</Text>
                    </TouchableOpacity>
                </View>

                {/* Bottom info */}
                <View style={fs.bottomInfo}>
                    <View style={fs.slotbRow}>
                        <View style={[fs.slotbBadge, { backgroundColor: reel.tagColor }]}>
                            <Text style={fs.slotbText}>SlotB</Text>
                        </View>
                        <Text style={fs.durationText}>{reel.duration}</Text>
                    </View>
                    <Text style={fs.title} numberOfLines={3}>{reel.title}</Text>
                    <View style={fs.statsRow}>
                        <Text style={fs.stat}>👁️ {reel.views} views</Text>
                        <Text style={fs.statDot}>·</Text>
                        <Text style={fs.stat}>❤️ {reel.likes}</Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// ─── SlotB Reels — Horizontal Carousel + fullscreen modal ───────────────────────
function ReelCarousel() {
    const [reels, setReels] = React.useState<ReelItem[]>(FALLBACK_REELS);
    const [selected, setSelected] = React.useState<ReelItem | null>(null);

    React.useEffect(() => {
        fetch(`${HOME_API}?action=get_reels`)
            .then(r => r.json())
            .then(d => { if (d.status === 'ok' && d.reels?.length) setReels(d.reels); })
            .catch(() => { });
    }, []);

    return (
        <View style={rs.section}>
            {/* Header */}
            <View style={rs.header}>
                <View>
                    <Text style={rs.sectionTitle}>SlotB Reels</Text>
                    <Text style={rs.sectionSub}>Tap to watch • Swipe for more ▶️</Text>
                </View>
                <View style={rs.livePill}>
                    <View style={rs.liveDot} />
                    <Text style={rs.liveText}>LIVE ADS</Text>
                </View>
            </View>

            {/* Horizontal carousel */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={rs.carousel}
                decelerationRate="fast"
                snapToInterval={REEL_CARD_W + 12}
                snapToAlignment="start"
                disableIntervalMomentum
            >
                {reels.map((reel) => (
                    <TouchableOpacity
                        key={String(reel.id)}
                        style={rs.reelCard}
                        activeOpacity={0.88}
                        onPress={() => setSelected(reel)}
                    >
                        <Image source={{ uri: reel.thumb }} style={rs.reelThumb} resizeMode="cover" />
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.8)']}
                            style={StyleSheet.absoluteFill}
                        />
                        {/* duration pill top-right */}
                        <View style={rs.durPill}>
                            <Text style={rs.durText}>{reel.duration}</Text>
                        </View>
                        {/* big play icon center */}
                        <View style={rs.reelPlayCircle}>
                            <Text style={rs.gridPlayIcon}>&#9654;</Text>
                        </View>
                        {/* tag + title + views at bottom */}
                        <View style={rs.reelBottom}>
                            <View style={[rs.gridTag, { backgroundColor: reel.tagColor }]}>
                                <Text style={rs.gridTagText}>{reel.tag}</Text>
                            </View>
                            <Text style={rs.reelTitle} numberOfLines={2}>{reel.title}</Text>
                            <Text style={rs.gridViews}>👁️ {reel.views}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Full-screen modal */}
            {selected && (
                <ReelFullScreen reel={selected} onClose={() => setSelected(null)} />
            )}
        </View>
    );
}

// ─── Featured Provider Styles ────────────────────────────────────────────────
const fp = StyleSheet.create({
    section: { marginTop: 4, marginBottom: 8 },
    header: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
    sectionSub: { fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 1 },
    seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 10, backgroundColor: '#EDE9FE', borderRadius: 10 },
    seeAllText: { fontSize: 12, fontWeight: '700', color: '#7C3AFF' },
    loaderRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16 },
    skeleton: { width: 200, height: 240, borderRadius: 20, backgroundColor: '#E2E8F0' },
    card: {
        width: 196, backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden',
        borderWidth: 1, borderColor: '#F1F5F9',
        shadowColor: '#7C3AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 6,
    },
    imgWrap: { height: 120, position: 'relative' },
    img: { width: '100%', height: '100%' },
    scrim: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60 },
    availPill: { position: 'absolute', top: 10, left: 10, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    availText: { fontSize: 10, fontWeight: '800', color: '#fff' },
    verifiedBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    verifiedText: { fontSize: 10, fontWeight: '800', color: '#065F46' },
    slotBadge: { position: 'absolute', bottom: 8, left: 10, backgroundColor: 'rgba(124,58,255,0.85)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    slotText: { fontSize: 10, fontWeight: '700', color: '#fff' },
    body: { padding: 12, flex: 1, justifyContent: 'space-between' },
    bodyTop: { flex: 1 },
    name: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
    starText: { fontSize: 12, fontWeight: '700', color: '#F59E0B' },
    dot: { fontSize: 12, color: '#CBD5E1' },
    dotSep: { fontSize: 12, color: '#CBD5E1' },
    catChip: { backgroundColor: '#EDE9FE', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
    catText: { fontSize: 10, fontWeight: '800', color: '#7C3AFF' },
    skills: { fontSize: 11, color: '#64748B', backgroundColor: '#F8FAFC', padding: 7, borderRadius: 8, marginBottom: 6, flexShrink: 1 },
    bookBtn: { backgroundColor: '#1D4ED8', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 9, paddingHorizontal: 12, borderRadius: 12, marginTop: 4 },
    bookText: { fontSize: 13, fontWeight: '800', color: '#fff' },
    pricePill: { backgroundColor: 'rgba(255,255,255,0.22)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
    priceText: { fontSize: 11, fontWeight: '900', color: '#fff' },
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#F0F4FC' },
    body: { flex: 1 },

    // ── Carousel ──
    carouselSection: {
        paddingTop: 12,
        paddingBottom: 0,
    },
    cardOuter: { width: CARD_W },
    card: {
        borderRadius: 24,
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        height: 172,
        overflow: 'hidden',
        elevation: 14,
        shadowColor: '#1A237E',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
    },
    cardGlassShimmer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 24,
    },
    ring: {
        position: 'absolute',
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,1)',
        backgroundColor: 'transparent',
    },
    cardLeft: { flex: 1, gap: 6, justifyContent: 'center' },
    cardRight: {
        marginLeft: 14,
        alignItems: 'center',
        justifyContent: 'center',
        width: 100,
    },
    badgePill: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        alignSelf: 'flex-start',
        paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.13)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)',
    },
    badgeText: { fontSize: 9.5, fontWeight: '700', letterSpacing: 0.4 },
    cardTitle: {
        fontSize: 18, fontWeight: '900', color: '#fff',
        letterSpacing: 0.3, lineHeight: 23,
    },
    cardSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.72)', lineHeight: 18 },
    ctaBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        alignSelf: 'flex-start',
        paddingHorizontal: 16, paddingVertical: 9,
        borderRadius: 14, marginTop: 2,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.22, shadowRadius: 6,
    },
    ctaText: { fontSize: 13, fontWeight: '800', letterSpacing: 0.3 },
    illCircle: {
        width: 80, height: 80, borderRadius: 40,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)',
    },
    illEmoji: { fontSize: 34 },
    floatTag: {
        marginTop: 10,
        paddingHorizontal: 10, paddingVertical: 5,
        borderRadius: 999,
        borderWidth: 1,
        elevation: 4,
    },
    floatText: { fontSize: 10, fontWeight: '700', color: '#fff' },

    // ── Dots ──
    dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 },
    dot: { height: 6, borderRadius: 3 },

    // ── Sections ──
    section: { marginTop: 16 },
    secHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', paddingHorizontal: 16, marginBottom: 12,
    },
    secTitle: { fontSize: 17, fontWeight: '800', color: '#1E293B' },
    seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    seeAllText: { fontSize: 13, fontWeight: '600', color: '#1565C0' },

    // ── Promo Service Cards (horizontal sliders) ──
    promoCard: {
        width: 160,
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 12,
        paddingTop: 50, // More top padding for the zoomed mascot
        gap: 8,
        elevation: 12,
        shadowColor: '#1E293B',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        overflow: 'visible',
    },
    promoCardTop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        marginBottom: 2,
    },
    promoCardMascotFlying: {
        position: 'absolute',
        top: -42, // Adjusted down from -48
        left: -8, // Keeping the horizontal alignment
        width: 110,
        height: 110,
        zIndex: 10,
    },
    promoCardTag: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    promoCardTagTxt: { fontSize: 8, fontWeight: '800', letterSpacing: 0.4, textTransform: 'uppercase' },
    promoCardTitle: { fontSize: 13, fontWeight: '900', color: '#0F172A', marginTop: 4 },
    promoCardPrice: { fontSize: 11, color: '#64748B', fontWeight: '600' },
    promoCardPriceBold: { fontWeight: '900', color: '#0F172A', fontSize: 14 },
    promoCardBtn: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 16,
        marginTop: 6,
        alignSelf: 'stretch',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    promoCardBtnTxt: { fontSize: 11, fontWeight: '900', color: '#fff', letterSpacing: 0.5, textTransform: 'uppercase' },

    // ── Top Salons Near You ──
    seeAllCircle: {
        width: 30, height: 30, borderRadius: 15,
        backgroundColor: '#EFF6FF',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: '#DBEAFE',
    },
    salonCard: {
        width: W * 0.6,
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 6,
        shadowColor: '#94A3B8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18, shadowRadius: 12,
        marginRight: 1, // added margin for spacing in horizontal view
    },
    salonImgWrap: { width: '100%', height: 110, position: 'relative' },
    salonImg: { width: '100%', height: 110 },
    openBadge: {
        position: 'absolute', top: 12, left: 12,
        paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 999,
    },
    openBadgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },
    salonBody: { padding: 8, paddingHorizontal: 10 },
    salonNameRow: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 4,
    },
    salonName: { fontSize: 16, fontWeight: '800', color: '#1E293B', flex: 1, marginRight: 8 },
    verifiedBadge: {
        width: 22, height: 22, borderRadius: 11,
        backgroundColor: '#1565C0',
        alignItems: 'center', justifyContent: 'center',
    },
    verifiedTick: { fontSize: 11, color: '#fff', fontWeight: '900' },
    salonRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
    salonRating: { fontSize: 13, fontWeight: '700', color: '#374151' },
    salonReviews: { fontSize: 12, color: '#9CA3AF', fontWeight: '400' },
    salonMetaRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    salonMetaPill: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 999,
        paddingHorizontal: 10, paddingVertical: 5,
    },
    salonMetaText: { fontSize: 11.5, color: '#475569', fontWeight: '500' },
    salonFooter: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1, borderTopColor: '#F1F5F9',
        paddingTop: 5,
    },
    salonPrice: { fontSize: 13, color: '#64748B', fontWeight: '500' },
    salonPriceBold: { fontSize: 16, fontWeight: '900', color: '#1E293B' },
    bookNowBtn: {
        backgroundColor: '#E91E8C',
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 8,
        elevation: 4,
        shadowColor: '#E91E8C',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3, shadowRadius: 8,
        marginLeft: 6,
    },
    bookNowText: { fontSize: 13, fontWeight: '800', color: '#fff' },

    // ── Promo ──
    promoPad: { marginTop: 22, paddingHorizontal: 16 },
    promoBanner: {
        borderRadius: 22, padding: 20,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#1A237E',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.35, shadowRadius: 14,
    },
    promoGlass: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    promoTag: { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginBottom: 4 },
    promoTitle: { fontSize: 21, fontWeight: '900', color: '#fff', marginBottom: 2 },
    promoCode: { fontSize: 12, color: 'rgba(255,255,255,0.72)', fontWeight: '500' },
    promoBtn: {
        backgroundColor: '#fff',
        borderRadius: 14, paddingHorizontal: 18, paddingVertical: 10,
        elevation: 3,
    },
    promoBtnTxt: { fontSize: 13, fontWeight: '800', color: '#1A237E' },

    // ── Nearby cards ──
    nearbyCard: {
        width: 138, backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden',
        elevation: 5,
        shadowColor: '#94A3B8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18, shadowRadius: 10,
    },
    nearbyImg: { width: 138, height: 90 },
    nearbyBody: { paddingHorizontal: 10, paddingTop: 8, paddingBottom: 10 },
    nearbyTagRow: { marginBottom: 4 },
    nearbyTag: {
        alignSelf: 'flex-start',
        backgroundColor: '#EFF6FF',
        borderRadius: 999,
        paddingHorizontal: 8, paddingVertical: 2,
    },
    nearbyTagText: { fontSize: 10, fontWeight: '700', color: '#1565C0' },
    nearbyName: { fontSize: 12.5, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
    nearbyMeta: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    nearbyRating: { fontSize: 11, fontWeight: '600', color: '#374151' },
    nearbyDot: { fontSize: 11, color: '#9CA3AF' },
    nearbyDist: { fontSize: 11, color: '#9CA3AF', fontWeight: '500' },

    // ── Carousel Coming Soon overlay ──
    cardComingSoonOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.55)',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardComingSoonText: {
        fontSize: 15, fontWeight: '900', color: '#fff',
        letterSpacing: 0.5,
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 18, paddingVertical: 7,
        borderRadius: 999,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
        overflow: 'hidden',
    },

    // ── Coming Soon section banners ──
    comingSoonSection: { marginTop: 16, paddingHorizontal: 16 },
    comingSoonHeader: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 10,
    },
    comingSoonSectionTitle: { fontSize: 17, fontWeight: '800', color: '#1E293B' },
    comingSoonPill: {
        paddingHorizontal: 10, paddingVertical: 4,
        backgroundColor: '#FEF3C7', borderRadius: 999,
        borderWidth: 1, borderColor: '#FCD34D',
    },
    comingSoonPillText: { fontSize: 11, fontWeight: '700', color: '#92400E' },
    comingSoonCard: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        backgroundColor: '#fff', borderRadius: 18, padding: 16,
        borderLeftWidth: 4,
        elevation: 3,
        shadowColor: '#94A3B8',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1, shadowRadius: 6,
    },
    comingSoonCardEmoji: { fontSize: 36 },
    comingSoonCardBody: { flex: 1 },
    comingSoonCardTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 3 },
    comingSoonCardSub: { fontSize: 12, color: '#6B7280', fontWeight: '500', lineHeight: 17 },

});

// ─── Reel Styles ──────────────────────────────────────────────────────────────
const rs = StyleSheet.create({
    section: { marginTop: 28, paddingBottom: 24 },
    header: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16, marginBottom: 14,
    },
    sectionTitle: { fontSize: 20, fontWeight: '900', color: '#1E293B' },
    sectionSub: { fontSize: 12, color: '#94A3B8', fontWeight: '500', marginTop: 2 },
    livePill: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: '#FEF2F2', borderRadius: 999,
        paddingHorizontal: 12, paddingVertical: 6,
        borderWidth: 1, borderColor: '#FECACA',
    },
    liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#EF4444' },
    liveText: { fontSize: 10, fontWeight: '900', color: '#EF4444', letterSpacing: 0.8 },

    // ── Reels Horizontal Carousel ──
    carousel: { paddingHorizontal: 16, gap: 12, paddingBottom: 4 },
    reelCard: {
        width: REEL_CARD_W,
        height: REEL_H,
        borderRadius: 18,
        overflow: 'hidden',
        backgroundColor: '#1a1a2e',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.28, shadowRadius: 12,
    },
    reelThumb: { position: 'absolute', width: '100%', height: '100%' },
    reelPlayCircle: {
        position: 'absolute',
        top: 0, bottom: 40, left: 0, right: 0,
        alignItems: 'center', justifyContent: 'center',
    },
    reelBottom: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: 12,
    },
    reelTitle: {
        fontSize: 13, fontWeight: '800', color: '#fff',
        lineHeight: 17, marginBottom: 4,
        textShadowColor: 'rgba(0,0,0,0.6)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    durPill: {
        position: 'absolute', top: 10, right: 10,
        backgroundColor: 'rgba(0,0,0,0.65)',
        paddingHorizontal: 8, paddingVertical: 3,
        borderRadius: 999,
    },
    durText: { fontSize: 10, fontWeight: '700', color: '#fff' },
    gridPlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
    gridPlayIcon: {
        fontSize: 32, color: 'rgba(255,255,255,0.92)',
        textShadowColor: 'rgba(0,0,0,0.6)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
    },
    gridTag: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8, paddingVertical: 2,
        borderRadius: 999, marginBottom: 5,
    },
    gridTagText: { fontSize: 9, fontWeight: '900', color: '#fff', letterSpacing: 0.3 },
    gridViews: { fontSize: 10, color: 'rgba(255,255,255,0.75)', fontWeight: '600' },
    // kept for unused compat
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16 },
    gridCard: { borderRadius: 16, overflow: 'hidden', height: 220, backgroundColor: '#1a1a2e' },
    gridThumb: { width: '100%', height: '100%', position: 'absolute' },
    gridBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10 },
    gridTitle: { fontSize: 13, fontWeight: '800', color: '#fff', lineHeight: 17, marginBottom: 4 },
});

// ─── Full-Screen Reel Modal Styles ────────────────────────────────────────────
const { height: SH } = Dimensions.get('window');
const fs = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    bg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },

    topBar: {
        position: 'absolute', top: 48, left: 0, right: 0,
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, gap: 12,
    },
    tagPill: {
        paddingHorizontal: 12, paddingVertical: 6,
        borderRadius: 999,
    },
    tagText: { fontSize: 11, fontWeight: '900', color: '#fff', letterSpacing: 0.4 },
    progressTrack: {
        flex: 1, height: 3,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 99, overflow: 'hidden',
    },
    progressFill: { height: 3, borderRadius: 99 },
    closeBtn: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: 'rgba(0,0,0,0.55)',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
    },
    closeBtnText: { fontSize: 16, color: '#fff', fontWeight: '700' },

    playArea: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center', justifyContent: 'center',
    },
    playCircle: {
        width: 70, height: 70, borderRadius: 35,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)',
    },
    playIcon: { fontSize: 28, color: '#fff', marginLeft: 4 },

    actions: {
        position: 'absolute', right: 14, bottom: 120,
        alignItems: 'center', gap: 24,
    },
    actionBtn: { alignItems: 'center', gap: 5 },
    actionEmoji: { fontSize: 30 },
    actionLabel: { fontSize: 11, color: '#fff', fontWeight: '800' },

    bottomInfo: {
        position: 'absolute', bottom: 40, left: 16, right: 72,
    },
    slotbRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    slotbBadge: {
        paddingHorizontal: 12, paddingVertical: 4,
        borderRadius: 999,
    },
    slotbText: { fontSize: 11, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
    durationText: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
    title: {
        fontSize: 17, fontWeight: '800', color: '#fff',
        lineHeight: 23, marginBottom: 10,
        textShadowColor: 'rgba(0,0,0,0.7)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 6,
    },
    statsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    stat: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
    statDot: { fontSize: 14, color: 'rgba(255,255,255,0.4)' },
});


