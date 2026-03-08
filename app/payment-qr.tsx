import { GlassCard } from '@/components/ui/GlassCard';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/useAppStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Share, StyleSheet, Text, TouchableOpacity, View, Clipboard, Alert, Image, SafeAreaView } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function PaymentQRScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { user } = useAppStore();

    const upiId = user?.upiId || 'not-set@upi';

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Pay ${user?.shopName || 'Salon'} via UPI: upi://pay?pa=${upiId}&pn=${user?.shopName || 'Salon'}`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleCopy = () => {
        Clipboard.setString(upiId);
        Alert.alert('Copied', 'UPI ID copied to clipboard');
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <View style={[styles.headerTitles, { marginLeft: 10 }]}>
                    <Text style={[styles.greeting, { color: colors.textSecondary }]}>Welcome to</Text>
                    <Text style={[styles.shopName, { color: colors.textPrimary }]}>slotB.in</Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/notifications')} style={[styles.bellButton, { backgroundColor: colors.surface }]}>
                    <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <GlassCard style={styles.qrCard} variant="default">
                    <View style={styles.upiBadge}>
                        <Text style={styles.upiText}>UPI PAYMENTS</Text>
                    </View>

                    <Text style={[styles.payText, { color: colors.textSecondary }]}>Scan to Pay</Text>
                    <Text style={[styles.cardShopName, { color: colors.textPrimary }]}>{user?.shopName || 'My Salon'}</Text>

                    <View style={styles.qrContainer}>
                        <View style={styles.qrInner}>
                            {user?.paymentQr ? (
                                <Image
                                    source={{ uri: user.paymentQr }}
                                    style={{ width: 220, height: 220, borderRadius: 12 }}
                                    resizeMode="contain"
                                />
                            ) : (
                                <Image
                                    source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=${user?.shopName || 'Salon'}`)}` }}
                                    style={{ width: 200, height: 200 }}
                                />
                            )}
                        </View>
                    </View>

                    {user?.paymentQr && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16 }}>
                            <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                            <Text style={{ fontSize: 10, color: '#10B981', fontWeight: '700' }}>Using Custom Merchant QR</Text>
                        </View>
                    )}

                    <Text style={[styles.upiId, { color: colors.textSecondary }]}>{upiId}</Text>
                </GlassCard>

                <TouchableOpacity onPress={handleCopy} style={[styles.copyButton, { backgroundColor: colors.surface }]}>
                    <Ionicons name="copy-outline" size={20} color={colors.primary} />
                    <Text style={[styles.copyText, { color: colors.primary }]}>Copy UPI ID</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleShare} style={{ marginTop: 20 }}>
                    <Text style={{ color: colors.primary, fontWeight: '700' }}>Share Payment Link</Text>
                </TouchableOpacity>

                <Text style={[styles.secureText, { color: colors.textTertiary }]}>
                    <Ionicons name="shield-checkmark" size={14} color="#10B981" /> 100% Secure Payments powered by UPI
                </Text>
            </View>
        </SafeAreaView>
    );
}

// Ensure Image is imported
// import { Image } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 29, // Match Home
        paddingBottom: 8, // Match Home
        gap: 12,
    },
    backButton: {
        width: 48, // Match Home
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    headerTitles: {
        flex: 1,
        justifyContent: 'center',
    },
    greeting: {
        fontSize: 13,
        fontWeight: '500',
        lineHeight: 16,
        marginBottom: 2,
    },
    shopName: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: -0.5,
        lineHeight: 26,
    },
    bellButton: {
        width: 48, // Match Home
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    qrCard: {
        width: width - 60,
        alignItems: 'center',
        padding: 24,
        borderRadius: 24,
        backgroundColor: '#FFFBEB', // Light Gold (Match Shop QR)
    },
    upiBadge: {
        backgroundColor: '#000',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 16,
    },
    upiText: {
        color: '#FFF',
        fontWeight: '800',
        fontSize: 12,
        letterSpacing: 1,
    },
    payText: {
        fontSize: 14,
        marginBottom: 2,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    cardShopName: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 24,
        lineHeight: 28,
    },
    qrContainer: {
        padding: 16,
        backgroundColor: '#FFF',
        borderRadius: 20,
        shadowColor: '#B45309', // Gold/Brown shadow
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 4,
        marginBottom: 24,
    },
    qrInner: {
        borderWidth: 1,
        borderColor: '#FDE68A', // Gold border
        padding: 4,
        borderRadius: 16,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 16,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    activeBadgeText: {
        fontSize: 11,
        color: '#10B981',
        fontWeight: '700'
    },
    upiId: {
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
        backgroundColor: '#FEF3C7', // Highlight bg
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        overflow: 'hidden',
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 16,
        marginTop: 40,
        backgroundColor: '#F59E0B', // Gold/Orange button
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    copyText: {
        fontWeight: '700',
        fontSize: 16,
        color: '#FFF',
    },
    secureText: {
        marginTop: 24,
        color: '#9CA3AF',
        fontSize: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
});
