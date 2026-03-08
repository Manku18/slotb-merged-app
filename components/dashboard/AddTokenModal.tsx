import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/useAppStore';
import { apiService } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ScrollView
} from 'react-native';

interface AddTokenModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function AddTokenModal({ visible, onClose, onSuccess }: AddTokenModalProps) {
    const { colors } = useTheme();
    const { user } = useAppStore();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    // Service Selection
    const [services, setServices] = useState<any[]>([]);
    const [selectedService, setSelectedService] = useState<any | null>(null);
    const [manualPrice, setManualPrice] = useState('');

    const [loading, setLoading] = useState(false);
    const [fetchingServices, setFetchingServices] = useState(false);

    useEffect(() => {
        if (visible && user?.id) {
            fetchServices();
        }
    }, [visible, user?.id]);

    const fetchServices = async () => {
        setFetchingServices(true);
        try {
            const data = await apiService.getServices(user?.id || '');
            // Append explicit "General Slot" option if not present
            const generalOption = { id: 'manual', title: 'General Slot', price: 0, isManual: true };
            setServices([generalOption, ...data]);
            setSelectedService(generalOption); // Default to General Slot
        } catch (e) {
            console.error(e);
        } finally {
            setFetchingServices(false);
        }
    };

    const handleAddToken = async () => {
        if (!name || !phone) {
            Alert.alert('Error', 'Please enter Name and Phone');
            return;
        }

        if (selectedService?.isManual && !manualPrice) {
            Alert.alert('Error', 'Please enter a price for General Slot');
            return;
        }

        setLoading(true);
        try {
            const finalPrice = selectedService?.isManual ? parseFloat(manualPrice) : selectedService.price;

            // We pass service data. Backend needs to be updated to handle manual price or distinct service_id
            // If manual, we might send specific flag or rely on backend logic update.
            // For now, let's pass it all to apiService.

            const res = await apiService.addToken({
                name,
                mobile: phone,
                service: selectedService?.title || 'General Slot',
                serviceId: selectedService?.isManual ? 0 : selectedService.id,
                price: finalPrice
            }, user?.id || '');

            if (res.ok) {
                Alert.alert('Success', `Booking #${res.token} added!`);
                setName('');
                setPhone('');
                setManualPrice('');
                setSelectedService(services[0] || null);
                if (onSuccess) onSuccess();
                onClose();
            } else {
                Alert.alert('Error', res.error || 'Failed to add booking');
            }
        } catch (error) {
            Alert.alert('Error', 'Network error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: colors.background }]}>
                    <View style={styles.header}>
                        <View>
                            <Text style={[styles.title, { color: colors.textPrimary }]}>Add Walk-in (v2)</Text>
                            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Add customer to queue</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
                        {/* Customer Info */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>CUSTOMER DETAILS</Text>
                            <View style={styles.row}>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={[styles.label, { color: colors.textTertiary }]}>Name</Text>
                                    <TextInput
                                        style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                                        value={name}
                                        onChangeText={setName}
                                        placeholder="Name"
                                        placeholderTextColor={colors.textTertiary}
                                    />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={[styles.label, { color: colors.textTertiary }]}>Phone</Text>
                                    <TextInput
                                        style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                                        value={phone}
                                        onChangeText={setPhone}
                                        placeholder="9876..."
                                        placeholderTextColor={colors.textTertiary}
                                        keyboardType="phone-pad"
                                        maxLength={10}
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Service Selection */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>SELECT SERVICE</Text>
                            {fetchingServices ? (
                                <ActivityIndicator size="small" color={colors.primary} />
                            ) : (
                                <View style={styles.serviceGrid}>
                                    {services.map((svc, idx) => {
                                        const isSelected = selectedService?.id === svc.id;
                                        return (
                                            <TouchableOpacity
                                                key={idx}
                                                style={[
                                                    styles.serviceChip,
                                                    { borderColor: colors.border, backgroundColor: colors.surface },
                                                    isSelected && { borderColor: colors.primary, backgroundColor: colors.primary + '10' }
                                                ]}
                                                onPress={() => setSelectedService(svc)}
                                            >
                                                <Text style={[
                                                    styles.serviceName,
                                                    { color: colors.textSecondary },
                                                    isSelected && { color: colors.primary, fontWeight: '700' }
                                                ]}>
                                                    {svc.title}
                                                </Text>
                                                {!svc.isManual && (
                                                    <Text style={[styles.servicePrice, { color: colors.textTertiary }]}>₹{svc.price}</Text>
                                                )}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            )}
                        </View>

                        {/* Price Input (Only for Manual) */}
                        {selectedService?.isManual && (
                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>ENTER PRICE (₹)</Text>
                                <TextInput
                                    style={[styles.input, styles.priceInput, { color: colors.primary, borderColor: colors.primary }]}
                                    value={manualPrice}
                                    onChangeText={setManualPrice}
                                    placeholder="0"
                                    placeholderTextColor={colors.textTertiary}
                                    keyboardType="numeric"
                                />
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                            onPress={handleAddToken}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitText}>Generat Token</Text>}
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    container: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        height: '85%',
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: -0.5
    },
    subtitle: {
        fontSize: 14,
    },
    closeBtn: {
        padding: 4,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        height: 32,
        width: 32,
        alignItems: 'center',
        justifyContent: 'center'
    },
    form: {
        gap: 24,
        paddingBottom: 40
    },
    section: {
        gap: 12
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        opacity: 0.8
    },
    row: {
        flexDirection: 'row',
        gap: 12
    },
    inputGroup: {
        gap: 6
    },
    label: {
        fontSize: 12,
        fontWeight: '600'
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        fontWeight: '500'
    },
    priceInput: {
        fontSize: 24,
        fontWeight: '800',
        textAlign: 'center',
        paddingVertical: 16
    },
    serviceGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10
    },
    serviceChip: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
        minWidth: '48%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    serviceName: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2
    },
    servicePrice: {
        fontSize: 12,
        fontWeight: '500'
    },
    submitBtn: {
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 12,
        elevation: 2
    },
    submitText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 16,
        letterSpacing: 0.5
    }
});
