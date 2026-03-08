import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    LayoutAnimation,
    Platform,
    UIManager
} from 'react-native';
import { DashboardCard } from './DashboardCard';
import { GlassCard } from '../ui/GlassCard';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Expense {
    id: string;
    amount: number;
    description: string;
    category: string;
    date: number; // timestamp
}

export function ExpenseManager() {
    const { colors } = useTheme();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [historyVisible, setHistoryVisible] = useState(false);
    const [timeframe, setTimeframe] = useState<'monthly' | 'yearly' | 'lifetime'>('monthly');

    // Form Stats
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Rent');

    const STORAGE_KEY = '@slotb_expenses';
    // Indian Salon Context Categories
    const categories = ['Rent', 'Electricity Bill', 'Staff Salary', 'Product Restock', 'Tea/Snacks', 'Maintenance', 'Marketing', 'Internet/WiFi', 'Water Bill', 'Other'];

    useEffect(() => {
        loadExpenses();
    }, []);

    const loadExpenses = async () => {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEY);
            if (data) {
                setExpenses(JSON.parse(data));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const saveExpenses = async (newExpenses: Expense[]) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newExpenses));
            setExpenses(newExpenses);
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        } catch (e) {
            console.error(e);
        }
    };

    const handleAddExpense = () => {
        if (!amount || isNaN(Number(amount))) {
            Alert.alert('Invalid Amount', 'Please enter a valid number');
            return;
        }

        const desc = description.trim() || category + ' Expense';

        const newExpense: Expense = {
            id: Date.now().toString(),
            amount: parseFloat(amount),
            description: desc,
            category,
            date: Date.now()
        };

        const updated = [newExpense, ...expenses];
        saveExpenses(updated);
        setModalVisible(false);
        resetForm();
    };

    const handleDelete = (id: string) => {
        Alert.alert('Delete Expense', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                    const updated = expenses.filter(e => e.id !== id);
                    saveExpenses(updated);
                }
            }
        ]);
    };

    const resetForm = () => {
        setAmount('');
        setDescription('');
        setCategory('Rent');
    };

    // Filter & Aggregate Logic
    const getFilteredExpenses = () => {
        const now = new Date();
        return expenses.filter(e => {
            const date = new Date(e.date);
            if (timeframe === 'monthly') {
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            } else if (timeframe === 'yearly') {
                return date.getFullYear() === now.getFullYear();
            }
            return true; // lifetime
        });
    };

    const filteredList = getFilteredExpenses();
    const totalAmount = filteredList.reduce((sum, e) => sum + e.amount, 0);

    // Group by category to "merge" list
    const categoryBreakdown = filteredList.reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
        return acc;
    }, {} as Record<string, number>);

    // Sort categories by amount descending
    const sortedCategories = Object.entries(categoryBreakdown)
        .sort(([, a], [, b]) => b - a);

    return (
        <View>
            <DashboardCard
                title="Expense Calculator"
                icon="calculator-outline"
                action={
                    <TouchableOpacity onPress={() => setHistoryVisible(true)}>
                        <Ionicons name="time-outline" size={24} color={colors.primary} />
                    </TouchableOpacity>
                }
            >
                <View style={styles.container}>
                    {/* Timeframe Tabs */}
                    <View style={[styles.tabContainer, { backgroundColor: colors.surfaceHighlight || '#F3F4F6' }]}>
                        {(['monthly', 'yearly', 'lifetime'] as const).map((t) => (
                            <TouchableOpacity
                                key={t}
                                style={[styles.tab, timeframe === t && { backgroundColor: colors.surface, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 2 }]}
                                onPress={() => {
                                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                                    setTimeframe(t);
                                }}
                            >
                                <Text style={[
                                    styles.tabText,
                                    { color: timeframe === t ? colors.textPrimary : colors.textTertiary, fontWeight: timeframe === t ? '600' : '400' }
                                ]}>
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Total Display */}
                    <View style={styles.totalContainer}>
                        <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total Expenses</Text>
                        <Text style={[styles.totalValue, { color: colors.error }]}>₹{totalAmount.toLocaleString('en-IN')}</Text>
                    </View>

                    {/* Category Breakdown (Merged View) */}
                    <View style={styles.breakdownContainer}>
                        {loading ? (
                            <ActivityIndicator size="small" color={colors.primary} />
                        ) : sortedCategories.length === 0 ? (
                            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>No expenses recorded.</Text>
                        ) : (
                            sortedCategories.map(([cat, amount], index) => {
                                const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#64748B'];
                                const color = COLORS[index % COLORS.length];
                                return (
                                    <View key={cat} style={styles.categoryRow}>
                                        <View style={styles.catRowLeft}>
                                            <View style={[styles.bullet, { backgroundColor: color }]} />
                                            <Text style={[styles.catName, { color: colors.textPrimary }]}>{cat}</Text>
                                        </View>
                                        <Text style={[styles.catAmount, { color: colors.textSecondary }]}>₹{amount.toLocaleString('en-IN')}</Text>
                                    </View>
                                )
                            })
                        )}
                    </View>

                    {/* Interactive Add Button */}
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setModalVisible(true)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add-circle" size={20} color="#FFF" />
                        <Text style={styles.addButtonText}>Add Expense</Text>
                    </TouchableOpacity>
                </View>
            </DashboardCard>

            {/* Add Modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Add Salon Expense</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.textTertiary} />
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.label, { color: colors.textSecondary }]}>Amount (₹)</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
                            placeholder="0"
                            placeholderTextColor={colors.textTertiary}
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                            autoFocus
                        />

                        <Text style={[styles.label, { color: colors.textSecondary }]}>Description (Optional)</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
                            placeholder="e.g. June Rent (Defaults to Category)"
                            placeholderTextColor={colors.textTertiary}
                            value={description}
                            onChangeText={setDescription}
                        />

                        <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
                        <View style={styles.categoryGrid}>
                            {categories.map(cat => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[
                                        styles.categoryChip,
                                        category === cat ? { backgroundColor: colors.primary, borderColor: colors.primary } : { borderColor: colors.border }
                                    ]}
                                    onPress={() => setCategory(cat)}
                                >
                                    <Text style={[
                                        styles.categoryText,
                                        category === cat ? { color: '#FFF' } : { color: colors.textSecondary }
                                    ]}>{cat}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            style={[styles.saveButton, { backgroundColor: colors.primary }]}
                            onPress={handleAddExpense}
                        >
                            <Text style={styles.saveButtonText}>Save Expense</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* History Modal */}
            <Modal
                visible={historyVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setHistoryVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface, maxHeight: '80%' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Expense History</Text>
                            <TouchableOpacity onPress={() => setHistoryVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.textTertiary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {filteredList.map((item, index) => (
                                <View key={item.id} style={[styles.item, index !== filteredList.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
                                    <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
                                        <Ionicons name="receipt-outline" size={20} color="#EF4444" />
                                    </View>
                                    <View style={styles.content}>
                                        <Text style={[styles.title, { color: colors.textPrimary }]}>{item.description}</Text>
                                        <Text style={[styles.subtitle, { color: colors.textTertiary }]}>
                                            {new Date(item.date).toLocaleDateString()} • {item.category}
                                        </Text>
                                    </View>
                                    <View style={styles.rightAction}>
                                        <Text style={[styles.amount, { color: colors.error }]}>-₹{item.amount}</Text>
                                        <TouchableOpacity onPress={() => handleDelete(item.id)} style={{ padding: 4 }}>
                                            <Ionicons name="trash-outline" size={16} color={colors.textTertiary} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                            {filteredList.length === 0 && (
                                <Text style={[styles.emptyText, { color: colors.textTertiary }]}>No records found.</Text>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 0, // Reduced top padding
        paddingBottom: 4, // Reduced bottom padding
    },
    // Tab Styles
    tabContainer: {
        flexDirection: 'row',
        padding: 4,
        borderRadius: 12,
        marginBottom: 12, // Reduced margin
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 8,
    },
    tabText: {
        fontSize: 13,
    },
    // Total Display
    totalContainer: {
        alignItems: 'center',
        paddingVertical: 16,
        marginBottom: 16,
        backgroundColor: '#FEF2F2', // Light Red Background
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    totalLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    totalValue: {
        fontSize: 32,
        fontWeight: '900',
    },
    // Breakdown Styles
    breakdownContainer: {
        marginBottom: 12,
        gap: 8,
    },
    categoryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.02)',
        padding: 8,
        borderRadius: 8,
    },
    catRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    bullet: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    catName: {
        fontSize: 14,
        fontWeight: '600',
    },
    catAmount: {
        fontSize: 14,
        fontWeight: '700',
    },
    emptyText: {
        textAlign: 'center',
        marginVertical: 10,
        fontSize: 13,
        fontStyle: 'italic',
    },
    // Add Button Styles
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#4338ca', // Indigo 700
        gap: 8,
        shadowColor: "#4338ca",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    addButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFF',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        height: 56,
        borderRadius: 16,
        borderWidth: 1,
        paddingHorizontal: 16,
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 20,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 32,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
    },
    categoryText: {
        fontSize: 13,
        fontWeight: '600',
    },
    saveButton: {
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#4F46E5',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
    },
    // History Modal Items
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 12,
    },
    rightAction: {
        alignItems: 'flex-end',
        gap: 4
    },
    amount: {
        fontSize: 15,
        fontWeight: '700',
    },
});
