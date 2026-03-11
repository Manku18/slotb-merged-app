import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Image, Dimensions, Modal, StatusBar, Animated,
    ActivityIndicator, RefreshControl, TextInput, Alert, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Star, ShieldCheck, MapPin, PhoneCall, X, ArrowRight,
    SlidersHorizontal, CheckCircle2, Search, Bell,
    Navigation2, Clock, QrCode, ChevronDown,
} from 'lucide-react-native';
import { useLocation } from '../context/LocationContext';
import * as Location from 'expo-location';
import LocationSelectorModal from '../components/LocationSelectorModal';

const { width: W } = Dimensions.get('window');

// ─── Category Placeholder Images ─────────────────────────────────────────────
const CAT_IMAGES: Record<string, any> = {
    Plumber: require('../assets/services/plumber.png'),
    Electrician: require('../assets/services/electrician.png'),
    Painter: require('../assets/services/painter.png'),
    Carpenter: require('../assets/services/carpenter.png'),
    Labour: require('../assets/services/labour.png'),
    Tutor: require('../assets/services/tutor.png'),
    Appliance: require('../assets/services/appliance.png'),
    Security: require('../assets/services/security.png'),
    Fitness: require('../assets/services/fitness.png'),
    Courier: require('../assets/services/courier.png'),
};

// ─── Theme ────────────────────────────────────────────────────────────────────
const PURPLE = '#7C3AFF';
const PURPLE_DARK = '#5B21B6';
const AMBER = '#F59E0B';
const PINK = '#E91E63';
const BG = '#F6F7FA';

const BASE_URL = 'https://slotb.in/api_services.php';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Category {
    id: string;
    label: string;
    icon: string;
    emoji: string;
    color: string;
    bg: string;
}

interface Provider {
    id: number;
    name: string;
    category: string;
    phone: string;
    address: string;
    rating: number;
    reviews: number;
    dist_km: number | null;
    dist_text: string;
    image: string;
    skills: string[];
    price: string;
    is_available: boolean;
    status: string;
    verified: boolean;
    exp: string;
    lat: number | null;
    lon: number | null;
}

// ─── Filter Sheet ─────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
    { id: 'rating', label: 'Highest Rated', icon: '⭐' },
    { id: 'distance', label: 'Nearest First', icon: '📍' },
];
const RATING_OPTIONS = [
    { label: 'Any Rating', value: 0 },
    { label: '4.5+ Stars', value: 4.5 },
    { label: '4.0+ Stars', value: 4.0 },
    { label: '3.5+ Stars', value: 3.5 },
];
const AVAIL_OPTIONS = [
    { label: 'All', value: 'all' },
    { label: 'Available Now', value: 'available' },
];

interface FilterSheetProps {
    visible: boolean;
    onClose: () => void;
    sort: string;
    minRating: number;
    availability: string;
    hasLocation: boolean;
    onApply: (sort: string, minRating: number, availability: string) => void;
}

