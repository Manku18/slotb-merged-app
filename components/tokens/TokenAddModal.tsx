import { SlotBShadows } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/useAppStore';
import { apiService } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

interface TokenAddModalProps {
    visible: boolean;
    onClose: () => void;
    onAdd: (data: any) => void;
}

export function TokenAddModal({ visible, onClose, onAdd }: TokenAddModalProps) {
    const { colors } = useTheme();
    const { user } = useAppStore();

    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');

    // Service Logic
    const [services, setServices] = useState<any[]>([]);
    const [selectedService, setSelectedService] = useState<any>(null);
    const [manualPrice, setManualPrice] = useState('');
    const [showServiceDropdown, setShowServiceDropdown] = useState(false);
    const [loadingServices, setLoadingServices] = useState(false);

    useEffect(() => {
        if (visible && user?.id) {
            fetchServices();
        }
    }, [visible, user?.id]);

    const fetchServices = async () => {
        setLoadingServices(true);
        try {
            const data = await apiService.getServices(user?.id || '');
            const generalOption = { id: 'manual', title: 'General Slot', price: 0, isManual: true };
            const list = [generalOption, ...data];
            setServices(list);
            setSelectedService(list[0]);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingServices(false);
        }
    };

    const handleSubmit = () => {
        if (!name.trim()) return;

        const finalPrice = selectedService?.isManual ? parseFloat(manualPrice) : selectedService?.price;

        onAdd({
            name,
            mobile,
            service: selectedService?.title || 'General Slot',
            serviceId: selectedService?.isManual ? 0 : selectedService?.id,
            price: finalPrice
        });

        // Reset
        setName('');
        setMobile('');
        setManualPrice('');
        setSelectedService(services[0]);
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={styles.overlayInner}>
                        <TouchableWithoutFeedback onPress={() => { }}>
                            <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>

                                <View style={[styles.handle, { backgroundColor: colors.border }]} />

                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={onClose}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Ionicons name="close" size={24} color={colors.textSecondary} />
                                </TouchableOpacity>

                                <Text style={[styles.title, { color: colors.textPrimary }]}>Add Walk-in Token</Text>

                                <View style={styles.form}>
                                    <View style={styles.inputContainer}>
                                        <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                        <TextInput
                                            placeholder="Customer name"
                                            placeholderTextColor={colors.textTertiary}
                                            style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.background }]}
                                            value={name}
                                            onChangeText={setName}
                                        />
                                    </View>

                                    <View style={styles.inputContainer}>
                                        <Ionicons name="phone-portrait-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                        <TextInput
                                            placeholder="Mobile number (optional)"
                                            placeholderTextColor={colors.textTertiary}
                                            style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.background }]}
                                            value={mobile}
                                            onChangeText={setMobile}
                                            keyboardType="phone-pad"
                                        />
                                    </View>

                                    {/* Service Dropdown */}
                                    <TouchableOpacity
                                        style={[styles.dropdownTrigger, { backgroundColor: colors.background }]}
                                        onPress={() => setShowServiceDropdown(!showServiceDropdown)}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                            <Ionicons name="list-outline" size={20} color={colors.textSecondary} />
                                            <Text style={[styles.inputText, { color: colors.textPrimary }]}>
                                                {selectedService ? selectedService.title : 'Select Service'}
                                            </Text>
                                        </View>
                                        {loadingServices ? <ActivityIndicator size="small" /> : <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />}
                                    </TouchableOpacity>

                                    {/* Service List */}
                                    {showServiceDropdown && (
                                        <View style={[styles.dropdownList, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                            <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled>
                                                {services.map((s, idx) => (
                                                    <TouchableOpacity
                                                        key={idx}
                                                        style={styles.dropdownItem}
                                                        onPress={() => { setSelectedService(s); setShowServiceDropdown(false); }}
                                                    >
                                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1 }}>
                                                            <Text style={{ color: colors.textPrimary }}>{s.title}</Text>
                                                            {!s.isManual && <Text style={{ color: colors.textTertiary }}>₹{s.price}</Text>}
                                                        </View>
                                                        {selectedService?.id === s.id && <Ionicons name="checkmark" size={16} color={colors.primary} />}
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>
                                        </View>
                                    )}

                                    {/* Manual Price Input */}
                                    {selectedService?.isManual && (
                                        <View style={styles.inputContainer}>
                                            <Text style={{ position: 'absolute', left: 16, top: 14, fontSize: 16, color: colors.textSecondary }}>₹</Text>
                                            <TextInput
                                                placeholder="Enter Price"
                                                placeholderTextColor={colors.textTertiary}
                                                style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.background, paddingLeft: 30 }]}
                                                value={manualPrice}
                                                onChangeText={setManualPrice}
                                                keyboardType="numeric"
                                            />
                                        </View>
                                    )}

                                    {/* Fixed Price Display */}
                                    {!selectedService?.isManual && selectedService && (
                                        <View style={{ paddingHorizontal: 4 }}>
                                            <Text style={{ fontSize: 14, color: colors.textTertiary }}>
                                                Price: <Text style={{ color: colors.primary, fontWeight: '700' }}>₹{selectedService.price}</Text>
                                            </Text>
                                        </View>
                                    )}

                                </View>

                                <TouchableOpacity
                                    style={[
                                        styles.submitBtn,
                                        { backgroundColor: name.trim() ? '#3B82F6' : colors.textTertiary }
                                    ]}
                                    disabled={!name.trim()}
                                    onPress={handleSubmit}
                                >
                                    <Text style={styles.submitText}>Add Token</Text>
                                </TouchableOpacity>

                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    overlayInner: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    modalCard: {
        borderRadius: 24,
        padding: 24,
        ...SlotBShadows.card,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
        opacity: 0.5,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 24,
        textAlign: 'center',
        marginTop: 10,
    },
    closeButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 10,
        padding: 4,
        borderRadius: 20,
    },
    form: {
        gap: 16,
        marginBottom: 24,
    },
    inputContainer: {
        position: 'relative',
    },
    inputIcon: {
        position: 'absolute',
        left: 12,
        top: 14,
        zIndex: 1,
    },
    input: {
        height: 50,
        borderRadius: 12,
        paddingLeft: 44,
        paddingRight: 16,
        fontSize: 16,
    },
    dropdownTrigger: {
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    inputText: {
        fontSize: 16,
    },
    dropdownList: {
        borderWidth: 1,
        borderRadius: 12,
        marginTop: -8,
        padding: 8,
    },
    dropdownItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 8,
    },
    submitBtn: {
        height: 50,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    submitText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
