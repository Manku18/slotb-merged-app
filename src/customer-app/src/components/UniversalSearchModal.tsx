import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, Modal, TextInput,
    TouchableOpacity, FlatList, ActivityIndicator,
    Dimensions, KeyboardAvoidingView, Platform,
    Image, Pressable
} from 'react-native';
import { Search, X, MapPin, Scissors, User, ArrowRight, ChevronRight, History } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

interface Props {
    visible: boolean;
    onClose: () => void;
}

const API_BASE = 'https://slotb.in';

export default function UniversalSearchModal({ visible, onClose }: Props) {
    const navigation = useNavigation<any>();
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<{
        salons: any[];
        providers: any[];
    }>({ salons: [], providers: [] });

    const search = useCallback(async (text: string) => {
        if (!text.trim()) {
            setResults({ salons: [], providers: [] });
            return;
        }

        setLoading(true);
        try {
            const url = `${API_BASE}/api_home.php?action=universal_search&q=${encodeURIComponent(text)}`;
            const res = await fetch(url).then(r => r.json());

            if (res.status === 'ok') {
                setResults({
                    salons: res.salons || [],
                    providers: res.providers || []
                });
            }
        } catch (e) {
            console.error('Search failed:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (query) search(query);
        }, 300);
        return () => clearTimeout(timer);
    }, [query, search]);

    const handleSelect = (item: any, type: 'salon' | 'provider') => {
        onClose();
        if (type === 'salon') {
            navigation.navigate('Salon', { search: item.name });
        } else {
            navigation.navigate('coming-soon', {
                title: item.name,
                subtitle: `${item.name} and other ${item.category} experts will be available for booking soon!`,
                emoji: '🔧',
                primaryColor: '#1D4ED8',
                secondaryColor: '#1E3A8A'
            });
        }
    };

    const renderItem = ({ item, type }: { item: any, type: 'salon' | 'provider' }) => (
        <TouchableOpacity
            style={styles.resultItem}
            onPress={() => handleSelect(item, type)}
        >
            <View style={[styles.iconWrap, { backgroundColor: type === 'salon' ? '#FCE4EC' : '#E3F2FD' }]}>
                {type === 'salon' ? (
                    <Scissors size={18} color="#AD1457" />
                ) : (
                    <User size={18} color="#1565C0" />
                )}
            </View>
            <View style={styles.itemText}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemSub} numberOfLines={1}>
                    {type === 'salon' ? item.address : item.category}
                </Text>
            </View>
            <ChevronRight size={16} color={Colors.textLight} />
        </TouchableOpacity>
    );

    const hasResults = results.salons.length > 0 || results.providers.length > 0;

    return (
        <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
            <View style={styles.container}>
                <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 60 : 40 }]}>
                    <View style={styles.searchBar}>
                        <Search size={18} color={Colors.textMuted} />
                        <TextInput
                            style={styles.input}
                            placeholder="Search salons, services, experts..."
                            placeholderTextColor={Colors.textMuted}
                            value={query}
                            onChangeText={setQuery}
                            autoFocus
                        />
                        {query.length > 0 && (
                            <TouchableOpacity onPress={() => setQuery('')}>
                                <X size={18} color={Colors.textMuted} />
                            </TouchableOpacity>
                        )}
                        <View style={styles.divider} />
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.cancelTxt}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.content}>
                    {loading ? (
                        <View style={styles.center}>
                            <ActivityIndicator color={Colors.primary} size="large" />
                        </View>
                    ) : query.length > 0 ? (
                        <FlatList
                            keyboardShouldPersistTaps="handled"
                            data={[
                                ...(results.salons.length > 0 ? [{ id: 'header-salons', type: 'header', title: 'SlotB Salons' }] : []),
                                ...results.salons.map(s => ({ ...s, itemType: 'salon' })),
                                ...(results.providers.length > 0 ? [{ id: 'header-providers', type: 'header', title: 'Service Experts' }] : []),
                                ...results.providers.map(p => ({ ...p, itemType: 'provider' }))
                            ]}
                            keyExtractor={(item) => item.id.toString() + (item.itemType || item.type)}
                            renderItem={({ item }) => {
                                if (item.type === 'header') {
                                    return <Text style={styles.sectionTitle}>{item.title}</Text>;
                                }
                                return renderItem({ item, type: item.itemType });
                            }}
                            ListEmptyComponent={() => (
                                <View style={styles.center}>
                                    <Text style={styles.noResultTxt}>No results found for "{query}"</Text>
                                </View>
                            )}
                            contentContainerStyle={{ paddingBottom: 40 }}
                        />
                    ) : (
                        <View style={styles.recentWrap}>
                            <View style={styles.recentHeader}>
                                <History size={16} color={Colors.textMuted} />
                                <Text style={styles.recentTitle}>Try Searching For</Text>
                            </View>
                            <View style={styles.tagGrid}>
                                {['Haircut', 'Massage', 'Electrician', 'Plumber', 'Bridal', 'Gym'].map(tag => (
                                    <TouchableOpacity
                                        key={tag}
                                        style={styles.tag}
                                        onPress={() => setQuery(tag)}
                                    >
                                        <Text style={styles.tagTxt}>{tag}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fc',
        borderRadius: 14,
        paddingHorizontal: 12,
        height: 50,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: Colors.text,
        fontWeight: '500',
    },
    divider: {
        width: 1,
        height: 20,
        backgroundColor: '#e5e7eb',
        marginHorizontal: 12,
    },
    cancelTxt: {
        color: Colors.primary,
        fontWeight: '700',
        fontSize: 14,
    },
    content: { flex: 1, backgroundColor: '#fff' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.textMuted,
        backgroundColor: '#f8f9fc',
        paddingVertical: 10,
        paddingHorizontal: 20,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f8f9fc',
    },
    iconWrap: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    itemText: { flex: 1 },
    itemName: { fontSize: 16, fontWeight: '600', color: Colors.text },
    itemSub: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
    noResultTxt: { fontSize: 16, color: Colors.textMuted, textAlign: 'center' },
    recentWrap: { padding: 20 },
    recentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 8 },
    recentTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
    tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    tag: {
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },
    tagTxt: { fontSize: 14, fontWeight: '600', color: Colors.text },
});
