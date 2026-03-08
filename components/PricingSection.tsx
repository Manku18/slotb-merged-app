import { GlassCard } from '@/components/ui/GlassCard';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { useAppStore } from '@/store/useAppStore';

const { width } = Dimensions.get('window');

// PLANS removed as we fetch from API


export function PricingSection() {
    const { colors } = useTheme();
    const { user } = useAppStore();
    const [plans, setPlans] = useState<any[]>([]);

    useEffect(() => {
        // Fetch plans (or use mock if API unavailable)
        const { apiService } = require('@/services/api');
        apiService.getPlans().then(setPlans).catch(() => { });
    }, []);

    const handlePlanSelect = async (planId: string) => {
        const { apiService } = require('@/services/api');

        try {
            if (user?.id) {
                // Direct update without confirmation popup
                const success = await apiService.updatePlan(planId, user.id);
                // Optional: visual feedback could be added here (e.g. toast), 
                // but avoiding alerts as requested.
                if (success) {
                    // Refresh plans or user state if needed
                    console.log("Plan updated successfully");
                }
            }
        } catch (e) {
            console.error("Plan update failed", e);
        }
    };

    if (plans.length === 0) return null;

    return (
        <View style={styles.container}>
            <Text style={[styles.header, { color: colors.textSecondary }]}>CHOOSE YOUR PARTNER PLAN</Text>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent, { paddingTop: 20 }]} // Added padding for badge
                decelerationRate="fast"
                snapToInterval={width * 0.7 + 24} // card width + margin
            >
                {plans.map((plan) => (
                    <View key={plan.id} style={styles.cardWrapper}>
                        {plan.recommended ? (
                            <LinearGradient
                                colors={['#4F46E5', '#9333EA']} // Blue to Purple gradient
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.gradientBorder}
                            >
                                <View style={styles.recommendedBadge}>
                                    <Text style={styles.recommendedText}>Recommended</Text>
                                </View>
                                {/* Override background color for dark mode pop */}
                                <GlassCard style={[styles.card, styles.highlightedCard]} variant="default">
                                    <PlanContent
                                        plan={plan}
                                        colors={colors}
                                        isHighlighted={true}
                                        onSelect={() => handlePlanSelect(plan.id)}
                                    />
                                </GlassCard>
                            </LinearGradient>
                        ) : (
                            <GlassCard style={styles.card} variant="default">
                                <PlanContent
                                    plan={plan}
                                    colors={colors}
                                    isHighlighted={false}
                                    onSelect={() => handlePlanSelect(plan.id)}
                                />
                            </GlassCard>
                        )}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

function PlanContent({ plan, colors, isHighlighted, onSelect }: { plan: any, colors: any, isHighlighted: boolean, onSelect: () => void }) {
    const [expanded, setExpanded] = useState(false);
    const visibleFeatures = expanded ? plan.features : plan.features.slice(0, 2);

    return (
        <View style={{ width: '100%' }}>
            <View style={{ alignItems: 'center' }}>
                <Text style={[styles.planName, { color: colors.textPrimary }]}>{plan.name}</Text>
                <View style={styles.priceContainer}>
                    <Text style={[styles.price, { color: colors.textPrimary }]}>{plan.price}</Text>
                    <Text style={[styles.period, { color: colors.textSecondary }]}>{plan.period}</Text>
                </View>
            </View>

            <View style={styles.featuresList}>
                {visibleFeatures.map((feature: any, index: number) => (
                    <View key={index} style={styles.featureRow}>
                        <Ionicons
                            name={feature.included ? "checkmark-circle" : "close-circle-outline"}
                            size={18}
                            color={feature.included ? (isHighlighted ? '#8B5CF6' : colors.primary) : colors.textTertiary}
                        />
                        <Text style={[
                            styles.featureText,
                            { color: feature.included ? colors.textPrimary : colors.textTertiary }
                        ]}>
                            {feature.text}
                        </Text>
                    </View>
                ))}
            </View>

            {/* See More Toggle */}
            <TouchableOpacity
                onPress={() => setExpanded(!expanded)}
                style={{ alignSelf: 'center', marginBottom: 12, padding: 4 }}
            >
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary }}>
                    {expanded ? 'Show Less' : 'See More'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={onSelect}
                style={[
                    styles.button,
                    isHighlighted ? styles.primaryButton : styles.secondaryButton
                ]}
            >
                <Text style={[
                    styles.buttonText,
                    isHighlighted ? { color: '#FFFFFF' } : { color: colors.primary }
                ]}>
                    {plan.buttonText}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    header: {
        paddingHorizontal: 20,
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20, // Space for shadows
    },
    cardWrapper: {
        marginRight: 16,
        width: width * 0.7,
    },
    card: {
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        // height: 380, // Removed fixed height
        minHeight: 320, // Reduced base height
        justifyContent: 'flex-start', // Allow content to stack top-down
    },
    gradientBorder: {
        borderRadius: 26,
        padding: 2,
        marginBottom: -2,
    },
    highlightedCard: {
        // Optional: add specific background if needed, leveraging GlassCard transparency
    },
    recommendedBadge: {
        position: 'absolute',
        top: -12,
        alignSelf: 'center',
        backgroundColor: '#E0E7FF',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        zIndex: 10,
    },
    recommendedText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#4338CA',
    },
    planName: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 8,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 24,
    },
    price: {
        fontSize: 42,
        fontWeight: '800',
    },
    period: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 4,
    },
    featuresList: {
        width: '100%',
        gap: 12,
        marginVertical: 16,
        // flex: 1, // Remove flex to allow auto-height
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    featureText: {
        fontSize: 14,
        fontWeight: '500',
    },
    button: {
        width: '100%',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 16,
        // Common shadow for all buttons to make them pop properly
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    primaryButton: {
        backgroundColor: '#1F2937', // Dark Grey/Black for strong contrast
        shadowColor: '#1F2937',
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    secondaryButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});
