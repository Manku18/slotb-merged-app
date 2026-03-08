import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ScrollView,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { X, Search, MapPin, Navigation, ChevronRight } from 'lucide-react-native';
import { useLocation } from '../context/LocationContext';
import { BlurView } from 'expo-blur';

const BIHAR_DISTRICTS = [
    "Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar",
    "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur",
    "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger",
    "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur",
    "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"
];

interface Props {
    visible: boolean;
    onClose: () => void;
}

export default function LocationSelectorModal({ visible, onClose }: Props) {
    const { userLocation, refreshLocation, setDistrict, isLocating } = useLocation();
    const [searchText, setSearchText] = useState('');

    const filteredDistricts = BIHAR_DISTRICTS.filter(d =>
        d.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleAutoLocation = async () => {
        await refreshLocation();
        onClose();
    };

    const handleSelectDistrict = (district: string) => {
        setDistrict(`${district}, BR`);
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={styles.overlay}>
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Select Location</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <X size={20} color="#1A1D26" />
                        </TouchableOpacity>
                    </View>

                    {/* Search Box */}
                    <View style={styles.searchWrapper}>
                        <Search size={18} color="#94A3B8" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search your city or district"
                            placeholderTextColor="#94A3B8"
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        {/* Auto Location Option */}
                        <TouchableOpacity style={styles.autoLocationRow} onPress={handleAutoLocation} disabled={isLocating}>
                            <View style={styles.autoLocationIcon}>
                                <Navigation size={18} color="#1A73E8" strokeWidth={2.5} />
                            </View>
                            <View style={styles.autoLocationText}>
                                <Text style={styles.autoTitle}>Auto Detect My Location</Text>
                                <Text style={styles.autoSub}>{isLocating ? 'Locating...' : 'Using GPS/Network'}</Text>
                            </View>
                            {isLocating ? (
                                <ActivityIndicator size="small" color="#1A73E8" />
                            ) : (
                                <ChevronRight size={18} color="#CBD5E1" />
                            )}
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <Text style={styles.sectionTitle}>Popular Districts in Bihar</Text>

                        {filteredDistricts.length > 0 ? (
                            filteredDistricts.map((district) => (
                                <TouchableOpacity
                                    key={district}
                                    style={styles.districtItem}
                                    onPress={() => handleSelectDistrict(district)}
                                >
                                    <MapPin size={16} color="#64748B" />
                                    <Text style={[
                                        styles.districtText,
                                        userLocation.includes(district) && styles.activeDistrictText
                                    ]}>
                                        {district}, Bihar
                                    </Text>
                                    {userLocation.includes(district) && (
                                        <View style={styles.activeDot} />
                                    )}
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View style={styles.noResults}>
                                <Text style={styles.noResultsText}>No districts found for "{searchText}"</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        height: '80%',
        paddingTop: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -10 },
                shadowOpacity: 0.1,
                shadowRadius: 20,
            },
            android: {
                elevation: 20,
            }
        })
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1A1D26',
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        marginHorizontal: 24,
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 50,
        marginBottom: 20,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#1A1D26',
        fontWeight: '500',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    autoLocationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    autoLocationIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#EBF5FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    autoLocationText: {
        flex: 1,
    },
    autoTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1A1D26',
        marginBottom: 2,
    },
    autoSub: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 16,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 16,
    },
    districtItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
    },
    districtText: {
        fontSize: 15,
        color: '#475569',
        fontWeight: '500',
        marginLeft: 12,
        flex: 1,
    },
    activeDistrictText: {
        color: '#1A73E8',
        fontWeight: '700',
    },
    activeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#1A73E8',
    },
    noResults: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    noResultsText: {
        fontSize: 14,
        color: '#94A3B8',
        fontWeight: '500',
    }
});
