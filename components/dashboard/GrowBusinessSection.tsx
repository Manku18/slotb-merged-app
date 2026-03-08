import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/useAppStore';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import * as NavigationBar from 'expo-navigation-bar';
import { Alert, Platform, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DashboardCard } from './DashboardCard';

import { ComingSoonModal } from '../ui/ComingSoonModal';

export function GrowBusinessSection() {
    const { colors } = useTheme();
    const { user } = useAppStore();

    const [modalVisible, setModalVisible] = React.useState(false);
    const [modalConfig, setModalConfig] = React.useState({ title: '', message: '', icon: '', gradient: ['#4F46E5', '#818CF8'] });

    const handleAction = async (action: string) => {
        if (action === 'Share') {
            try {
                const shopLink = `https://slotb.in/shop/${user?.shopName?.replace(/\s+/g, '-').toLowerCase() || 'myshop'}`;
                await Share.share({
                    message: `Check out ${user?.shopName || 'my shop'} on SlotB! Book your appointment now: ${shopLink}`,
                    url: shopLink,
                });
            } catch (error) {
                Alert.alert('Error', 'Could not share profile');
            } finally {
                if (Platform.OS === 'android') {
                    setTimeout(async () => {
                        try {
                            await NavigationBar.setVisibilityAsync('hidden');
                        } catch (e) { }
                    }, 500);
                }
            }
        } else if (action === 'Boost') {
            setModalConfig({
                title: 'Boost Visibility',
                message: 'Premium boost packages to get you more customers are launching soon!',
                icon: 'rocket',
                gradient: ['#F59E0B', '#D97706'] // Amber Gradient
            });
            setModalVisible(true);
        } else if (action === 'Apply') {
            setModalConfig({
                title: 'Get Verified',
                message: 'Verification process will be available shortly. Contact support for early access.',
                icon: 'checkmark-circle',
                gradient: ['#3B82F6', '#2563EB'] // Blue Gradient
            });
            setModalVisible(true);
        }
    };

    const actions = [
        {
            id: 1,
            title: 'Boost',
            icon: 'rocket-outline',
            color: '#F59E0B', // Amber
            action: 'Boost'
        },
        {
            id: 2,
            title: 'Verified',
            icon: 'checkmark-circle-outline',
            color: '#3B82F6', // Blue
            action: 'Apply'
        },
        {
            id: 3,
            title: 'Share',
            icon: 'share-social-outline',
            color: '#10B981', // Emerald
            action: 'Share'
        }
    ];

    return (
        <>
            <DashboardCard
                title="Grow Your Business"
                icon="trending-up-outline"
            >
                <View style={styles.container}>
                    {actions.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[
                                styles.item,
                                { backgroundColor: colors.surface, borderColor: colors.border }
                            ]}
                            onPress={() => handleAction(item.action)}
                        >
                            <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
                                <Ionicons name={item.icon as any} size={24} color={item.color} />
                            </View>
                            <Text style={[styles.title, { color: colors.textPrimary }]}>{item.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </DashboardCard>

            <ComingSoonModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                title={modalConfig.title}
                message={modalConfig.message}
                icon={modalConfig.icon as any}
                gradient={modalConfig.gradient as any}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    item: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 8,
        borderRadius: 16,
        borderWidth: 1,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
    }
});
