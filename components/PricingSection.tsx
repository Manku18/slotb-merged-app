import { GlassCard } from '@/components/ui/GlassCard';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View, Linking } from 'react-native';

const { width } = Dimensions.get('window');

// HARDCODED PAYMENT LINK PROVIDED BY USER
const PAYMENT_LINK = "https://rzp.io/rzp/slotb-subscriptionf6APuBcz";

export function PricingSection() {
    const { colors } = useTheme();

    const handlePayment = () => {
        Linking.openURL(PAYMENT_LINK);
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.header, { color: colors.textSecondary }]}>PARTNER SUBSCRIPTION</Text>

            <View style={styles.cardWrapper}>
                <LinearGradient
                    colors={['#4F46E5', '#9333EA']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientBorder}
                >
                    <View style={styles.recommendedBadge}>
                        <Text style={styles.recommendedText}>Special Offer</Text>
                    </View>
                    <GlassCard style={styles.card} variant="default">
                        <View style={{ alignItems: 'center', width: '100%' }}>
                            <Text style={[styles.planName, { color: colors.textPrimary }]}>Starter Pack</Text>
                            <View style={styles.priceContainer}>
                                <Text style={[styles.price, { color: colors.textPrimary }]}>₹269</Text>
                                <Text style={[styles.period, { color: colors.textSecondary }]}>/ 3 months</Text>
                            </View>
                            <Text style={styles.specialOfferText}>
                                Includes Branding Kit + 3 Months Service FREE
                            </Text>

                            <View style={styles.featuresList}>
                                <FeatureRow icon="checkmark-done" text="Verification Badge" color="#8B5CF6" />
                                <FeatureRow icon="checkmark-done" text="Advanced Dashboard" color="#8B5CF6" />
                                <FeatureRow icon="checkmark-done" text="SlotB Partner Kit" color="#8B5CF6" />
                                <FeatureRow icon="checkmark-done" text="Priority Support" color="#8B5CF6" />
                            </View>

                            <TouchableOpacity
                                onPress={handlePayment}
                                style={styles.button}
                            >
                                <Text style={styles.buttonText}>UPGRADE NOW</Text>
                                <Ionicons name="arrow-forward" size={16} color="#FFF" style={{ marginLeft: 8 }} />
                            </TouchableOpacity>
                        </View>
                    </GlassCard>
                </LinearGradient>
            </View>
        </View>
    );
}

function FeatureRow({ icon, text, color }: { icon: string, text: string, color: string }) {
    return (
        <View style={styles.featureRow}>
            <Ionicons name={icon as any} size={18} color={color} />
            <Text style={[styles.featureText, { color: '#374151' }]}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    header: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    cardWrapper: {
        width: '100%',
    },
    gradientBorder: {
        borderRadius: 26,
        padding: 2,
    },
    card: {
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
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
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 8,
        marginTop: 8,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 8,
    },
    price: {
        fontSize: 48,
        fontWeight: '900',
    },
    period: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 4,
    },
    specialOfferText: {
        fontSize: 13,
        color: '#E11D48',
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 20,
    },
    featuresList: {
        width: '100%',
        gap: 12,
        marginBottom: 24,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    featureText: {
        fontSize: 15,
        fontWeight: '600',
    },
    button: {
        width: '100%',
        backgroundColor: '#1F2937',
        paddingVertical: 18,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 1,
    }
});
