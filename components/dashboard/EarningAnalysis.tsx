import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DASHBOARD_TEXT, TimeRange } from '../../app/(tabs)/dashboard.constants';
import { DashboardCard } from './DashboardCard';
import { TimeTab } from './TimeTab';

export function EarningAnalysis() {
    const { colors } = useTheme();
    const [timeRange, setTimeRange] = useState<TimeRange>(TimeRange.Monthly);

    const amount = 12400;
    const isUp = true;

    // Hints specific to earnings
    const hints = [
        "Shaam 6-8 baje bheed zyada hoti hai",
        "Pro plan se aur booking aa sakti hai"
    ];

    return (
        <DashboardCard
            title={DASHBOARD_TEXT.earningAnalysis.title}
            icon="cash"
            variant="sage"
        >
            <TimeTab selectedTab={timeRange} onTabChange={setTimeRange} />

            <View style={styles.headerGroup}>
                <Text style={[styles.subTitle, { color: colors.textPrimary }]}>
                    {DASHBOARD_TEXT.earningAnalysis.subtitlePrefix}:
                </Text>
                <Text style={[styles.amount, { color: colors.textPrimary }]}>₹{amount.toLocaleString()}</Text>

                <View style={styles.trendRow}>
                    <Ionicons name="caret-up" size={16} color={colors.primary} />
                    <Text style={[styles.trendText, { color: colors.primary }]}>
                        {DASHBOARD_TEXT.earningAnalysis.compareUp}
                    </Text>
                </View>
            </View>

            <View style={[styles.hintContainer, { borderTopColor: colors.border }]}>
                {hints.map((hint, index) => (
                    <View key={index} style={styles.hintRow}>
                        <Ionicons name="information-circle" size={16} color={colors.primary} />
                        <Text style={[styles.hintText, { color: colors.textSecondary }]}>{hint}</Text>
                    </View>
                ))}
            </View>
        </DashboardCard>
    );
}

const styles = StyleSheet.create({
    headerGroup: {
        marginBottom: 20,
    },
    subTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
        opacity: 0.7,
    },
    amount: {
        fontSize: 36,
        fontWeight: '800',
        marginBottom: 8,
    },
    trendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    trendText: {
        fontSize: 13,
        fontWeight: '700',
    },
    hintContainer: {
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        gap: 12,
    },
    hintRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.5)',
        padding: 8,
        borderRadius: 8,
    },
    hintText: {
        fontSize: 13,
        fontWeight: '500',
        flex: 1,
    }
});
