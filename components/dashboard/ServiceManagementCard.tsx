import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/useAppStore';
import { apiService } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    FlatList
} from 'react-native';
import { DashboardCard } from './DashboardCard';

export function ServiceManagementCard() {
    const { colors } = useTheme();
    const { user } = useAppStore();
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);

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
        fetchServices();
    }, [user?.id]);

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
                setShowAddForm(false);
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
        <DashboardCard
            title="Shop Services"
            icon="cut-outline"
            rightElement={
                <TouchableOpacity onPress={() => setShowAddForm(!showAddForm)}>
                    <Ionicons name={showAddForm ? "remove-circle-outline" : "add-circle-outline"} size={22} color={colors.primary} />
                </TouchableOpacity>
            }
        >
            {showAddForm && (
                <View style={styles.addSection}>
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
                            placeholder="Share %"
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
                        {adding ? <ActivityIndicator color="#FFF" /> : <Text style={styles.addBtnText}>Save Service</Text>}
                    </TouchableOpacity>
                </View>
            )}

            <View style={styles.listSection}>
                {loading ? (
                    <ActivityIndicator style={{ paddingVertical: 20 }} color={colors.primary} />
                ) : (
                    <View>
                        {services.length === 0 ? (
                            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>No services added yet.</Text>
                        ) : (
                            services.slice(0, 5).map((item) => (
                                <View key={item.id} style={[styles.serviceItem, { borderBottomColor: colors.border }]}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.serviceTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                                        <Text style={[styles.serviceSubtitle, { color: colors.textTertiary }]}>
                                            ₹{item.price} • Share: {item.partner_share_percent}%
                                        </Text>
                                    </View>
                                    <TouchableOpacity onPress={() => handleDeleteService(item.id)} style={styles.deleteBtn}>
                                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}
                        {services.length > 5 && (
                            <TouchableOpacity style={styles.viewAllBtn}>
                                <Text style={{ color: colors.primary, fontWeight: '600' }}>View All Services</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>
        </DashboardCard>
    );
}

const styles = StyleSheet.create({
    addSection: {
        marginBottom: 20,
        padding: 12,
        backgroundColor: 'rgba(0,0,0,0.02)',
        borderRadius: 12,
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        marginBottom: 10,
        fontSize: 15,
    },
    row: {
        flexDirection: 'row',
    },
    addBtn: {
        height: 48,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 5,
    },
    addBtnText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '700',
    },
    listSection: {
        minHeight: 40,
    },
    serviceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    serviceTitle: {
        fontSize: 15,
        fontWeight: '600',
    },
    serviceSubtitle: {
        fontSize: 13,
        marginTop: 1,
    },
    deleteBtn: {
        padding: 8,
    },
    emptyText: {
        textAlign: 'center',
        paddingVertical: 20,
        fontSize: 14,
    },
    viewAllBtn: {
        alignItems: 'center',
        paddingVertical: 12,
        marginTop: 4,
    }
});
