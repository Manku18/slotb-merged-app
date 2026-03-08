import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DASHBOARD_TEXT, SUGGESTION_COLORS, TimeRange } from '../../app/(tabs)/dashboard.constants';
import { DashboardCard } from './DashboardCard';
import { TimeTab } from './TimeTab';

interface TodayOverviewProps {
    stats: any; // Ideally strictly typed
    earnings: any;
}

export function TodayOverview({ stats, earnings }: TodayOverviewProps) {
    const { colors } = useTheme();
    const [timeRange, setTimeRange] = useState<TimeRange>(TimeRange.Today);

    // Mock data switching based on timeRange
    const displayBookings = timeRange === TimeRange.Today ? stats?.totalBookings || 12 :
        timeRange === TimeRange.Weekly ? 84 : 340;

    // Mock missed opportunities
    const displayMissed = timeRange === TimeRange.Today ? 3 :
        timeRange === TimeRange.Weekly ? 15 : 45;

    const displayEarnings = timeRange === TimeRange.Today ? earnings?.revenue || 4500 :
        timeRange === TimeRange.Weekly ? 32000 : 125000;

    const suggestions = [
        { id: 1, text: "Evening 6-8 PM booking demand high hai", color: SUGGESTION_COLORS.Success, icon: 'trending-up' },
        { id: 2, text: "3 bookings miss hui - Staff badhayein", color: SUGGESTION_COLORS.Attention, icon: 'alert-circle' },
        { id: 3, text: "Beard service ka demand badh raha hai", color: 'blue', icon: 'information-circle' },
    ];

    return (
        <DashboardCard
            title={DASHBOARD_TEXT.today.title}
            icon="calendar"
            variant="default"
        >
            <TimeTab selectedTab={timeRange} onTabChange={setTimeRange} />

            {/* Main Stats Row */}
            <View style={styles.mainStatsRow}>
                <View style={styles.statColumn}>
                    <Text style={[styles.bigValue, { color: colors.textPrimary }]}>{displayBookings}</Text>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>{DASHBOARD_TEXT.today.bookings}</Text>
                </View>

                <View style={styles.statColumn}>
                    <Text style={[styles.bigValue, { color: '#EF4444' }]}>{displayMissed}</Text>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>{DASHBOARD_TEXT.today.missed}</Text>
                </View>
            </View>

            <View style={[styles.earningsBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.earningsValue, { color: colors.primary }]}>₹{displayEarnings.toLocaleString()}</Text>
                <Text style={[styles.label, { color: colors.textTertiary }]}>{DASHBOARD_TEXT.today.earnings}</Text>
            </View>

            <View style={styles.suggestionsContainer}>
                <Text style={[styles.suggestionTitle, { color: colors.textPrimary }]}>
                    {DASHBOARD_TEXT.today.suggestionsTitle}
                </Text>
                {suggestions.map((s) => (
                    <View key={s.id} style={[styles.suggestionCard, { backgroundColor: s.color.startsWith('#') ? s.color + '15' : 'rgba(0,0,0,0.05)' }]}>
                        <Ionicons name={s.icon as any} size={20} color={s.color} style={{ marginTop: 2 }} />
                        <Text style={[styles.suggestionText, { color: colors.textPrimary }]}>{s.text}</Text>
                    </View>
                ))}
            </View>
        </DashboardCard>
    );
}

const styles = StyleSheet.create({
    mainStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        gap: 16,
    },
    statColumn: {
        flex: 1,
    },
    bigValue: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 4,
        letterSpacing: -1,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        opacity: 0.8,
    },
    earningsBox: {
        marginBottom: 24,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
    },
    earningsValue: {
        fontSize: 36,
        fontWeight: '800',
        marginBottom: 4,
        letterSpacing: -1,
    },
    suggestionsContainer: {
        gap: 12,
    },
    suggestionTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    suggestionCard: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 12,
        gap: 12,
        alignItems: 'flex-start',
    },
    suggestionText: {
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
        lineHeight: 20,
    }
});