const FilterSheet = ({ visible, onClose, sort, minRating, availability, hasLocation, onApply }: FilterSheetProps) => {
    const [localSort, setLocalSort] = useState(sort);
    const [localRating, setLocalRating] = useState(minRating);
    const [localAvail, setLocalAvail] = useState(availability);
    const slideAnim = useRef(new Animated.Value(600)).current;
    const bgAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            setLocalSort(sort); setLocalRating(minRating); setLocalAvail(availability);
            Animated.parallel([
                Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
                Animated.timing(bgAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, { toValue: 600, duration: 220, useNativeDriver: true }),
                Animated.timing(bgAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
            ]).start();
        }
    }, [visible]);

    if (!visible) return null;
    const bgColor = bgAnim.interpolate({ inputRange: [0, 1], outputRange: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.5)'] });

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
            <Animated.View style={[fst.backdrop, { backgroundColor: bgColor }]}>
                <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
                <Animated.View style={[fst.sheet, { transform: [{ translateY: slideAnim }] }]}>
                    <View style={fst.handle} />
                    <View style={fst.titleRow}>
                        <Text style={fst.title}>Filter & Sort</Text>
                        <TouchableOpacity onPress={onClose} style={fst.closeBtn}>
                            <X size={18} color="#64748B" strokeWidth={2.5} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                        {/* Sort */}
                        <Text style={fst.sectionTitle}>Sort By</Text>
                        <View style={fst.optRow}>
                            {SORT_OPTIONS.map(opt => {
                                const disabled = opt.id === 'distance' && !hasLocation;
                                const active = localSort === opt.id && !disabled;
                                return (
                                    <TouchableOpacity
                                        key={opt.id}
                                        style={[fst.optChip, active && fst.optChipActive, disabled && fst.optChipDisabled]}
                                        onPress={() => !disabled && setLocalSort(opt.id)}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[fst.optChipText, active && fst.optChipTextActive]}>
                                            {opt.icon} {opt.label}
                                        </Text>
                                        {disabled && <Text style={fst.optChipNote}>  (enable location)</Text>}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Rating */}
                        <Text style={fst.sectionTitle}>Minimum Rating</Text>
                        <View style={fst.optRow}>
                            {RATING_OPTIONS.map(opt => (
                                <TouchableOpacity
                                    key={opt.value}
                                    style={[fst.optChip, localRating === opt.value && fst.optChipActive]}
                                    onPress={() => setLocalRating(opt.value)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[fst.optChipText, localRating === opt.value && fst.optChipTextActive]}>
                                        {opt.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Availability */}
                        <Text style={fst.sectionTitle}>Availability</Text>
                        <View style={fst.optRow}>
                            {AVAIL_OPTIONS.map(opt => (
                                <TouchableOpacity
                                    key={opt.value}
                                    style={[fst.optChip, localAvail === opt.value && fst.optChipActive]}
                                    onPress={() => setLocalAvail(opt.value)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[fst.optChipText, localAvail === opt.value && fst.optChipTextActive]}>
                                        {opt.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    {/* Apply */}
                    <TouchableOpacity
                        style={fst.applyBtn}
                        onPress={() => { onApply(localSort, localRating, localAvail); onClose(); }}
                        activeOpacity={0.85}
                    >
                        <LinearGradient colors={['#7C3AFF', '#5B21B6']} style={fst.applyGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                            <Text style={fst.applyText}>Apply Filters</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

const fst = StyleSheet.create({
    backdrop: { flex: 1, justifyContent: 'flex-end' },
    sheet: {
        backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28,
        paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40,
        maxHeight: '85%',
    },
    handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0', alignSelf: 'center', marginBottom: 16 },
    titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    title: { fontSize: 19, fontWeight: '800', color: '#0F172A' },
    closeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
    sectionTitle: { fontSize: 13, fontWeight: '700', color: '#64748B', letterSpacing: 0.5, marginBottom: 10, marginTop: 16 },
    optRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    optChip: {
        paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20,
        backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0',
    },
    optChipActive: { backgroundColor: PURPLE, borderColor: PURPLE },
    optChipDisabled: { opacity: 0.45 },
    optChipText: { fontSize: 13, fontWeight: '600', color: '#475569' },
    optChipTextActive: { color: '#fff' },
    optChipNote: { fontSize: 10, color: '#94A3B8' },
    applyBtn: { marginTop: 20, borderRadius: 16, overflow: 'hidden' },
    applyGrad: { paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
    applyText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});

// ─── Provider Detail Modal ─────────────────────────────────────────────────────
const ProviderModal = ({
    provider, visible, onClose,
}: { provider: Provider | null; visible: boolean; onClose: () => void }) => {
    if (!provider) return null;
    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <View style={sm.root}>
                <StatusBar barStyle="light-content" />
                <View style={sm.heroWrap}>
                    <Image
                        source={CAT_IMAGES[provider.category] ?? { uri: provider.image }}
                        style={sm.hero}
                        resizeMode="cover"
                    />
                    <LinearGradient colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.85)']} style={sm.heroScrim} />
                    <TouchableOpacity style={sm.closeBtn} onPress={onClose}>
                        <X size={18} color="#1A1A2E" strokeWidth={2.5} />
                    </TouchableOpacity>
                    <View style={sm.heroContent}>
                        {provider.verified && (
                            <View style={sm.verifiedBadge}>
                                <ShieldCheck size={12} color="#10B981" />
                                <Text style={sm.verifiedText}>SlotB Verified</Text>
                            </View>
                        )}
                        <Text style={sm.heroName}>{provider.name}</Text>
                        <Text style={sm.heroCat}>{provider.category} Professional</Text>
                    </View>
                </View>

                <ScrollView contentContainerStyle={sm.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={sm.statsRow}>
                        <View style={sm.statBox}>
                            <Star size={20} color={AMBER} fill={AMBER} />
                            <Text style={sm.statVal}>{provider.rating.toFixed(1)}</Text>
                            <Text style={sm.statLbl}>{provider.reviews} reviews</Text>
                        </View>
                        <View style={sm.statBox}>
                            <Clock size={20} color={PURPLE} strokeWidth={2} />
                            <Text style={sm.statVal}>{provider.exp}</Text>
                            <Text style={sm.statLbl}>Experience</Text>
                        </View>
                        <View style={sm.statBox}>
                            <MapPin size={20} color="#0D1B4B" strokeWidth={2} />
                            <Text style={sm.statVal}>{provider.dist_text === 'Location N/A' ? 'N/A' : provider.dist_text}</Text>
                            <Text style={sm.statLbl}>Distance</Text>
                        </View>
                    </View>

                    {!!provider.address && (
                        <>
                            <Text style={sm.sectionTitle}>Address</Text>
                            <View style={sm.addressRow}>
                                <MapPin size={14} color={PURPLE} strokeWidth={2} />
                                <Text style={sm.aboutText}>{provider.address}</Text>
                            </View>
                        </>
                    )}

                    {provider.skills.length > 0 && (
                        <>
                            <Text style={sm.sectionTitle}>Services Offered</Text>
                            <View style={sm.skillsRow}>
                                {provider.skills.map((skill, i) => (
                                    <View key={i} style={sm.skillChip}>
                                        <CheckCircle2 size={12} color={PURPLE} />
                                        <Text style={sm.skillText}>{skill}</Text>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}

                    <View style={sm.availRow}>
                        <View style={[sm.availDot, { backgroundColor: provider.is_available ? '#10B981' : '#F59E0B' }]} />
                        <Text style={[sm.availText, { color: provider.is_available ? '#059669' : '#D97706' }]}>
                            {provider.status}
                        </Text>
                    </View>
                </ScrollView>

                <View style={sm.bottomBar}>
                    <View>
                        <Text style={sm.priceLbl}>Visiting Charge</Text>
                        <Text style={sm.priceVal}>{provider.price}</Text>
                    </View>
                    <TouchableOpacity
                        style={sm.bookBtn}
                        activeOpacity={0.88}
                        onPress={() => Alert.alert('📞 Call Provider', `Call ${provider.name}?`, [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Call', onPress: () => { } },
                        ])}
                    >
                        <PhoneCall size={15} color="#fff" strokeWidth={2.5} />
                        <Text style={sm.bookBtnText}>Book Now</Text>
                        <ArrowRight size={15} color="#fff" strokeWidth={2.5} />
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const sm = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#fff' },
    heroWrap: { position: 'relative', height: 260 },
    hero: { width: '100%', height: '100%' },
    heroScrim: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 180 },
    closeBtn: {
        position: 'absolute', top: 16, right: 16,
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center',
    },
    heroContent: { position: 'absolute', bottom: 20, left: 20, right: 20 },
    verifiedBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start',
        backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 8,
    },
    verifiedText: { fontSize: 11, fontWeight: '700', color: '#065F46' },
    heroName: { fontSize: 24, fontWeight: '900', color: '#fff', marginBottom: 4 },
    heroCat: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
    scrollContent: { padding: 20, paddingBottom: 110 },
    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    statBox: {
        flex: 1, backgroundColor: '#F8FAFC', borderRadius: 16, padding: 14,
        alignItems: 'center', justifyContent: 'center', gap: 4,
        borderWidth: 1, borderColor: '#F1F5F9',
    },
    statVal: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginTop: 4 },
    statLbl: { fontSize: 11, color: '#64748B', fontWeight: '500' },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 10, marginTop: 14 },
    aboutText: { fontSize: 13, color: '#475569', lineHeight: 20, flex: 1 },
    addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
    skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    skillChip: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: '#F3F4F6', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
    },
    skillText: { fontSize: 13, fontWeight: '600', color: '#334155' },
    availRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18 },
    availDot: { width: 9, height: 9, borderRadius: 5 },
    availText: { fontSize: 14, fontWeight: '700' },
    bottomBar: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F1F5F9',
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 32,
    },
    priceLbl: { fontSize: 12, color: '#64748B', fontWeight: '500' },
    priceVal: { fontSize: 22, fontWeight: '900', color: '#0F172A' },
    bookBtn: {
        backgroundColor: '#1D4ED8', flexDirection: 'row', alignItems: 'center', gap: 8,
        paddingHorizontal: 22, paddingVertical: 13, borderRadius: 16,
    },
    bookBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
});

// ─── Provider Card ─────────────────────────────────────────────────────────────
const ProviderCard = ({ prov, onInfo }: { prov: Provider; onInfo: () => void }) => {
    // Use local category image; fall back to remote URI only if it's a real image (not placehold.co)
    const imgSource = CAT_IMAGES[prov.category]
        ? CAT_IMAGES[prov.category]
        : { uri: prov.image };
    return (
        <View style={pc.card}>
            <View style={pc.imgWrap}>
                <Image source={imgSource} style={pc.img} resizeMode="cover" />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={pc.scrim} />
                <View style={[pc.statusPill, { backgroundColor: prov.is_available ? '#10B981' : '#F59E0B' }]}>
                    <Text style={pc.statusText}>{prov.status}</Text>
                </View>
                {prov.dist_text !== 'Location N/A' && (
                    <View style={pc.distPill}>
                        <Navigation2 size={9} color="#fff" strokeWidth={2.5} />
                        <Text style={pc.distText}>{prov.dist_text}</Text>
                    </View>
                )}
            </View>

            <View style={pc.body}>
                <View style={pc.headerRow}>
                    <Text style={pc.name} numberOfLines={1}>{prov.name}</Text>
                    {prov.verified && <ShieldCheck size={14} color="#10B981" />}
                </View>

                <View style={pc.metaRow}>
                    <Star size={11} color={AMBER} fill={AMBER} />
                    <Text style={pc.rating}>{prov.rating.toFixed(1)} <Text style={{ color: '#94A3B8' }}>({prov.reviews})</Text></Text>
                    <Text style={pc.dot}>·</Text>
                    <Text style={pc.exp}>{prov.exp}</Text>
                    <Text style={pc.dot}>·</Text>
                    <View style={[pc.catBadge, { backgroundColor: '#EDE9FE' }]}>
                        <Text style={[pc.catBadgeText, { color: PURPLE }]}>{prov.category}</Text>
                    </View>
                </View>

                {prov.skills.length > 0 && (
                    <View style={pc.skills}>
                        <Text style={pc.skillsText} numberOfLines={1}>{prov.skills.join(' • ')}</Text>
                    </View>
                )}

                <View style={pc.actions}>
                    <TouchableOpacity style={pc.infoBtn} onPress={onInfo} activeOpacity={0.8}>
                        <Text style={pc.infoText}>View Info</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={pc.bookBtn} activeOpacity={0.85} onPress={onInfo}>
                        <Text style={pc.bookText}>Book  {prov.price}</Text>
                        <ArrowRight size={12} color="#fff" strokeWidth={2.5} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const pc = StyleSheet.create({
    card: {
        backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 16,
        borderRadius: 20, overflow: 'hidden',
        borderWidth: 1, borderColor: '#F1F5F9',
        elevation: 8,
        shadowColor: PURPLE_DARK, shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08, shadowRadius: 12,
    },
    imgWrap: { height: 140, position: 'relative' },
    img: { width: '100%', height: '100%' },
    scrim: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60 },
    statusPill: { position: 'absolute', top: 12, left: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    statusText: { fontSize: 10, fontWeight: '800', color: '#fff' },
    distPill: {
        position: 'absolute', top: 12, right: 12,
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
    },
    distText: { fontSize: 10, fontWeight: '700', color: '#fff' },
    body: { padding: 14 },
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    name: { fontSize: 17, fontWeight: '800', color: '#0F172A', flexShrink: 1 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8, flexWrap: 'wrap' },
    rating: { fontSize: 12, fontWeight: '700', color: '#334155' },
    dot: { fontSize: 12, color: '#CBD5E1' },
    exp: { fontSize: 12, fontWeight: '600', color: '#475569' },
    catBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: '#FFF1F2' },
    catBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3, color: PINK },
    skills: { backgroundColor: '#F8FAFC', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8, marginBottom: 12 },
    skillsText: { fontSize: 11, color: '#475569', fontWeight: '500' },
    actions: { flexDirection: 'row', gap: 10 },
    infoBtn: {
        flex: 1, alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#F1F5F9', borderRadius: 12, paddingVertical: 10,
    },
    infoText: { fontSize: 13, fontWeight: '700', color: '#334155' },
    bookBtn: {
        flex: 1.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
        backgroundColor: '#1D4ED8', borderRadius: 12, paddingVertical: 10,
    },
    bookText: { fontSize: 13, fontWeight: '800', color: '#fff' },
});

// ─── Category Chip ─────────────────────────────────────────────────────────────
const CatChip = ({
    cat, active, onPress,
}: { cat: Category; active: boolean; onPress: () => void }) => (
    <TouchableOpacity
        style={[styles.catChip, active && { backgroundColor: PINK, borderColor: PINK }]}
        onPress={onPress}
        activeOpacity={0.8}
    >
        <Text style={[styles.catLabel, active && styles.catLabelActive]}>{cat.label}</Text>
    </TouchableOpacity>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ServicesScreen() {
    const scrollY = useRef(new Animated.Value(0)).current;

    const [categories, setCategories] = useState<Category[]>([]);
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeCat, setActiveCat] = useState('All');
    const [selectedProv, setSelectedProv] = useState<Provider | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [filterVisible, setFilterVisible] = useState(false);
    const [searchText, setSearchText] = useState('');

    // Filter state
    const [sort, setSort] = useState('rating');
    const [minRating, setMinRating] = useState(0);
    const [availability, setAvailability] = useState('all');

    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const { userLocation, coords, refreshLocation, isLocating } = useLocation();
    const [locationModalVisible, setLocationModalVisible] = useState(false);

    // ── Fetch categories ──────────────────────────────────────────────────────
    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch(`${BASE_URL}?action=get_categories`);
            const text = await res.text();
            const json = JSON.parse(text.substring(text.indexOf('{')));
            if (json.status === 'ok') setCategories(json.categories);
        } catch (_) { }
    }, []);

    // ── Fetch providers ───────────────────────────────────────────────────────
    const fetchProviders = useCallback(async (cat = activeCat, s = sort, mr = minRating, lat = coords?.latitude || null, lon = coords?.longitude || null) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                action: 'get_providers',
                category: cat,
                sort: s,
                min_rating: String(mr),
                limit: '60',
            });
            if (lat !== null && lon !== null) {
                params.append('lat', String(lat));
                params.append('lon', String(lon));
            }
            const res = await fetch(`${BASE_URL}?${params.toString()}`);
            const text = await res.text();
            const json = JSON.parse(text.substring(text.indexOf('{')));
            if (json.status === 'ok') setProviders(json.providers);
        } catch (_) { }
        finally { setLoading(false); setRefreshing(false); }
    }, [activeCat, sort, minRating, coords]);

    useEffect(() => { fetchCategories(); }, []);
    useEffect(() => { fetchProviders(activeCat, sort, minRating, coords?.latitude || null, coords?.longitude || null); }, [activeCat, sort, minRating, coords]);

    const onRefresh = () => { setRefreshing(true); fetchProviders(); };

    // ── Apply filters ─────────────────────────────────────────────────────────
    const applyFilters = (newSort: string, newRating: number, newAvail: string) => {
        setSort(newSort);
        setMinRating(newRating);
        setAvailability(newAvail);
    };

    // ── Derived list ──────────────────────────────────────────────────────────
    const filtered = providers.filter(p => {
        if (availability === 'available' && !p.is_available) return false;
        if (searchText.trim()) {
            const q = searchText.toLowerCase();
            return p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) ||
                p.skills.some(s => s.toLowerCase().includes(q));
        }
        return true;
    });

    // ── Filter badge count ────────────────────────────────────────────────────
    let filterBadge = 0;
    if (sort !== 'rating') filterBadge++;
    if (minRating > 0) filterBadge++;
    if (availability !== 'all') filterBadge++;

    // ── Active category color ──────────────────────────────────────────────────
    const activeCatObj = categories.find(c => c.id === activeCat);
    const accentColor = activeCatObj?.color ?? PURPLE;

    // ── Salon-style header collapse ───────────────────────────────────────────
    const SCROLL_DISTANCE = 100;
    const EXPANDED_HEADER = 112;
    const COLLAPSED_HEADER = 52;

    const headerHeight = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE],
        outputRange: [EXPANDED_HEADER + insets.top, COLLAPSED_HEADER + insets.top],
        extrapolate: 'clamp',
    });
    const topRowOpacity = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE * 0.6],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });
    const topRowTranslateY = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE * 0.6],
        outputRange: [0, -24],
        extrapolate: 'clamp',
    });
    const searchTranslateY = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE],
        outputRange: [0, -60],
        extrapolate: 'clamp',
    });
    const shadowOpacity = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE * 0.5],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    return (
        <View style={styles.screen}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

            {/* ── SALON-STYLE LIGHT HEADER ── */}
            <Animated.View style={[styles.header, { height: headerHeight }]}>
                {/* Shadow line on scroll */}
                <Animated.View style={[styles.headerShadowLine, { opacity: shadowOpacity }]} pointerEvents="none" />

                <View style={[styles.headerContent, { paddingTop: insets.top + 4 }]}>
                    {/* Top row: location pill + bell */}
                    <Animated.View style={[
                        styles.headerTopRow,
                        { opacity: topRowOpacity, transform: [{ translateY: topRowTranslateY }] },
                    ]}>
                        <TouchableOpacity
                            style={styles.locationPill}
                            activeOpacity={0.8}
                            onPress={() => setLocationModalVisible(true)}
                        >
                            <MapPin size={14} color="#1A73E8" strokeWidth={2.2} />
                            <View style={styles.locationTextWrap}>
                                <Text style={styles.locationCity} numberOfLines={1}>{userLocation}</Text>
                                <Text style={styles.locationSub}>Nearby Services</Text>
                            </View>
                            <ChevronDown size={13} color="#6B7280" strokeWidth={2} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.bellBtn}
                            onPress={() => navigation.navigate('Notifications')}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Bell size={18} color="#374151" strokeWidth={2} />
                            <View style={styles.bellDot} />
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Sticky Search bar */}
                    <Animated.View style={[styles.searchSpace, { transform: [{ translateY: searchTranslateY }] }]}>
                        <View style={styles.searchWrapper}>
                            <Search size={16} color="#9CA3AF" strokeWidth={2} style={{ marginRight: 8 }} />
                            <TextInput
                                style={styles.searchPlaceholderTxt}
                                placeholder="Search services..."
                                placeholderTextColor="#aaa"
                                value={searchText}
                                onChangeText={setSearchText}
                                selectionColor={PINK}
                            />
                            <TouchableOpacity
                                style={styles.headerFilterBtn}
                                activeOpacity={0.7}
                                onPress={() => setFilterVisible(true)}
                            >
                                <SlidersHorizontal size={16} color={filterBadge > 0 ? PINK : "#6B7280"} strokeWidth={2.2} />
                                {filterBadge > 0 && <View style={styles.headerFilterDot} />}
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </Animated.View>

            <Animated.FlatList
                data={filtered}
                keyExtractor={p => String(p.id)}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
                contentContainerStyle={{ paddingTop: EXPANDED_HEADER + insets.top + 8, paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PINK} colors={[PINK]} progressViewOffset={EXPANDED_HEADER + insets.top} />}
                ListHeaderComponent={() => (
                    <View style={{ paddingTop: 8 }}>

                        {/* ── CATEGORIES ── */}
                        {categories.length > 0 ? (
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.catScroll}
                                contentContainerStyle={styles.catContent}
                            >
                                {categories.map(cat => (
                                    <CatChip
                                        key={cat.id}
                                        cat={cat}
                                        active={activeCat === cat.id}
                                        onPress={() => setActiveCat(cat.id)}
                                    />
                                ))}
                            </ScrollView>
                        ) : (
                            <ActivityIndicator color={PURPLE} style={{ marginVertical: 16 }} />
                        )}

                        {/* ── Header chips row ── */}
                        <View style={styles.resultMeta}>
                            <Text style={styles.listTitle}>
                                {loading
                                    ? 'Loading...'
                                    : `${filtered.length} Provider${filtered.length !== 1 ? 's' : ''} Found`}
                            </Text>
                            {sort === 'distance' && coords !== null && (
                                <View style={styles.locChip}>
                                    <Navigation2 size={11} color="#fff" strokeWidth={2.5} />
                                    <Text style={styles.locChipText}>Near You</Text>
                                </View>
                            )}
                            {minRating > 0 && (
                                <View style={styles.ratingChip}>
                                    <Star size={11} color="#fff" fill="#fff" />
                                    <Text style={styles.ratingChipText}>{minRating}+</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyWrap}>
                        {loading
                            ? <ActivityIndicator size="large" color={PURPLE} />
                            : (
                                <>
                                    <Text style={styles.emptyEmoji}>🔍</Text>
                                    <Text style={styles.emptyTitle}>No providers found</Text>
                                    <Text style={styles.emptySub}>Try a different category or adjust your filters</Text>
                                    <TouchableOpacity style={styles.resetBtn} onPress={() => {
                                        setActiveCat('All');
                                        setSort('rating');
                                        setMinRating(0);
                                        setAvailability('all');
                                        setSearchText('');
                                    }}>
                                        <Text style={styles.resetBtnText}>Reset Filters</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                    </View>
                )}
                renderItem={({ item }) => (
                    <ProviderCard
                        prov={item}
                        onInfo={() => { setSelectedProv(item); setModalVisible(true); }}
                    />
                )}
            />

            {/* ── MODAL ── */}
            <ProviderModal
                provider={selectedProv}
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
            />

            {/* ── FILTER SHEET ── */}
            <FilterSheet
                visible={filterVisible}
                onClose={() => setFilterVisible(false)}
                sort={sort}
                minRating={minRating}
                availability={availability}
                hasLocation={coords !== null}
                onApply={applyFilters}
            />

            <LocationSelectorModal
                visible={locationModalVisible}
                onClose={() => setLocationModalVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#F6F7FA' },

    // ── Salon-style light header ──────────────────────────────────────────────
    header: {
        position: 'absolute', top: 0, left: 0, right: 0,
        zIndex: 100, overflow: 'hidden',
        backgroundColor: '#F6F7FA',
    },
    headerShadowLine: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 1, backgroundColor: 'rgba(0,0,0,0.08)',
    },
    headerContent: { flex: 1, paddingHorizontal: 16 },
    headerTopRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        height: 52, marginBottom: 6,
    },
    locationPill: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#EBEBEB',
        borderRadius: 22, paddingHorizontal: 12, paddingVertical: 7, gap: 6,
        ...Platform.select({
            android: { elevation: 1 },
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
        }),
    },
    locationTextWrap: { flexShrink: 1 },
    locationCity: { fontSize: 14, fontWeight: '700', color: '#1A1D26', letterSpacing: 0.1 },
    locationSub: { fontSize: 10, color: '#6B7280', fontWeight: '500' },
    bellBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#EBEBEB',
        alignItems: 'center', justifyContent: 'center',
        ...Platform.select({
            android: { elevation: 1 },
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
        }),
    },
    bellDot: {
        position: 'absolute', top: 9, right: 10,
        width: 7, height: 7, borderRadius: 4,
        backgroundColor: '#EF4444', borderWidth: 1.5, borderColor: '#EBEBEB',
    },
    searchSpace: { width: '100%' },
    searchWrapper: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#fff', borderRadius: 28, height: 46,
        paddingHorizontal: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
        borderWidth: 1, borderColor: '#EBEBEB',
    },
    searchPlaceholderTxt: { flex: 1, fontSize: 14, color: '#1A1D26', fontWeight: '500', paddingVertical: 0 },
    headerFilterBtn: { padding: 4, marginLeft: 8 },
    headerFilterDot: {
        position: 'absolute', top: 2, right: 2,
        width: 6, height: 6, borderRadius: 3,
        backgroundColor: PINK,
    },

    // Search (in list header)
    searchWrap: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, gap: 10, marginTop: 8, marginBottom: 4,
    },
    searchInner: {
        flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: '#fff', borderRadius: 14, height: 46, paddingHorizontal: 14,
        borderWidth: 1, borderColor: '#E2E8F0',
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
    },
    searchInput: { flex: 1, fontSize: 14, color: '#1E293B', fontWeight: '500' },

    // Filter button
    filterBtn: {
        width: 46, height: 46, borderRadius: 14,
        backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center',
        borderWidth: 1.5, borderColor: '#DDD6FE',
    },
    filterBtnActive: { backgroundColor: PURPLE, borderColor: PURPLE },
    filterBadge: {
        position: 'absolute', top: -4, right: -4,
        width: 18, height: 18, borderRadius: 9,
        backgroundColor: '#F59E0B', alignItems: 'center', justifyContent: 'center',
    },
    filterBadgeText: { fontSize: 10, fontWeight: '900', color: '#fff' },

    // Categories
    catScroll: { flexGrow: 0, marginTop: 10 },
    catContent: { paddingHorizontal: 16, gap: 8, paddingBottom: 12 },
    catChip: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 14, paddingVertical: 9,
        backgroundColor: '#fff', borderRadius: 30,
        borderWidth: 1.5, borderColor: '#E2E8F0',
        elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2,
    },
    catEmoji: { fontSize: 14 },
    catLabel: { fontSize: 13, fontWeight: '700', color: '#64748B' },
    catLabelActive: { color: '#fff' },

    // Results meta
    resultMeta: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        marginHorizontal: 16, marginBottom: 12, marginTop: 4,
    },
    listTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A', flex: 1 },
    locChip: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#1D4ED8', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
    },
    locChipText: { fontSize: 10, fontWeight: '700', color: '#fff' },
    ratingChip: {
        flexDirection: 'row', alignItems: 'center', gap: 3,
        backgroundColor: AMBER, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 10,
    },
    ratingChipText: { fontSize: 10, fontWeight: '800', color: '#fff' },

    // Empty state
    emptyWrap: { paddingTop: 60, alignItems: 'center', paddingHorizontal: 32 },
    emptyEmoji: { fontSize: 52, marginBottom: 16 },
    emptyTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 8, textAlign: 'center' },
    emptySub: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
    resetBtn: { backgroundColor: '#1D4ED8', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 14 },
    resetBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});

