import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DASHBOARD_TEXT } from '../../app/(tabs)/dashboard.constants';
import { DashboardCard } from './DashboardCard';

interface Customer {
    id: number;
    name: string;
    visits: number;
    lastVisit: string;
}

interface LoyalCustomersCardProps {
    customers: Customer[];
}

export function LoyalCustomersCard({ customers }: LoyalCustomersCardProps) {
    const { colors } = useTheme();
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    // Top 3 preview
    const previewList = customers.slice(0, 3);

    // Mock History generator
    const getCustomerHistory = (id: number) => {
        return [
            { id: 1, service: 'Haircut', date: '2 days ago', amount: 250 },
            { id: 2, service: 'Beard Trim', date: '10 days ago', amount: 150 },
            { id: 3, service: 'Hair Color', date: '1 month ago', amount: 1200 },
        ];
    };

    const handleCustomerPress = (customer: Customer) => {
        // If inside modal, show history. If outside, just open modal?
        // User asked: "on tapping each customer in loyal customer the previous visit histry appears"
        // This likely implies inside the modal list.
        // Let's support both. Tapping card opens list. Tapping item in list opens history.
        setSelectedCustomer(customer);
    };

    const closeModal = () => {
        setModalVisible(false);
        setSelectedCustomer(null);
    };

    return (
        <>
            <TouchableOpacity activeOpacity={0.9} onPress={() => setModalVisible(true)}>
                <DashboardCard
                    title={DASHBOARD_TEXT.leaderboard.loyalTitle}
                    icon="heart"
                    rightElement={
                        <View>
                            <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                        </View>
                    }
                >
                    <View style={styles.listContainer}>
                        {previewList.map((cust) => (
                            <View key={cust.id} style={styles.item}>
                                <View style={[styles.avatar, { backgroundColor: colors.sage }]}>
                                    <Text style={[styles.avatarText, { color: colors.textPrimary }]}>
                                        {cust.name.substring(0, 1)}
                                    </Text>
                                </View>
                                <View style={styles.info}>
                                    <Text style={[styles.name, { color: colors.textPrimary }]}>{cust.name}</Text>
                                    <Text style={[styles.subText, { color: colors.textSecondary }]}>Last visit: {cust.lastVisit}</Text>
                                </View>
                                <View style={[styles.badge, { backgroundColor: colors.surface }]}>
                                    <Text style={[styles.visitCount, { color: colors.primary }]}>{cust.visits} Visits</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </DashboardCard>
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    {/* Tap overlay to close */}
                    <TouchableOpacity style={StyleSheet.absoluteFill} onPress={closeModal} activeOpacity={1} />

                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <View style={[styles.modalHeader, { backgroundColor: '#F3E8FF', marginHorizontal: -24, marginTop: -24, padding: 24, marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#E9D5FF' }]}>
                            {selectedCustomer ? (
                                <TouchableOpacity onPress={() => setSelectedCustomer(null)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                    <Ionicons name="arrow-back" size={24} color="#6B21A8" />
                                    <Text style={[styles.modalTitle, { color: '#6B21A8', fontSize: 18 }]}>History</Text>
                                </TouchableOpacity>
                            ) : (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <Ionicons name="heart" size={24} color="#6B21A8" />
                                    <Text style={[styles.modalTitle, { color: '#6B21A8' }]}>{DASHBOARD_TEXT.leaderboard.loyalTitle}</Text>
                                </View>
                            )}

                            {/* Close Button absolute positioned */}
                            <TouchableOpacity
                                onPress={closeModal}
                                style={{ position: 'absolute', right: 20, top: 20 }}
                                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                            >
                                <Ionicons name="close-circle" size={32} color="#9333EA" opacity={0.5} />
                            </TouchableOpacity>
                        </View>

                        {!selectedCustomer && (
                            <Text style={{ marginBottom: 16, fontStyle: 'italic', color: colors.textSecondary }}>"Inko priority dene se rating badhegi"</Text>
                        )}

                        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                            {selectedCustomer ? (
                                // History View
                                <View>
                                    <View style={[styles.historyHeader, { backgroundColor: colors.surface }]}>
                                        <Text style={[styles.historyName, { color: colors.textPrimary }]}>{selectedCustomer.name}</Text>
                                        <Text style={{ color: colors.textSecondary }}>Total Visits: {selectedCustomer.visits}</Text>
                                    </View>
                                    <Text style={[styles.sectionHistoryTitle, { color: colors.textTertiary }]}>RECENT VISITS</Text>
                                    {getCustomerHistory(selectedCustomer.id).map((h, i) => (
                                        <View key={i} style={[styles.historyItem, { borderBottomColor: colors.border }]}>
                                            <View>
                                                <Text style={[styles.historyService, { color: colors.textPrimary }]}>{h.service}</Text>
                                                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{h.date}</Text>
                                            </View>
                                            <Text style={[styles.historyAmount, { color: colors.primary }]}>₹{h.amount}</Text>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                // List View
                                customers.map((cust) => (
                                    <TouchableOpacity
                                        key={cust.id}
                                        style={styles.modalItem}
                                        onPress={() => handleCustomerPress(cust)}
                                    >
                                        <View style={styles.info}>
                                            <Text style={[styles.name, { color: colors.textPrimary }]}>{cust.name}</Text>
                                            <Text style={[styles.subText, { color: colors.textSecondary }]}>Last visit: {cust.lastVisit}</Text>
                                        </View>
                                        <View style={{ alignItems: 'flex-end', gap: 2 }}>
                                            <Text style={[styles.visitCount, { color: colors.success, fontSize: 16 }]}>{cust.visits}</Text>
                                            <Text style={{ fontSize: 10, color: colors.textTertiary }}>Tap for history</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    listContainer: {
        marginTop: 8,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        gap: 12,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 14,
        fontWeight: '700',
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 14,
        fontWeight: '600',
    },
    subText: {
        fontSize: 11,
        fontWeight: '500',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    visitCount: {
        fontSize: 11,
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        height: '70%', // Increased to 70%
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        paddingBottom: 8, // Added padding
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    modalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    // History Styles
    historyHeader: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        alignItems: 'center',
    },
    historyName: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    sectionHistoryTitle: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 8,
        letterSpacing: 1,
    },
    historyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    historyService: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    historyAmount: {
        fontSize: 16,
        fontWeight: '700',
    }
});
