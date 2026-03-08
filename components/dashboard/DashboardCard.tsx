import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { ReactNode } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { GlassCard } from '../ui/GlassCard';

interface DashboardCardProps {
    title: string;
    icon?: keyof typeof Ionicons.glyphMap;
    children: ReactNode;
    rightElement?: ReactNode;
    action?: ReactNode; // Alias for rightElement
    style?: StyleProp<ViewStyle>;
    variant?: 'default' | 'sage' | 'mustard';
}

export function DashboardCard({
    title,
    icon,
    children,
    rightElement,
    action,
    style,
    variant = 'default'
}: DashboardCardProps) {
    const { colors } = useTheme();

    return (
        <GlassCard variant={variant} style={[styles.card, style]}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    {icon && (
                        <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
                            <Ionicons name={icon} size={18} color={colors.primary} />
                        </View>
                    )}
                    <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
                </View>
                {(action || rightElement) && <View>{action || rightElement}</View>}
            </View>
            <View style={styles.content}>
                {children}
            </View>
        </GlassCard>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
        padding: 16,
        borderRadius: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
    },
    content: {
        width: '100%',
    }
});
