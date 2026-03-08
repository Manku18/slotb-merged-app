import { RankingPodium } from '@/components/ranking/RankingPodium';
import { RankingBreakdownCard } from '@/components/ranking/RankingBreakdownCard';
import { useRanking } from '@/components/ranking/useRanking';
import { GlassCard } from '@/components/ui/GlassCard';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState, useMemo, useRef } from 'react';
import {
    StyleSheet, Text, TouchableOpacity, View, Modal, Pressable,
    FlatList, Dimensions, StatusBar, ActivityIndicator, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RankingData, RankingPeriod } from '@/components/ranking/rankingTypes';
import { LinearGradient } from 'expo-linear-gradient';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function RankingScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const [rangeTab, setRangeTab] = useState<'15km' | '60km' | 'state'>('15km');
    const [selectedPartner, setSelectedPartner] = useState<RankingData | null>(null);
    const [isFooterVisible, setIsFooterVisible] = useState(true);

    const {
        myRanking,
        leaderboard,
        isEligible,
        period,
        setPeriod,
        isLoading,
        refetch
    } = useRanking(rangeTab);

    // Mock "isFallback" check - if we want to show a message that we fell back to global
    // Ideally useRanking provides this info. For now, assume if leaderboard exists but range is 15km and myRank says I'm far away...
    // Actually, let's just use the fact that if the list is non-empty, we show it.

    const tabs: RankingPeriod[] = ['today', 'week', 'month', 'year'];

    const top3 = useMemo(() => leaderboard ? leaderboard.slice(0, 3) : [], [leaderboard]);
    const restOfList = useMemo(() => leaderboard ? leaderboard.slice(3) : [], [leaderboard]);

    const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 10 }).current;

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (!myRanking) return;
        const isMeVisible = viewableItems.some((item: any) => item.item.partnerId === myRanking.partnerId);
        setIsFooterVisible(!isMeVisible);
    }).current;

    const renderRankItem = ({ item, index }: { item: RankingData, index: number }) => {
        const rank = index + 4;
        const isMe = item.partnerId === myRanking?.partnerId;

        return (
            <TouchableOpacity
                style={[styles.rankRow, isMe && styles.meRowGlow]}
                onPress={() => setSelectedPartner(item)}
                activeOpacity={0.7}
            >
                <View style={styles.rankBadgeContainer}>
                    <Text style={[styles.rankText, isMe && styles.meRankText]}>{rank}</Text>
                </View>

                {/* Avatar with fallback initials */}
                <View style={[styles.avatarContainer, isMe && styles.meAvatarBorder]}>
                    {/* If we had an image URL we would use Image, for now text initials */}
                    <LinearGradient colors={['#E0E7FF', '#C7D2FE']} style={styles.avatarGradient}>
                        <Text style={styles.avatarText}>{item.partnerId.slice(0, 1).toUpperCase()}</Text>
                    </LinearGradient>
                </View>

                <View style={styles.infoContainer}>
                    <Text style={[styles.partnerName, isMe && styles.meNameText]} numberOfLines={1}>
                        {isMe ? 'You' : item.partnerId}
                    </Text>
                    <View style={styles.statsRow}>
                        <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                        <Text style={styles.statsText}>{item.performance.completedBookings} served</Text>
                    </View>
                </View>

                <View style={styles.scoreContainer}>
                    <Text style={[styles.scoreText, isMe && styles.meScoreText]}>{item.score}</Text>
                    <Text style={styles.ptsText}>pts</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" />

            {/* Premium Dark Gradient Background */}
            <LinearGradient
                colors={['#1F1D36', '#312E81', '#111827']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
            />

            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Leaderboard</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Range Tabs */}
                <View style={styles.rangeTabContainer}>
                    <View style={styles.rangeTabWrapper}>
                        {(['15km', '60km', 'state'] as const).map(s => (
                            <TouchableOpacity
                                key={s}
                                style={[styles.rangeTab, rangeTab === s && styles.rangeTabActive]}
                                onPress={() => setRangeTab(s)}
                            >
                                <Text style={[styles.rangeTabText, rangeTab === s && styles.rangeTabTextActive]}>
                                    {s === 'state' ? 'State' : s === '15km' ? 'City' : 'District'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Period Tabs */}
                <View style={styles.periodTabContainer}>
                    {tabs.map(t => (
                        <TouchableOpacity
                            key={t}
                            style={[styles.periodTab, period === t && styles.periodTabActive]}
                            onPress={() => setPeriod(t)}
                        >
                            <Text style={[styles.periodTabText, period === t && styles.periodTabTextActive]}>
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Content */}
                {isLoading && !leaderboard ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#FFD700" />
                        <Text style={styles.loadingText}>Loading Ranking...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={restOfList}
                        keyExtractor={(item, index) => `${item.partnerId}-${index}`}
                        renderItem={renderRankItem}
                        refreshing={isLoading}
                        onRefresh={refetch}
                        ListHeaderComponent={
                            <>
                                {top3.length > 0 ? (
                                    <RankingPodium top3={top3} onPressPartner={setSelectedPartner} />
                                ) : null}
                                <View style={{ height: 10 }} />
                            </>
                        }
                        ListEmptyComponent={
                            top3.length === 0 ? (
                                <View style={styles.emptyStateContainer}>
                                    <View style={styles.emptyIconCircle}>
                                        <Ionicons name="trophy-outline" size={40} color="rgba(255,255,255,0.5)" />
                                    </View>
                                    <Text style={styles.emptyTitle}>No Rankings Yet</Text>
                                    <Text style={styles.emptySubtitle}>
                                        Be the first to score points in this area! {"\n"}
                                        Try checking 'Global' or changing timeframe.
                                    </Text>
                                    <TouchableOpacity style={styles.refreshButton} onPress={refetch}>
                                        <Text style={styles.refreshButtonText}>Refresh</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : null
                        }
                        contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 16 }}
                        showsVerticalScrollIndicator={false}
                        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                        onViewableItemsChanged={onViewableItemsChanged}
                        viewabilityConfig={viewabilityConfig}
                    />
                )}

                {/* Sticky User Stat Footer - Now Clickable */}
                {isEligible && myRanking && isFooterVisible && (
                    <TouchableOpacity
                        style={styles.footerContainer}
                        activeOpacity={0.9}
                        onPress={() => setSelectedPartner(myRanking)}
                    >
                        <LinearGradient
                            colors={['rgba(30, 27, 75, 0.95)', 'rgba(49, 46, 129, 0.95)']}
                            style={styles.footerCard}
                        >
                            <View style={styles.footerInner}>
                                <View style={styles.footerRankBadge}>
                                    <Text style={styles.footerRankVal}>#{myRanking.rank}</Text>
                                </View>

                                <View style={{ flex: 1, paddingHorizontal: 12 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <Text style={styles.footerMeText}>You</Text>
                                        <View style={styles.footerMeTag}>
                                            <Text style={styles.footerMeTagText}>ME</Text>
                                        </View>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                        <Text style={styles.footerSubText}>{myRanking.performance.completedBookings} bookings</Text>
                                        <Ionicons name="chevron-up" size={12} color="rgba(255,255,255,0.4)" />
                                    </View>
                                </View>

                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={styles.footerScoreVal}>{myRanking.score}</Text>
                                    <Text style={styles.footerScoreLabel}>pts</Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </SafeAreaView>

            {/* Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={!!selectedPartner}
                onRequestClose={() => setSelectedPartner(null)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setSelectedPartner(null)}>
                    <Pressable style={styles.modalContent} onPress={() => { }}>
                        <RankingBreakdownCard rankingData={selectedPartner} />
                        <TouchableOpacity onPress={() => setSelectedPartner(null)} style={styles.modalCloseBtn}>
                            <Text style={styles.modalCloseText}>Close</Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
    },
    iconButton: {
        position: 'absolute',
        left: 16,
        top: 12,
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowRadius: 4,
    },
    rangeTabContainer: { paddingHorizontal: 20, marginBottom: 16, marginTop: 10 },
    rangeTabWrapper: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 4,
    },
    rangeTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
    rangeTabActive: { backgroundColor: '#4F46E5', shadowColor: '#4F46E5', shadowOpacity: 0.3, shadowRadius: 8 },
    rangeTabText: { color: 'rgba(255,255,255,0.6)', fontWeight: '600', fontSize: 13 },
    rangeTabTextActive: { color: '#FFF', fontWeight: 'bold' },

    periodTabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    periodTab: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: 'transparent',
    },
    periodTabActive: { backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
    periodTabText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '500' },
    periodTabTextActive: { color: '#FFD700', fontWeight: 'bold' },

    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: '#9CA3AF', marginTop: 12, fontSize: 14 },

    emptyStateContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 60, paddingHorizontal: 40 },
    emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    emptyTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
    emptySubtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center', lineHeight: 20 },
    refreshButton: { marginTop: 20, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20 },
    refreshButtonText: { color: '#FFF', fontSize: 13, fontWeight: '600' },

    rankRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(30, 41, 59, 0.6)', // Dark Slate Glass
        padding: 14,
        borderRadius: 20,
        marginBottom: 4, // Reduced padding between items
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    meRowGlow: {
        backgroundColor: 'rgba(79, 70, 229, 0.15)', // Indigo Tint
        borderColor: '#6366F1', // Indigo glow
        borderWidth: 1.5,
    },
    rankBadgeContainer: {
        width: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    rankText: { fontSize: 16, fontWeight: 'bold', color: '#9CA3AF' },
    meRankText: { color: '#818CF8', fontWeight: '800' }, // Lighter Indigo

    avatarContainer: { marginRight: 14 },
    meAvatarBorder: { borderWidth: 2, borderColor: '#818CF8', borderRadius: 24, padding: 2 },
    avatarGradient: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 18, fontWeight: 'bold', color: '#1E1B4B' },

    infoContainer: { flex: 1 },
    partnerName: { fontSize: 15, fontWeight: '600', color: '#F3F4F6', marginBottom: 2 }, // White text
    meNameText: { color: '#818CF8' }, // Indigo highlight
    statsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    statsText: { fontSize: 12, color: '#94A3B8' }, // Muted text

    scoreContainer: { alignItems: 'flex-end', minWidth: 60 },
    scoreText: { fontSize: 16, fontWeight: 'bold', color: '#FFD700' }, // Gold score
    meScoreText: { color: '#FFD700' },
    ptsText: { fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: '600' },

    footerContainer: { position: 'absolute', bottom: 20, left: 16, right: 16 },
    footerCard: {
        borderRadius: 24,
        padding: 1, // border effect
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 10,
    },
    footerInner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1B4B', // Dark Indigo
        borderRadius: 23,
        padding: 14,
    },
    footerRankBadge: {
        width: 48, height: 48, borderRadius: 24, backgroundColor: '#4F46E5',
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#4F46E5', shadowOpacity: 0.5, shadowRadius: 8
    },
    footerRankVal: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
    footerMeText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    footerMeTag: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    footerMeTagText: { fontSize: 9, color: '#FFF', fontWeight: 'bold' },
    footerSubText: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
    footerScoreVal: { color: '#FFD700', fontSize: 20, fontWeight: 'bold' },
    footerScoreLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, textAlign: 'right' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { width: '100%', backgroundColor: '#1F2937', borderRadius: 24, padding: 4 }, // Dark modal
    modalCloseBtn: { alignSelf: 'center', padding: 16 },
    modalCloseText: { color: '#9CA3AF', fontWeight: '600' }
});

