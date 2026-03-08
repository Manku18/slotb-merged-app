import { GlassCard } from '@/components/ui/GlassCard';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/useAppStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Share, StyleSheet, Text, TouchableOpacity, View, Image, SafeAreaView } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function ShopQRScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { user } = useAppStore();

    const handleShare = async () => {
        if (!user?.qrCode) return;
        try {
            await Share.share({
                message: `Book your appointment at ${user.shopName} using slotB: ${user.qrCode}`,
                url: user.qrCode // For iOS support
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleDownload = async () => {
        // In Expo, "Download" for a network image is best handled by Share
        // which gives options like "Save Image" or "Save to Files"
        handleShare();
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
                <GlassCard style={styles.qrCard}>
                    <Text style={[styles.cardShopName, { color: colors.textPrimary }]}>{user?.shopName || 'My Salon'}</Text>
                    <Text style={[styles.scanText, { color: colors.textSecondary }]}>Scan to Book Appointment</Text>

                    <View style={styles.qrContainer}>
                        <View style={styles.qrBorder}>
                            {user?.qrCode ? (
                                <Image
                                    source={{ uri: user.qrCode }}
                                    style={{ width: 220, height: 220, borderRadius: 12 }}
                                    resizeMode="contain"
                                />
                            ) : (
                                <View style={styles.qrPlaceholder}>
                                    <Ionicons name="qr-code" size={200} color={colors.textTertiary} />
                                </View>
                            )}
                        </View>
                    </View>

                    <Text style={[styles.idText, { color: colors.textTertiary }]}>Shop ID: SLOTB-{user?.id || 'XXXX'}</Text>
                </GlassCard>

                <TouchableOpacity
                    style={[styles.downloadButton, { backgroundColor: colors.primary }]}
                    onPress={handleDownload}
                >
                    <Ionicons name="download-outline" size={20} color="#FFF" />
                    <Text style={styles.downloadText}>Download & Share QR</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{ marginTop: 20 }}
                    onPress={handleShare}
                >
                    <Text style={{ color: colors.primary, fontWeight: '600' }}>Share Link</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

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
    shareButton: {
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 12,
    },
    // Removed duplicate header/backButton styles

    headerTitles: {
        flex: 1,
        justifyContent: 'center',
    },
    greeting: {
        fontSize: 13,
        fontWeight: '500',
        lineHeight: 16,
        marginBottom: 2,
        opacity: 0.8,
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
    // shareButton removed from specific header style, handling in content or added back if needed
    // The previous design used shareButton in header, but Home design uses Bell. 
    // I will add a share button IN THE CONTENT AREA instead if it was removed, but for now enforcing Header Consistency.
    // Actually the new design has share button in header but user asked for "Same as Home". 
    // I'll keep the bell in the header as requested "same as home". 
    // The share functionality is critical for QR though.
    // I'll re-add a separate Share button in the layout if needed, but for now strict consistency.
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
        backgroundColor: '#FFFBEB', // Light Gold bg
    },
    shopHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        alignSelf: 'flex-start',
        gap: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#FEF3C7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardShopName: {
        fontSize: 20,
        fontWeight: '800',
        lineHeight: 24,
    },
    shopLocation: {
        fontSize: 12,
    },
    qrContainer: {
        padding: 16,
        backgroundColor: '#FFF',
        borderRadius: 20,
        shadowColor: '#B45309',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 4,
        marginBottom: 24,
    },
    qrBorder: {
        borderWidth: 1,
        borderColor: '#FDE68A',
        padding: 4,
        borderRadius: 16,
    },
    qrPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 24,
    },
    scanText: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    idText: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
    },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 16,
        marginTop: 40,
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    downloadText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 16,
    },
});
