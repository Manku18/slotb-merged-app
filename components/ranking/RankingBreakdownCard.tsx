import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'; // Added TouchableOpacity
import { RankingData } from './rankingTypes';

export interface RankingBreakdownCardProps {
    rankingData: RankingData | null;
    onPressRules?: () => void; // Added prop
}

export function RankingBreakdownCard({ rankingData, onPressRules }: RankingBreakdownCardProps) {
    const { colors } = useTheme();

    if (!rankingData) return null;

    const { breakdown, performance } = rankingData;

    // Derived counts
    // Left Tokens are now merged into Cancellations for display
    const totalCancellations = performance.cancellations + performance.noShows;

    // Defensive check: If breakdown is missing (old backend), provide defaults
    const safeBreakdown = breakdown || {
        bookingScore: performance.completedBookings * 10,
        ratingScore: Math.round(performance.averageRating * 1), // Approx
        penaltyScore: totalCancellations * 5
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Score Breakdown</Text>
                    <Text style={styles.subTitle}>How this score is calculated</Text>
                </View>
                {onPressRules && (
                    <TouchableOpacity onPress={onPressRules} style={styles.rulesBtn}>
                        <Text style={styles.rulesText}>View Rules</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Rows */}
            <View style={styles.row}>
                <View style={styles.leftCol}>
                    <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                        <Ionicons name="checkmark-circle" size={18} color="#34D399" />
                    </View>
                    <View>
                        <Text style={[styles.label, { color: '#E5E7EB' }]}>Completed Bookings</Text>
                        <Text style={[styles.subLabel, { color: '#9CA3AF' }]}>
                            {performance.completedBookings} bookings x 10 pts
                        </Text>
                    </View>
                </View>
                <Text style={[styles.value, { color: '#34D399' }]}>+{safeBreakdown.bookingScore}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
                <View style={styles.leftCol}>
                    <View style={[styles.iconBox, { backgroundColor: 'rgba(251, 191, 36, 0.2)' }]}>
                        <Ionicons name="star" size={18} color="#FBBF24" />
                    </View>
                    <View>
                        <Text style={[styles.label, { color: '#E5E7EB' }]}>Rating Bonus</Text>
                        <Text style={[styles.subLabel, { color: '#9CA3AF' }]}>
                            {performance.averageRating} ★ ({performance.reviewCount} reviews)
                        </Text>
                    </View>
                </View>
                <Text style={[styles.value, { color: '#FBBF24' }]}>+{safeBreakdown.ratingScore}</Text>
            </View>

            <View style={styles.divider} />

            {/* Merged Cancellation Row */}
            <View style={styles.row}>
                <View style={styles.leftCol}>
                    <View style={[styles.iconBox, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
                        <Ionicons name="alert-circle" size={18} color="#F87171" />
                    </View>
                    <View>
                        <Text style={[styles.label, { color: '#E5E7EB' }]}>Penalties</Text>
                        <Text style={[styles.subLabel, { color: '#9CA3AF' }]}>
                            {performance.cancellations} Cancel / {performance.noShows} No-show
                        </Text>
                    </View>
                </View>
                <Text style={[styles.value, { color: '#F87171' }]}>-{safeBreakdown.penaltyScore}</Text>
            </View>

            <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Score</Text>
                <Text style={styles.totalValue}>{rankingData.score}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        padding: 20,
        backgroundColor: '#1F2937', // Dark gray/slate
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
    },
    subTitle: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 2,
    },
    rulesBtn: {
        backgroundColor: 'rgba(79, 70, 229, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.4)',
    },
    rulesText: {
        color: '#818CF8',
        fontSize: 12,
        fontWeight: '600'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    leftCol: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
    },
    subLabel: {
        fontSize: 11,
    },
    value: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.08)',
        marginVertical: 4,
        marginLeft: 44,
    },
    totalRow: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        color: '#D1D5DB',
        fontSize: 14,
        fontWeight: '600',
    },
    totalValue: {
        color: '#FFD700',
        fontSize: 20,
        fontWeight: 'bold',
    }
});
