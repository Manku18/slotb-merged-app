import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/useAppStore';
import { apiService } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { Token } from './token.types';

interface TokenHistoryModalProps {
    visible: boolean;
    token: Token | null;
    onClose: () => void;
}

export function TokenHistoryModal({ visible, token, onClose }: TokenHistoryModalProps) {
    const { colors } = useTheme();
    const { user } = useAppStore();
    const [history, setHistory] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(false);

    const fetchHistory = async () => {
        if (!token?.mobileNumber || !user?.id) return;
        setLoading(true);
        try {
            const data = await apiService.getCustomerHistory(token.mobileNumber, user.id);
            setHistory(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (visible && token) {
            fetchHistory();
        }
    }, [visible, token?.id]);

    if (!token) return null;

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>

                            {/* Header */}
                            <View style={styles.header}>
                                <View>
                                    <Text style={[styles.customerName, { color: colors.textPrimary }]}>{token.customerName}</Text>
                                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Token #{token.tokenNumber} • History</Text>
                                </View>
                                <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
                                    <Ionicons name="close-circle" size={32} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            {/* Content - Real History */}
                            <ScrollView contentContainerStyle={styles.content}>
                                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Service Details</Text>
                                <View style={[styles.visitItem, { borderBottomColor: colors.border, borderBottomWidth: 0 }]}>
                                    <View>
                                        <Text style={[styles.visitService, { color: colors.textPrimary }]}>{token.service}</Text>
                                        <Text style={[styles.visitDate, { color: colors.textTertiary }]}>{token.time} • Today</Text>
                                    </View>
                                    <Text style={[styles.visitStaff, { color: colors.primary }]}>{token.barber}</Text>
                                </View>

                                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Past Visits & Preferences</Text>

                                {loading ? (
                                    <ActivityIndicator style={{ marginTop: 20 }} color={colors.primary} />
                                ) : history.length > 0 ? (
                                    history.map((item, i) => (
                                        <View key={i} style={[styles.visitItem, { borderBottomColor: colors.border }]}>
                                            <View>
                                                <Text style={[styles.visitService, { color: colors.textPrimary }]}>{item.service_title}</Text>
                                                <Text style={[styles.visitDate, { color: colors.textTertiary }]}>
                                                    {new Date(item.booking_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {item.status.toUpperCase()}
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                {item.partner_name && (
                                                    <Text style={[styles.visitStaff, { color: colors.primary }]}>
                                                        By {item.partner_name}
                                                    </Text>
                                                )}
                                            </View>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={[styles.noteText, { color: colors.textTertiary, marginTop: 10 }]}>
                                        No previous visit history found for this number.
                                    </Text>
                                )}

                            </ScrollView>

                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    sheet: {
        height: '65%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    customerName: {
        fontSize: 22,
        fontWeight: '800',
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 2,
    },
    closeBtn: {
        padding: 4,
    },
    content: {
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 8,
        marginTop: 12,
    },
    noteText: {
        fontSize: 14,
        lineHeight: 20,
        fontStyle: 'italic',
    },
    divider: {
        height: 1,
        marginVertical: 16,
    },
    visitItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    visitService: {
        fontSize: 15,
        fontWeight: '600',
    },
    visitDate: {
        fontSize: 12,
        marginTop: 2,
    },
    visitStaff: {
        fontSize: 13,
        fontWeight: '600',
    },
});
