import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/useAppStore';
import { apiService } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    FlatList
} from 'react-native';

interface ServiceManagementModalProps {
    visible: boolean;
    onClose: () => void;
}

export function ServiceManagementModal({ visible, onClose }: ServiceManagementModalProps) {
    const { colors } = useTheme();
    const { user } = useAppStore();
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false);

    const [newService, setNewService] = useState({
        title: '',
        price: '',
        share: '0'
    });

    const fetchServices = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const data = await apiService.getServices(user.id);
            setServices(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (visible) {
            fetchServices();
        }
    }, [visible]);

    const handleAddService = async () => {
        if (!newService.title || !newService.price) {
            Alert.alert('Error', 'Please enter title and price');
            return;
        }

        setAdding(true);
        try {
            const res = await apiService.addService(user!.id, {
                title: newService.title,
                price: parseFloat(newService.price),
                share: parseInt(newService.share)
            });
            if (res.ok) {
                setNewService({ title: '', price: '', share: '0' });
                fetchServices();
            } else {
                Alert.alert('Error', res.message || 'Failed to add service');
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong');
        } finally {
            setAdding(false);
        }
    };

    const handleDeleteService = (id: number) => {
        Alert.alert(
            'Delete Service',
            'Are you sure you want to delete this service?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const res = await apiService.deleteService(user!.id, id);
                            if (res.ok) fetchServices();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete');
                        }
                    }
                }
            ]
        );
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={false}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>Manage Services</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <Ionicons name="close" size={28} color={colors.textPrimary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.addSection}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Add New Service</Text>
                    <TextInput
                        style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                        placeholder="Service Name (e.g. Haircut)"
                        placeholderTextColor={colors.textTertiary}
                        value={newService.title}
                        onChangeText={(txt) => setNewService({ ...newService, title: txt })}
                    />
                    <View style={styles.row}>
                        <TextInput
                            style={[styles.input, { flex: 1, color: colors.textPrimary, borderColor: colors.border }]}
                            placeholder="Price (₹)"
                            placeholderTextColor={colors.textTertiary}
                            keyboardType="numeric"
                            value={newService.price}
                            onChangeText={(txt) => setNewService({ ...newService, price: txt })}
                        />
                        <TextInput
                            style={[styles.input, { flex: 1, marginLeft: 10, color: colors.textPrimary, borderColor: colors.border }]}
                            placeholder="Staff Share %"
                            placeholderTextColor={colors.textTertiary}
                            keyboardType="numeric"
                            value={newService.share}
                            onChangeText={(txt) => setNewService({ ...newService, share: txt })}
                        />
                    </View>
                    <TouchableOpacity
                        style={[styles.addBtn, { backgroundColor: colors.primary }]}
                        onPress={handleAddService}
                        disabled={adding}
                    >
                        {adding ? <ActivityIndicator color="#FFF" /> : <Text style={styles.addBtnText}>Add Service</Text>}
                    </TouchableOpacity>
                </View>

                <View style={styles.listSection}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Current Services</Text>
                    {loading ? (
                        <ActivityIndicator style={{ marginTop: 20 }} color={colors.primary} />
                    ) : (
                        <FlatList
                            data={services}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <View style={[styles.serviceItem, { borderBottomColor: colors.border }]}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.serviceTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                                        <Text style={[styles.serviceSubtitle, { color: colors.textTertiary }]}>
                                            ₹{item.price} • Staff Share: {item.partner_share_percent}%
                                        </Text>
                                    </View>
                                    <TouchableOpacity onPress={() => handleDeleteService(item.id)}>
                                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            )}
                            ListEmptyComponent={
                                <Text style={[styles.emptyText, { color: colors.textTertiary }]}>No services added yet.</Text>
                            }
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
    },
    closeBtn: {
        padding: 4,
    },
    addSection: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginBottom: 15,
        letterSpacing: 1,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 10,
        fontSize: 16,
    },
    row: {
        flexDirection: 'row',
    },
    addBtn: {
        height: 50,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 5,
    },
    addBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    listSection: {
        flex: 1,
    },
    serviceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
    },
    serviceTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    serviceSubtitle: {
        fontSize: 14,
        marginTop: 2,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
    }
});
