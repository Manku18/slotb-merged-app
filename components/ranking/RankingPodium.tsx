import { useTheme } from '@/hooks/useTheme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { RankingData } from './rankingTypes';
import { LinearGradient } from 'expo-linear-gradient';

interface RankingPodiumProps {
    top3: RankingData[];
    onPressPartner: (partner: RankingData) => void;
}

export function RankingPodium({ top3, onPressPartner }: RankingPodiumProps) {
    const { colors } = useTheme();

    // Ensure we have 3 slots even if empty
    const first = top3.find(p => p.rank === 1);
    const second = top3.find(p => p.rank === 2);
    const third = top3.find(p => p.rank === 3);

    const renderPodiumStep = (partner: RankingData | undefined, rank: number) => {
        if (!partner) return <View style={styles.emptyStep} />;

        const isFirst = rank === 1;
        const scale = isFirst ? 1.1 : 1;

        // Explicitly define colors as arrays of strings for LinearGradient
        let medalColors = ['#FCD34D', '#F59E0B']; // Gold
        let borderColor = '#FCD34D';
        let height = 160;
        let podiumColors = ['rgba(252, 211, 77, 0.4)', 'rgba(255,255,255,0)'];

        if (rank === 2) {
            medalColors = ['#E5E7EB', '#9CA3AF']; // Silver
            borderColor = '#E5E7EB';
            height = 130;
            podiumColors = ['rgba(229, 231, 235, 0.4)', 'rgba(255,255,255,0)'];
        } else if (rank === 3) {
            medalColors = ['#FDBA74', '#C2410C']; // Bronze
            borderColor = '#FDBA74';
            height = 110;
            podiumColors = ['rgba(253, 186, 116, 0.4)', 'rgba(255,255,255,0)'];
        }

        return (
            <TouchableOpacity
                style={[styles.stepContainer, { transform: [{ scale }] }]}
                onPress={() => onPressPartner(partner)}
                activeOpacity={0.8}
            >
                {/* Crown for #1 */}
                {isFirst && (
                    <View style={styles.crownContainer}>
                        <MaterialCommunityIcons name="crown" size={32} color="#FFD700" style={styles.crownShadow} />
                    </View>
                )}

                {/* Avatar */}
                <View style={[styles.avatarBorder, { borderColor }]}>
                    <LinearGradient
                        colors={['#FFF', '#F3F4F6']}
                        style={styles.avatar}
                    >
                        <Text style={[styles.avatarText, { color: colors.primary }]}>
                            {partner.partnerId.slice(0, 2).toUpperCase()}
                        </Text>
                    </LinearGradient>

                    <LinearGradient
                        colors={medalColors as [string, string]}
                        style={styles.rankBadge}
                    >
                        <Text style={styles.rankText}>{rank}</Text>
                    </LinearGradient>
                </View>

                {/* Name & Score */}
                <View style={{ width: '100%', alignItems: 'center', marginTop: 8, marginBottom: 8, zIndex: 20 }}>
                    <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
                        {partner.partnerId === 'me' ? 'You' : partner.partnerId}
                    </Text>
                    <Text style={[styles.score, { color: borderColor }]}>{partner.score} pts</Text>
                </View>

                {/* Podium Block */}
                <LinearGradient
                    colors={podiumColors as [string, string]}
                    style={[styles.podiumBlock, { height: height, borderColor: borderColor }]}
                />
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.podiumRow}>
                {renderPodiumStep(second, 2)}
                {renderPodiumStep(first, 1)}
                {renderPodiumStep(third, 3)}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 40,
        marginBottom: 30,
        alignItems: 'center',
    },
    podiumRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 16,
    },
    stepContainer: {
        alignItems: 'center',
        marginBottom: -12,
        zIndex: 1,
        width: 100, // Increased touch target
    },
    emptyStep: {
        width: 100,
    },
    crownContainer: {
        position: 'absolute',
        top: -38,
        zIndex: 10,
    },
    crownShadow: {
        shadowColor: "#F59E0B",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 12,
        textShadowColor: '#FBBF24',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 12,
    },
    avatarBorder: {
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderRadius: 50,
        padding: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    avatarText: {
        fontSize: 24,
        fontWeight: '800',
    },
    rankBadge: {
        position: 'absolute',
        bottom: -12,
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
    rankText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFF',
    },
    name: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
        width: '100%',
        paddingHorizontal: 4,
        marginTop: 8,
        marginBottom: 4,
    },
    score: {
        fontSize: 13,
        fontWeight: '800',
        marginBottom: 10,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    podiumBlock: {
        width: '100%',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderTopWidth: 1,
        borderLeftWidth: 0.5,
        borderRightWidth: 0.5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
    },
});
