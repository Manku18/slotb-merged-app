import React from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Platform, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { MapPin, Bell, ArrowLeft, Search, QrCode, ChevronDown } from 'lucide-react-native';

// ── Animation constants ──
const SCROLL_DISTANCE = 130;
const EXPANDED_HEADER = 185;
const COLLAPSED_HEADER = 52;

type Props = {
    title: string;
    scrollY: Animated.Value;
    searchPlaceholder?: string;
    gradientColors?: [string, string, string];
    accentColor?: string;
};

export default function SectionHeader({
    title,
    scrollY,
    searchPlaceholder = 'Search…',
    gradientColors = ['#0F172A', '#1E293B', '#334155'], // Default premium dark
    accentColor = '#7C3AFF',
}: Props) {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();

    // ── Interpolations (same as HomeHeader) ──
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
        outputRange: [0, -(EXPANDED_HEADER - COLLAPSED_HEADER - 40)],
        extrapolate: 'clamp',
    });

    const searchBgOpacity = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE * 0.5],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    const GRAD_H = insets.top + 140;

    return (
        <Animated.View style={[styles.container, { height: headerHeight }]}>
            {/* ── Gradient Background ── */}
            <Animated.View
                style={[styles.gradientClip, { height: GRAD_H, opacity: gradientOpacity }]}
                pointerEvents="none"
            >
                <LinearGradient
                    colors={[gradientColors[0], gradientColors[1], 'transparent'] as any}
                    style={StyleSheet.absoluteFillObject}
                />
            </Animated.View>

            {/* ── Content ── */}
            <View style={[styles.content, { paddingTop: insets.top + 4 }]}>
                {/* ── Top Row: Back + Title + Bell ── */}
                <Animated.View
                    style={[
                        styles.topRow,
                        {
                            opacity: topRowOpacity,
                            transform: [{ translateY: topRowTranslateY }],
                        },
                    ]}
                >
                    <View style={styles.leftRow}>
                        <Pressable
                            onPress={() => navigation.goBack()}
                            style={styles.backBtn}
                            hitSlop={12}
                        >
                            <ArrowLeft size={20} color="#fff" strokeWidth={2.5} />
                        </Pressable>
                        <View style={styles.locationPill}>
                            <MapPin size={12} color={accentColor} strokeWidth={2.2} />
                            <Text style={styles.locationCity} numberOfLines={1}>
                                {title}
                            </Text>
                            <ChevronDown size={12} color="#9CA3AF" strokeWidth={2} />
                        </View>
                    </View>

                    <Pressable
                        style={styles.bellBtn}
                        onPress={() => navigation.navigate('Notifications')}
                        hitSlop={8}
                    >
                        <Bell size={18} color="#fff" strokeWidth={2} />
                        <View style={styles.bellDot} />
                    </Pressable>
                </Animated.View>

                {/* ── Search Bar ── */}
                <Animated.View
                    style={[
                        styles.searchSpace,
                        { transform: [{ translateY: searchTranslateY }] },
                    ]}
                >
                    <Animated.View
                        style={[styles.searchBlurBg, { opacity: searchBgOpacity }]}
                        pointerEvents="none"
                    />
                    <View style={styles.searchWrapper}>
                        <Search size={18} color="#9CA3AF" strokeWidth={2} style={styles.searchIcon} />
                        <Text style={styles.searchPlaceholder}>{searchPlaceholder}</Text>
                        <TouchableOpacity style={styles.qrBtn} activeOpacity={0.8}>
                            <QrCode size={18} color="#6B7280" strokeWidth={1.8} />
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute', top: 0, left: 0, right: 0,
        zIndex: 100, overflow: 'hidden',
        backgroundColor: '#F6F7FA', // Matches collapsed state
    },
    gradientClip: {
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: -1,
    },
    content: {
        flex: 1, paddingHorizontal: 16,
    },
    topRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        height: 48, marginBottom: 12,
    },
    leftRow: {
        flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1,
    },
    backBtn: {
        width: 36, height: 36, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center', justifyContent: 'center',
    },
    locationPill: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: 'rgba(255,255,255,0.95)',
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 4,
    },
    locationCity: { fontSize: 13, fontWeight: '800', color: '#1E293B' },
    bellBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center', justifyContent: 'center',
    },
    bellDot: {
        position: 'absolute', top: 8, right: 9, width: 6, height: 6,
        borderRadius: 3, backgroundColor: '#EF4444',
        borderWidth: 1.5, borderColor: '#fff',
    },
    searchSpace: { width: '100%' },
    searchBlurBg: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderRadius: 16, top: -4, bottom: -4,
    },
    searchWrapper: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#fff', borderRadius: 16, height: 48,
        paddingHorizontal: 16, elevation: 4,
        shadowColor: '#64748B', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1, shadowRadius: 10,
        borderWidth: 1, borderColor: '#F1F5F9',
    },
    searchIcon: { marginRight: 10 },
    searchPlaceholder: { flex: 1, fontSize: 14, color: '#9CA3AF', fontWeight: '500' },
    qrBtn: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
