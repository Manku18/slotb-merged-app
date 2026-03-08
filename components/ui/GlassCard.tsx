import { SlotBShadows } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

type CardVariant = 'default' | 'sage' | 'mustard';

interface GlassCardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    variant?: CardVariant;
    glowColor?: string; // Ignored
}

export function GlassCard({ children, style, variant = 'default' }: GlassCardProps) {
    const { colors } = useTheme();

    const getBackgroundColor = () => {
        switch (variant) {
            case 'sage': return colors.sage;
            case 'mustard': return colors.mustard;
            default: return colors.surface;
        }
    };

    return (
        <View
            style={[
                styles.card,
                { backgroundColor: getBackgroundColor() },
                style,
            ]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        padding: 20,
        ...SlotBShadows.card,
    },
});
