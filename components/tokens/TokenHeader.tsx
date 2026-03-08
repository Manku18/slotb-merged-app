import { SlotBShadows } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { TokenFilter, TokenStats } from './token.types';

interface TokenHeaderProps {
    stats: TokenStats;
    filter: TokenFilter;
    onFilterChange: (filter: TokenFilter) => void;
    onAddToken: () => void;
    onNotificationPress?: () => void;
    dateFilter: 'today' | 'tomorrow';
    onDateFilterChange: (date: 'today' | 'tomorrow') => void;
    notificationCount?: number;
}

export function TokenHeader({
    stats,
    filter,
    onFilterChange,
    onAddToken,
    onNotificationPress,
    dateFilter,
    onDateFilterChange,
    notificationCount = 0
}: TokenHeaderProps) {
    const { colors, isDarkMode } = useTheme();

    const FILTERS: TokenFilter[] = ['all', 'serving', 'waiting', 'completed', 'cancelled'];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>

            {/* 1. Main Header Row */}
            <View style={[styles.topRow, { borderBottomColor: colors.border }]}>
                <View>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>Live Bookings</Text>
                    {/* Date Toggle */}
                    <View style={styles.dateToggleContainer}>
                        <TouchableOpacity
                            style={[
                                styles.dateToggleBtn,
                                dateFilter === 'today' && styles.dateToggleBtnActive,
                                dateFilter === 'today' && { backgroundColor: colors.textPrimary }
                            ]}
                            onPress={() => onDateFilterChange('today')}
                        >
                            <Text style={[styles.dateToggleText, dateFilter === 'today' ? { color: colors.textInverse } : { color: colors.textSecondary }]}>Today</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.dateToggleBtn,
                                dateFilter === 'tomorrow' && styles.dateToggleBtnActive,
                                dateFilter === 'tomorrow' && { backgroundColor: colors.textPrimary }
                            ]}
                            onPress={() => onDateFilterChange('tomorrow')}
                        >
                            <Text style={[styles.dateToggleText, dateFilter === 'tomorrow' ? { color: colors.textInverse } : { color: colors.textSecondary }]}>Tomorrow</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={[styles.iconButton, { backgroundColor: colors.surface }]}
                        onPress={onNotificationPress}
                    >
                        <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
                        {/* Synchronized Badge */}
                        {notificationCount > 0 && <View style={[styles.badge, { borderColor: colors.background }]} />}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: colors.primary || '#3B82F6' }]}
                        onPress={onAddToken}
                    >
                        <Ionicons name="add" size={30} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* 2. Stats Row (Compact) */}
            <View style={styles.statsRow}>
                {/* DONE */}
                <View style={[
                    styles.statItem,
                    {
                        backgroundColor: isDarkMode ? '#05966920' : '#ECFDF5',
                        shadowColor: '#059669',
                        borderColor: isDarkMode ? '#059669' : 'rgba(5, 150, 105, 0.2)',
                        borderWidth: 1
                    }
                ]}>
                    <Text style={[styles.statValue, { color: '#059669' }]}>{stats.completed}</Text>
                    <Text style={[styles.statLabel, { color: '#059669' }]}>DONE</Text>
                </View>
                {/* WAITING */}
                <View style={[
                    styles.statItem,
                    {
                        backgroundColor: isDarkMode ? '#EA580C20' : '#FFF7ED',
                        shadowColor: '#EA580C',
                        borderColor: isDarkMode ? '#EA580C' : 'rgba(234, 88, 12, 0.2)',
                        borderWidth: 1
                    }
                ]}>
                    <Text style={[styles.statValue, { color: '#EA580C' }]}>{stats.waiting}</Text>
                    <Text style={[styles.statLabel, { color: '#EA580C' }]}>WAITING</Text>
                </View>
                {/* MISSED */}
                <View style={[
                    styles.statItem,
                    {
                        backgroundColor: isDarkMode ? '#DC262620' : '#FEF2F2',
                        shadowColor: '#DC2626',
                        borderColor: isDarkMode ? '#DC2626' : 'rgba(220, 38, 38, 0.2)',
                        borderWidth: 1
                    }
                ]}>
                    <Text style={[styles.statValue, { color: '#DC2626' }]}>{stats.cancelled}</Text>
                    <Text style={[styles.statLabel, { color: '#DC2626' }]}>MISSED</Text>
                </View>
            </View>

            {/* 3. Filter Chips Row */}
            <View style={styles.filterRow}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterContent}
                >
                    {FILTERS.map((f) => {
                        const isActive = filter === f;
                        const label = f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1);
                        return (
                            <TouchableOpacity
                                key={f}
                                style={[
                                    styles.filterChip,
                                    isActive
                                        ? { backgroundColor: colors.textPrimary }
                                        : { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }
                                ]}
                                onPress={() => onFilterChange(f as TokenFilter)}
                            >
                                <Text style={[
                                    styles.filterText,
                                    isActive ? { color: colors.textInverse } : { color: colors.textSecondary }
                                ]}>{label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        // Removed elevation/shadow as requested
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: -1, // Removed top padding to fix gap
        paddingBottom: 5,
        borderBottomWidth: 0,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    dateSub: {
        fontSize: 13,
        fontWeight: '600',
        marginTop: -2,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        ...SlotBShadows.card,
    },
    addButton: {
        width: 52, // Slightly smaller than 56 but larger than original 44
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        ...SlotBShadows.card,
        elevation: 4,
        shadowColor: '#3B82F6', // Blue shadow
        shadowOpacity: 0.3,
    },
    badge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#FF3B30', // Vibrant Red
        borderWidth: 2,
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 4,
        gap: 12,
        height: 70, // Reduced height
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
        borderRadius: 16,
        // Glossy effect handled inline
        elevation: 8,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
    },
    statValue: {
        fontSize: 24, // Slightly adjusted for compact height
        fontWeight: '800',
        lineHeight: 28,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '800',
        marginTop: 0,
        opacity: 0.9, // Higher opacity for colored text
        textTransform: 'uppercase',
    },
    filterRow: {
        paddingVertical: 6,
    },
    filterContent: {
        paddingHorizontal: 20,
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 100,
    },
    filterText: {
        fontSize: 12,
        fontWeight: '600',
    },
    // Toggle Styles
    dateToggleContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 20,
        padding: 4,
        marginTop: 4,
        alignSelf: 'flex-start'
    },
    dateToggleBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    dateToggleBtnActive: {
        // bg color handled inline
    },
    dateToggleText: {
        fontSize: 12,
        fontWeight: '700',
    }
});
