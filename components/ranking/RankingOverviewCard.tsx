import { GlassCard } from '@/components/ui/GlassCard';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RankingData, RankingPeriod } from './rankingTypes';
import { getRankingContextText } from './rankingUtils';

interface RankingOverviewCardProps {
    myRanking: RankingData | null;
    period: RankingPeriod;
    onPeriodChange: (period: RankingPeriod) => void;
    isEligible: boolean;
    onUpgradePress: () => void;
}

export function RankingOverviewCard({
    myRanking,
    period,
    onPeriodChange,
    isEligible,
    onUpgradePress
}: RankingOverviewCardProps) {
    const { colors } = useTheme();

    if (!isEligible) {
        return (
            <GlassCard style={[styles.container, styles.lockedContainer]}>
                <View style={styles.lockedContent}>
                    <Ionicons name="lock-closed" size={48} color={colors.textSecondary} />
                    <Text style={[styles.lockedTitle, { color: colors.textPrimary }]}>
                        Unlock Your Shop Ranking
                    </Text>
                    <Text style={[styles.lockedSubtitle, { color: colors.textSecondary }]}>
                        Upgrade to Premium to see how you rank against other salons in your area.
                    </Text>
                    <TouchableOpacity
                        style={[styles.upgradeButton, { backgroundColor: colors.primary }]}
                        onPress={onUpgradePress}
                    >
                        <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
                    </TouchableOpacity>
                </View>
            </GlassCard>
        );
    }

    if (!myRanking) return null;

    return (
        <GlassCard style={styles.container}>
            {/* Header / Time Filter */}
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Your Ranking</Text>
                <View style={styles.periodSelector}>
                    {(['week', 'month', 'year'] as RankingPeriod[]).map((p) => (
                        <TouchableOpacity
                            key={p}
                            onPress={() => onPeriodChange(p)}
                            style={[
                                styles.periodButton,
                                period === p && { backgroundColor: colors.primary }
                            ]}
                        >
                            <Text style={[
                                styles.periodText,
                                { color: period === p ? '#FFF' : colors.textSecondary }
                            ]}>
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Rank Display */}
            <View style={styles.rankContainer}>
                <View style={styles.rankCircle}>
                    <Text style={styles.rankNumber}>#{myRanking.rank}</Text>
                    <Text style={styles.rankLabel}>Rank</Text>
                </View>

                <View style={styles.scoreInfo}>
                    <Text style={[styles.contextText, { color: colors.textPrimary }]}>
                        {getRankingContextText(myRanking.rank, period === 'week' ? 'this week' : period === 'month' ? 'this month' : 'this year')}
                    </Text>
                    <Text style={[styles.scoreText, { color: colors.textSecondary }]}>
                        Score: <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{myRanking.score}</Text> pts
                    </Text>
                    {myRanking.percentile > 0 && (
                        <View style={[styles.badge, { backgroundColor: colors.sage }]}>
                            <Text style={styles.badgeText}>Top {myRanking.percentile}%</Text>
                        </View>
                    )}
                </View>
            </View>
        </GlassCard>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        padding: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    periodSelector: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 20,
        padding: 4,
    },
    periodButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    periodText: {
        fontSize: 12,
        fontWeight: '600',
    },
    rankContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rankCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E6F4FE', // Light blue bg
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 20,
        borderWidth: 4,
        borderColor: '#FFF',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 4.65,
        elevation: 8,
    },
    rankNumber: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2563EB',
    },
    rankLabel: {
        fontSize: 10,
        color: '#64748B',
    },
    scoreInfo: {
        flex: 1,
    },
    contextText: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    scoreText: {
        fontSize: 14,
    },
    badge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 6,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#064E3B',
    },
    // Locked State
    lockedContainer: {
        minHeight: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lockedContent: {
        alignItems: 'center',
        padding: 20,
    },
    lockedTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
    lockedSubtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
    },
    upgradeButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    upgradeButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    }
});
