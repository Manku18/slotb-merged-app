import { useRanking } from '@/components/ranking/useRanking';
import { GlassCard } from '@/components/ui/GlassCard';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { getGapToTop10 } from '@/components/ranking/rankingUtils';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ShopLeaderboardProps {
    isOpen?: boolean;
}

export function ShopLeaderboard({ isOpen = true }: ShopLeaderboardProps) {
    const { colors } = useTheme();
    const router = useRouter();
    const {
        myRanking,
        leaderboard,
        config,
        isEligible
    } = useRanking();

    const [selectedTab, setSelectedTab] = useState<'Today' | 'Week' | 'Month' | 'Year'>('Month');
    const tabs: ('Today' | 'Week' | 'Month' | 'Year')[] = ['Today', 'Week', 'Month', 'Year'];

    const displayRank = myRanking?.rank || 45;
    const displayScore = myRanking?.score || 0;

    // Calculate Gap
    const bookingsNeeded = useMemo(() => {
        if (!myRanking || !leaderboard) return 0;
        return getGapToTop10(leaderboard, myRanking.score, config);
    }, [myRanking, leaderboard, config]);

    const getSuggestion = () => {
        if (!myRanking) return "Start getting bookings!";
        if (myRanking.rank <= 10) return "🔥 You are in the Top 10! Keep it up.";
        return `Rocket to Top 10 by getting ${bookingsNeeded} more bookings!`;
    };

    return (
        <GlassCard variant="default" style={styles.cardOverride}>
            <View style={styles.container}>

                {/* Header & Tabs Compact */}
                <View style={styles.header}>
                    <View style={styles.titleRow}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="trophy" size={16} color="#B45309" />
                        </View>
                        <Text style={[styles.title, { color: colors.textPrimary }]}>Ranking</Text>
                    </View>

                    {/* Compact Tabs */}
                    <View style={styles.tabContainer}>
                        {tabs.map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                style={[styles.tab, selectedTab === tab && styles.activeTab]}
                                onPress={() => setSelectedTab(tab)}
                            >
                                <Text style={[styles.tabText, selectedTab === tab ? styles.activeTabText : styles.inactiveTabText]}>
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Main Content */}
                {isEligible ? (
                    <View style={styles.contentContainer}>
                        <View style={styles.mainRow}>
                            {/* Big Rank */}
                            <View style={styles.rankSection}>
                                <Text style={styles.rankLabel}>CURRENT RANK</Text>
                                <View style={styles.rankDisplay}>
                                    <Text style={styles.rankNumber}>{displayRank}</Text>
                                </View>
                                <Text style={styles.contextText}>In your Area (15 KM )</Text>
                            </View>

                            <View style={styles.verticalDivider} />

                            {/* Gap Info */}
                            <View style={styles.gapSection}>
                                <Text style={styles.gapLabel}>TO REACH TOP 10 YOU NEED</Text>
                                <View style={styles.gapDisplay}>
                                    <Text style={styles.gapNumber}>{bookingsNeeded > 0 ? bookingsNeeded : '0'}</Text>
                                    <Text style={styles.gapUnit}>Bookings</Text>
                                </View>
                                <Text style={styles.gapContext}>Need {bookingsNeeded * config.bookingWeight} more pts</Text>
                            </View>
                        </View>

                        {/* Suggestion Bar */}
                        <View style={styles.suggestionBar}>
                            <Ionicons name="flash" size={14} color="#D97706" />
                            <Text style={styles.suggestionText} numberOfLines={1}>{getSuggestion()}</Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.primary }]}
                            onPress={() => router.push('/ranking')}
                        >
                            <Text style={styles.actionButtonText}>View Full Leaderboard</Text>
                            <Ionicons name="chevron-forward" size={16} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    // LOCKED STATE
                    <View style={styles.lockedContainer}>
                        <View style={styles.lockRow}>
                            <View style={styles.lockIcon}>
                                <Ionicons name="lock-closed" size={24} color={colors.textPrimary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.lockedTitle, { color: colors.textPrimary }]}>Ranking Locked</Text>
                                <Text style={[styles.lockedSubtext, { color: colors.textSecondary }]}>Upgrade to see your rank.</Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.unlockButton, { backgroundColor: colors.textPrimary }]}
                                onPress={() => router.push('/?scrollTo=pricing' as any)}
                            >
                                <Text style={styles.unlockText}>Unlock</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        </GlassCard>
    );
}

const styles = StyleSheet.create({
    cardOverride: {
        padding: 0,
        marginBottom: 16,
        backgroundColor: '#FFFBEB', // Very light amber
        borderColor: '#FDE68A',
        borderWidth: 1,
        minHeight: SCREEN_HEIGHT * 0.37, // Reduced to ~30vh
    },
    container: {
        padding: 16,
        flex: 1,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#FEF3C7',
        alignItems: 'center',
        justifyContent: 'center'
    },
    title: {
        fontSize: 17,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    // Tabs
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.04)',
        borderRadius: 8,
        padding: 2,
    },
    tab: {
        paddingVertical: 4, // Compact
        paddingHorizontal: 7.25,
        borderRadius: 6,
    },
    activeTab: {
        backgroundColor: '#FFF',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    tabText: { fontSize: 10.5, fontWeight: '600' },
    activeTabText: { color: '#B45309' },
    inactiveTabText: { color: '#9CA3AF' },

    // Main Content
    contentContainer: {
        flex: 1,
        justifyContent: 'space-around',
    },
    mainRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
        marginBottom: 10,
    },
    rankSection: {
        flex: 1,
        alignItems: 'center',
    },
    rankLabel: {
        fontSize: 12,
        color: '#92400E',
        fontWeight: '700',
        marginBottom: -4,
    },
    rankDisplay: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    rankHash: {
        fontSize: 20,
        color: '#D97706',
        fontWeight: 'bold',
        marginTop: 6,
        marginRight: 2,
    },
    rankNumber: {
        fontSize: 62,
        fontWeight: '900',
        color: '#a51212ff',
        letterSpacing: -1,
    },
    contextText: {
        fontSize: 11,
        color: '#0e0707ff',
        marginTop: -4,
    },
    verticalDivider: {
        width: 1.5,
        height: 40,
        backgroundColor: '#4d4ddbff',
        marginHorizontal: 10,
    },
    gapSection: {
        flex: 1,
        alignItems: 'center',
    },
    gapLabel: {
        fontSize: 8,
        color: '#0e53dcff',
        fontWeight: '700',
        marginBottom: 2,
    },
    gapDisplay: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    gapNumber: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#374151',
        marginRight: 4,
    },
    gapUnit: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '800',
    },
    gapContext: {
        fontSize: 12,
        color: '#120608ff',
    },
    // Suggestion
    suggestionBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(251, 191, 36, 0.2)',
    },
    suggestionText: {
        fontSize: 12,
        color: '#B45309',
        marginLeft: 6,
        fontWeight: '600',
        flex: 1,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 10,
        width: '100%',
    },
    actionButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
        marginRight: 4,
    },
    // Locked
    lockedContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    lockRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    lockIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(0,0,0,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    lockedTitle: { fontWeight: 'bold', fontSize: 16 },
    lockedSubtext: { fontSize: 12 },
    unlockButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    unlockText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 }
});
