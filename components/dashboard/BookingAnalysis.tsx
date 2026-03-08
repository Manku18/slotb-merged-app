import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DASHBOARD_TEXT, TimeRange } from '../../app/(tabs)/dashboard.constants';
import { DashboardCard } from './DashboardCard';
import { TimeTab } from './TimeTab';

interface BookingAnalysisProps {
    stats: any;
}

export function BookingAnalysis({ stats }: BookingAnalysisProps) {
    const { colors } = useTheme();
    const [timeRange, setTimeRange] = useState<TimeRange>(TimeRange.Today);

    const count = timeRange === TimeRange.Today ? 15 : timeRange === TimeRange.Weekly ? 150 : 620;
    const isUp = true; // Logic to determine trend

    return (
        <DashboardCard
            title={DASHBOARD_TEXT.bookingAnalysis.title}
            icon="stats-chart"
        >
            <TimeTab selectedTab={timeRange} onTabChange={setTimeRange} />

            <View style={styles.content}>
                <Text style={[styles.mainValue, { color: colors.textPrimary }]}>{count}</Text>
                <View style={[
                    styles.trendBadge,
                    { backgroundColor: isUp ? '#DEF7EC' : '#FDE8E8' }
                ]}>
                    <Ionicons
                        name={isUp ? "arrow-up" : "arrow-down"}
                        size={12}
                        color={isUp ? '#03543F' : '#9B1C1C'}
                    />
                    <Text style={[
                        styles.trendText,
                        { color: isUp ? '#03543F' : '#9B1C1C' }
                    ]}>
                        {isUp ? DASHBOARD_TEXT.bookingAnalysis.microTextUp : DASHBOARD_TEXT.bookingAnalysis.microTextDown}
                    </Text>
                </View>
            </View>
        </DashboardCard>
    );
}

const styles = StyleSheet.create({
    content: {
        alignItems: 'flex-start',
        paddingVertical: 8,
    },
    mainValue: {
        fontSize: 40,
        fontWeight: '800',
        marginBottom: 8,
        letterSpacing: -1,
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    trendText: {
        fontSize: 12,
        fontWeight: '700',
    }
});
