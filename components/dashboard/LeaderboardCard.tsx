import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DASHBOARD_TEXT } from '../../app/(tabs)/dashboard.constants';
import { DashboardCard } from './DashboardCard';

export interface Employee {
    id: string | number;
    name: string;
    rating?: number;
    bookings: number;
    rank: number;
    avatar?: string;
}

interface LeaderboardCardProps {
    employees: Employee[] | any[];
    onRefresh?: () => void;
}

export function LeaderboardCard({ employees, onRefresh }: LeaderboardCardProps) {
    const { colors } = useTheme();

    return (
        <DashboardCard
            title={DASHBOARD_TEXT.leaderboard.employeeTitle}
            icon="people"
        >
            <View style={styles.comingSoonContainer}>
                <Ionicons name="construct-outline" size={32} color={colors.textTertiary} style={{ marginBottom: 8 }} />
                <Text style={[styles.comingSoonText, { color: colors.textSecondary }]}>
                    Feature Coming Soon
                </Text>
                <Text style={[styles.comingSoonSub, { color: colors.textTertiary }]}>
                    Track your top performing staff here.
                </Text>
            </View>
        </DashboardCard>
    );
}

const styles = StyleSheet.create({
    comingSoonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 24,
    },
    comingSoonText: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    comingSoonSub: {
        fontSize: 12,
        textAlign: 'center',
    },
});
