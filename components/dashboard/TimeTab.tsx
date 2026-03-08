import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { TIME_TABS, TimeRange } from '../../app/(tabs)/dashboard.constants';

interface TimeTabProps {
    selectedTab: TimeRange;
    onTabChange: (tab: TimeRange) => void;
    tabs?: { label: string; value: TimeRange }[];
    style?: StyleProp<ViewStyle>;
}

export function TimeTab({ selectedTab, onTabChange, tabs = TIME_TABS, style }: TimeTabProps) {
    const { colors } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.surface }, style]}>
            {tabs.map((tab) => {
                const isSelected = selectedTab === tab.value;
                return (
                    <TouchableOpacity
                        key={tab.value}
                        onPress={() => onTabChange(tab.value)}
                        style={[
                            styles.tab,
                            isSelected && { backgroundColor: colors.primary }
                        ]}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                { color: isSelected ? '#FFFFFF' : colors.textSecondary }
                            ]}
                        >
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 4,
        borderRadius: 12,
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },
    tabText: {
        fontSize: 12,
        fontWeight: '600',
    },
});
