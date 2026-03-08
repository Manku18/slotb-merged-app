import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Pressable,
    Platform,
    ScrollView,
} from 'react-native';
import { X, MapPin, Star, Clock, Users, Check, Filter } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

export type FilterOption = 'location' | 'ratings' | 'waiting_time' | 'persons';

interface Props {
    visible: boolean;
    onClose: () => void;
    selectedFilters: FilterOption[];
    onToggleFilter: (option: FilterOption) => void;
    onApply: () => void;
    onReset: () => void;
}

const OPTIONS: { id: FilterOption; label: string; icon: any; desc: string }[] = [
    {
        id: 'location',
        label: 'Location Priority',
        icon: MapPin,
        desc: 'Show nearest or district-matched salons first'
    },
    {
        id: 'ratings',
        label: 'Top Rated',
        icon: Star,
        desc: 'Prioritize salons with higher customer ratings'
    },
    {
        id: 'waiting_time',
        label: 'Low Waiting',
        icon: Clock,
        desc: 'Show salons with the shortest waiting times'
    },
    {
        id: 'persons',
        label: 'Availability',
        icon: Users,
        desc: 'Sort by available slots and person capacity'
    },
];

export default function SalonFilterModal({
    visible,
    onClose,
    selectedFilters,
    onToggleFilter,
    onApply,
    onReset
}: Props) {
    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={styles.overlay}>
                <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />

                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerTitleRow}>
                            <Filter size={20} color="#1A1D26" style={styles.headerIcon} />
                            <Text style={styles.title}>Refine Search</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <X size={20} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        <Text style={styles.sectionLabel}>Select Filters (Multiple)</Text>

                        {OPTIONS.map((opt) => {
                            const Icon = opt.icon;
                            const isSelected = selectedFilters.includes(opt.id);

                            return (
                                <TouchableOpacity
                                    key={opt.id}
                                    style={[styles.filterCard, isSelected && styles.filterCardActive]}
                                    onPress={() => onToggleFilter(opt.id)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.iconBox, isSelected && styles.iconBoxActive]}>
                                        <Icon size={20} color={isSelected ? '#fff' : '#64748B'} />
                                    </View>

                                    <View style={styles.filterInfo}>
                                        <Text style={[styles.filterLabel, isSelected && styles.filterLabelActive]}>
                                            {opt.label}
                                        </Text>
                                        <Text style={styles.filterDesc}>{opt.desc}</Text>
                                    </View>

                                    <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                                        {isSelected && <Check size={14} color="#fff" strokeWidth={3} />}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    {/* Footer Actions */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.resetBtn} onPress={onReset}>
                            <Text style={styles.resetText}>Reset All</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.applyBtn} onPress={onApply}>
                            <Text style={styles.applyText}>Apply Filters</Text>
                        </TouchableOpacity>
                    </View>
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
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        height: '70%',
        paddingTop: 24,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20 },
            android: { elevation: 20 }
        })
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerIcon: {
        marginRight: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1A1D26',
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 16,
    },
    filterCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    filterCardActive: {
        backgroundColor: '#EFF6FF',
        borderColor: '#1D4ED8',
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
            android: { elevation: 2 }
        })
    },
    iconBoxActive: {
        backgroundColor: '#1D4ED8',
    },
    filterInfo: {
        flex: 1,
    },
    filterLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#334155',
        marginBottom: 2,
    },
    filterLabelActive: {
        color: '#1D4ED8',
    },
    filterDesc: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
        lineHeight: 16,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#CBD5E1',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },
    checkboxActive: {
        backgroundColor: '#1D4ED8',
        borderColor: '#1D4ED8',
    },
    footer: {
        flexDirection: 'row',
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        gap: 12,
    },
    resetBtn: {
        flex: 1,
        height: 52,
        borderRadius: 16,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    resetText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#64748B',
    },
    applyBtn: {
        flex: 2,
        height: 52,
        borderRadius: 16,
        backgroundColor: '#1D4ED8',
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: { shadowColor: '#1D4ED8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
            android: { elevation: 8 }
        })
    },
    applyText: {
        fontSize: 15,
        fontWeight: '800',
        color: '#fff',
    },
});
