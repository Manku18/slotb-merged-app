import React from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { MapPin, Bell, ChevronDown } from 'lucide-react-native';

import CategoryRow from './CategoryRow';
import CollapsibleSearchBar from './CollapsibleSearchBar';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import LocationSelectorModal from './LocationSelectorModal';

// ── Animation constants ──────────────────────────────────────────────
const SCROLL_DISTANCE = 110;
const EXPANDED_HEADER = 185;
const COLLAPSED_HEADER = 85; // Increased to 85 to prevent any clipping from below

export type CardColorConfig = {
    id: string;
    headerGrad: [string, string, string];
    headerAccent: string;
};

type Props = {
    scrollY: Animated.Value;
    scrollX: Animated.Value;
    cards: CardColorConfig[];
    cardWidth: number;
};

export default function HomeHeader({ scrollY, scrollX, cards, cardWidth }: Props) {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const { userLocation } = useLocation();
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = React.useState(0);
    const [locationModalVisible, setLocationModalVisible] = React.useState(false);

    const checkUnread = React.useCallback(async () => {
        if (!user?.email) {
            setUnreadCount(0);
            return;
        }
        try {
            const url = `https://slotb.in/api_notifications.php?action=get_unread_count&email=${encodeURIComponent(user.email)}&district=${encodeURIComponent(userLocation)}`;
            const res = await fetch(url);
            const text = await res.text();

            try {
                const d = JSON.parse(text);
                if (d.status === 'ok') setUnreadCount(d.count);
            } catch (jsonError) {
                console.error('[HomeHeader] JSON Parse error. Raw response:', text);
                throw jsonError;
            }
        } catch (e) {
            console.error('[HomeHeader] Error checking unread:', e);
        }
    }, [user?.email, userLocation]);

    // Refresh on focus (whenever we come back from Notification screen)
    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            checkUnread();
        });
        return unsubscribe;
    }, [navigation, checkUnread]);

    // Periodic refresh
    React.useEffect(() => {
        checkUnread();
        const timer = setInterval(checkUnread, 30000); // Check every 30s
        return () => clearInterval(timer);
    }, [checkUnread]);


    // ── Interpolations ──────────────────────────────────────────────
    // Header height: 220 → 70 (+ safe area)
    const headerHeight = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE],
        outputRange: [EXPANDED_HEADER + insets.top, COLLAPSED_HEADER + insets.top],
        extrapolate: 'clamp',
    });

    // Gradient opacity: 1 → 0 (fades the entire gradient layer)
    const gradientOpacity = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE * 0.65],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    // Top row (location + bell) opacity: fade out
    const topRowOpacity = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE * 0.6],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    // Top row translate up
    const topRowTranslateY = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE * 0.6],
        outputRange: [0, -30],
        extrapolate: 'clamp',
    });

    // Search bar translate upward — sitting comfortably in the collapsed header
    const searchTranslateY = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE],
        outputRange: [0, -125], // Moves search bar up further
        extrapolate: 'clamp',
    });

    // Gradient height for the morphing color zone
    const GRAD_H = insets.top + 140;

    return (
        <Animated.View style={[styles.container, { height: headerHeight }]}>
            {/* ── Morphing gradient background (color changes with active card) ── */}
            <Animated.View
                style={[styles.gradientClip, { height: GRAD_H, opacity: gradientOpacity }]}
                pointerEvents="none"
            >
                {cards.map((c, i) => {
                    const opacity = scrollX.interpolate({
                        inputRange: [(i - 1) * cardWidth, i * cardWidth, (i + 1) * cardWidth],
                        outputRange: [0, 1, 0],
                        extrapolate: 'clamp',
                    });
                    return (
                        <Animated.View
                            key={c.id}
                            style={[StyleSheet.absoluteFillObject, { opacity: Animated.multiply(opacity, 0.55) }]}
                            pointerEvents="none"
                        >
                            <LinearGradient
                                colors={[c.headerGrad[0], c.headerGrad[1], 'transparent'] as any}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0, y: 1 }}
                                style={StyleSheet.absoluteFillObject}
                            />
                        </Animated.View>
                    );
                })}

                {/* Soft sky-blue tint layer underneath */}
                <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
                    <LinearGradient
                        colors={['rgba(179,224,255,0.35)', 'rgba(214,238,255,0.15)', 'transparent'] as any}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={StyleSheet.absoluteFillObject}
                    />
                </View>
            </Animated.View>

            {/* ── Content ── */}
            <View style={[styles.content, { paddingTop: insets.top + 4 }]}>
                {/* ── Top Row: Location + Bell ── */}
                <Animated.View
                    style={[
                        styles.topRow,
                        {
                            opacity: topRowOpacity,
                            transform: [{ translateY: topRowTranslateY }],
                        },
                    ]}
                >
                    <Pressable
                        style={styles.locationPill}
                        onPress={() => setLocationModalVisible(true)}
                    >
                        <MapPin size={14} color="#1A73E8" strokeWidth={2.2} />
                        <View style={styles.locationText}>
                            <Text style={styles.locationCity} numberOfLines={1}>
                                {userLocation}
                            </Text>
                            <Text style={styles.locationSub} numberOfLines={1}>
                                Current
                            </Text>
                        </View>
                        <ChevronDown size={14} color="#6B7280" strokeWidth={2} />
                    </Pressable>

                    <Pressable
                        style={styles.bellBtn}
                        onPress={() => navigation.navigate('Notifications')}
                        hitSlop={8}
                    >
                        <Bell size={18} color="#374151" strokeWidth={2} />
                        {unreadCount > 0 && <View style={styles.bellDot} />}
                    </Pressable>
                </Animated.View>

                {/* ── Category Row ── */}
                <View style={styles.categorySpace}>
                    <CategoryRow scrollY={scrollY} navigation={navigation} />
                </View>

                {/* ── Search Bar (translates up on scroll) ── */}
                <Animated.View
                    style={[
                        styles.searchSpace,
                        { transform: [{ translateY: searchTranslateY }] },
                    ]}
                >
                    <CollapsibleSearchBar scrollY={scrollY} />
                </Animated.View>

                <LocationSelectorModal
                    visible={locationModalVisible}
                    onClose={() => setLocationModalVisible(false)}
                />
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        // Removed overflow: 'hidden' to prevent clipping shadows or bottom edges
        // NO background color — fully transparent when collapsed
    },
    gradientClip: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        overflow: 'hidden',
    },
    content: {
        flex: 1,
    },
    // ── Top Row ──
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 6,
    },
    locationPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)', // Glassy transparent
        borderRadius: 22,
        paddingHorizontal: 12,
        paddingVertical: 7,
        gap: 6,
        flexShrink: 1,
        maxWidth: '72%',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    locationCity: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
        letterSpacing: 0.1,
    },
    locationText: {
        flexShrink: 1,
    },
    locationSub: {
        fontSize: 10,
        color: '#6B7280',
        fontWeight: '500',
    },
    bellBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.15)', // Glassy transparent
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    bellDot: {
        position: 'absolute',
        top: 8,
        right: 9,
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: '#EF4444',
        borderWidth: 1.5,
        borderColor: 'rgba(235, 235, 235, 0.1)', // Subtle border
    },
    // ── Category & Search spacing ──
    categorySpace: {
        marginBottom: 10,
    },
    searchSpace: {},
});
