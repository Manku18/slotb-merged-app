import { GlassCard } from '@/components/ui/GlassCard';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { RankingConfig } from './rankingTypes';

interface RankingConfigPanelProps {
    config: RankingConfig;
    onUpdateConfig: (newConfig: RankingConfig) => void;
    isEnabled: boolean;
    onToggleEnabled: () => void;
}

export function RankingConfigPanel({ config, onUpdateConfig, isEnabled, onToggleEnabled }: RankingConfigPanelProps) {
    const { colors } = useTheme();
    const [localConfig, setLocalConfig] = useState<RankingConfig>(config);
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = () => {
        onUpdateConfig(localConfig);
        setIsEditing(false);
    };

    const handleChange = (key: keyof RankingConfig, value: string) => {
        const numValue = parseInt(value) || 0;
        setLocalConfig(prev => ({ ...prev, [key]: numValue }));
    };

    const renderInput = (label: string, value: number, key: keyof RankingConfig) => (
        <View style={styles.inputRow}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{label}</Text>
            {isEditing ? (
                <TextInput
                    style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                    keyboardType="numeric"
                    value={String(value)}
                    onChangeText={(text) => handleChange(key, text)}
                />
            ) : (
                <Text style={[styles.valueText, { color: colors.textPrimary }]}>{value}</Text>
            )}
        </View>
    );

    return (
        <GlassCard style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>Ranking Configuration</Text>
                    <TouchableOpacity onPress={() => isEditing ? handleSave() : setIsEditing(true)}>
                        <Text style={[styles.editBtn, { color: colors.primary }]}>
                            {isEditing ? 'Save' : 'Edit'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.toggleRow}>
                    <Text style={[styles.toggleLabel, { color: colors.textSecondary }]}>Enable Ranking System</Text>
                    <Switch
                        value={isEnabled}
                        onValueChange={onToggleEnabled}
                        trackColor={{ false: '#767577', true: colors.primary }}
                        thumbColor={isEnabled ? '#fff' : '#f4f3f4'}
                    />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Scoring Weights</Text>
                {renderInput('Points per Booking', localConfig.bookingWeight, 'bookingWeight')}
                {renderInput('Points per Star Rating', localConfig.ratingWeight, 'ratingWeight')}
                {renderInput('Points per Review', localConfig.reviewsWeight, 'reviewsWeight')}
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Penalties</Text>
                {renderInput('Cancellation Deduction', localConfig.cancellationPenalty, 'cancellationPenalty')}
                {renderInput('No-Show Deduction', localConfig.noShowPenalty, 'noShowPenalty')}
            </View>

            <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                    Adjusting these weights will recalculate rankings for all partners immediately.
                </Text>
            </View>
        </GlassCard>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
        padding: 20,
    },
    header: {
        marginBottom: 20,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    editBtn: {
        fontSize: 14,
        fontWeight: '600',
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    toggleLabel: {
        fontSize: 14,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 12,
        opacity: 0.8,
    },
    inputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    inputLabel: {
        fontSize: 14,
    },
    valueText: {
        fontSize: 14,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 4,
        width: 60,
        textAlign: 'center',
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.03)',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    infoText: {
        fontSize: 12,
        flex: 1,
    }
});
