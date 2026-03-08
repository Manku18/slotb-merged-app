import { GlassCard } from '@/components/ui/GlassCard';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { RankingData } from './rankingTypes';

interface LeaderboardPreviewProps {
    leaderboard: RankingData[];
    currentUserId: string;
}

export function LeaderboardPreview({ leaderboard, currentUserId }: LeaderboardPreviewProps) {
    const { colors } = useTheme();

    const getMedalColor = (rank: number) => {
        if (rank === 1) return '#FFD700'; // Gold
        if (rank === 2) return '#C0C0C0'; // Silver
        if (rank === 3) return '#CD7F32'; // Bronze
        return null;
    };

    return (
        <GlassCard style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Local Leaderboard</Text>
                <View style={styles.subtitleRow}>
                    <Ionicons name="location-sharp" size={14} color={colors.textSecondary} />
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Sarairanjan Area (12km)</Text>
                </View>
            </View>

            {leaderboard.map((partner, index) => {
                const isMe = partner.partnerId === currentUserId;
                const rank = index + 1;
                const medalColor = getMedalColor(rank);

                return (
                    <View
                        key={`${partner.partnerId}-${index}`}
                        style={[
                            styles.row,
                            isMe && { backgroundColor: 'rgba(37, 99, 235, 0.05)', borderColor: 'rgba(37, 99, 235, 0.2)', borderWidth: 1 }
                        ]}
                    >
                        {/* Rank / Medal */}
                        <View style={styles.rankCol}>
                            {medalColor ? (
                                <View style={[styles.medalBadge, { backgroundColor: medalColor }]}>
                                    <Text style={styles.medalText}>{rank}</Text>
                                </View>
                            ) : (
                                <Text style={[styles.rankText, { color: colors.textSecondary }]}>#{rank}</Text>
                            )}
                        </View>

                        {/* Avatar & Info */}
                        <View style={styles.infoCol}>
                            <View style={[styles.avatarCircle, { backgroundColor: isMe ? '#DBEAFE' : '#F3F4F6' }]}>
                                <Text style={[styles.avatarText, { color: isMe ? '#1E40AF' : '#6B7280' }]}>
                                    {isMe ? 'ME' : 'S' + rank}
                                </Text>
                            </View>
                            <View>
                                <Text style={[styles.name, { color: colors.textPrimary, fontWeight: isMe ? 'bold' : '600' }]}>
                                    {isMe ? 'My Salon' : `Salon Partner #${rank}`}
                                </Text>
                                <Text style={[styles.details, { color: colors.textSecondary }]}>
                                    {partner.performance.completedBookings} bookings
                                </Text>
                            </View>
                        </View>

                        {/* Score */}
                        <View style={styles.scoreCol}>
                            <Text style={[styles.score, { color: colors.primary }]}>{partner.score}</Text>
                            <Text style={[styles.ptsLabel, { color: colors.textSecondary }]}>pts</Text>
                        </View>
                    </View>
                );
            })}
        </GlassCard>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
        padding: 16,
    },
    header: {
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    subtitle: {
        fontSize: 12,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 12,
        marginBottom: 4,
    },
    rankCol: {
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    medalBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 2,
    },
    medalText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FFF',
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1,
    },
    rankText: {
        fontSize: 14,
        fontWeight: 'bold',
        opacity: 0.7,
    },
    infoCol: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    avatarCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    avatarText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    name: {
        fontSize: 13,
        marginBottom: 2,
    },
    details: {
        fontSize: 11,
    },
    scoreCol: {
        alignItems: 'flex-end',
        minWidth: 50,
    },
    score: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    ptsLabel: {
        fontSize: 10,
    }
});
