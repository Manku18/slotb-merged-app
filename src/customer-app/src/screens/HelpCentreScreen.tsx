import React, { useState } from 'react';
import {
    StyleSheet, View, Text, ScrollView, TextInput,
    TouchableOpacity, ActivityIndicator, Alert, SafeAreaView,
    StatusBar, KeyboardAvoidingView, Platform, Dimensions
} from 'react-native';
import { X, Send, CheckCircle2, MessageSquare, AlertCircle, HelpCircle, PhoneCall } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

const { width: W, height: H } = Dimensions.get('window');
const API_BASE = 'https://slotb.in';

const CATEGORIES = [
    { id: 'Booking Issue', icon: MessageSquare, color: '#6366f1' },
    { id: 'App Bug', icon: AlertCircle, color: '#f43f5e' },
    { id: 'Account Issue', icon: HelpCircle, color: '#8b5cf6' },
    { id: 'Other', icon: HelpCircle, color: '#64748b' },
];

export default function HelpCentreScreen() {
    const navigation = useNavigation();
    const { user } = useAuth();

    const [category, setCategory] = useState('Booking Issue');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async () => {
        if (!subject.trim() || !description.trim()) {
            Alert.alert('Required Fields', 'Please enter a subject and description.');
            return;
        }

        setLoading(true);
        try {
            const fd = new FormData();
            fd.append('action', 'register_issue');
            fd.append('email', user?.email || 'guest@slotb.in');
            fd.append('category', category);
            fd.append('subject', subject);
            fd.append('description', description);

            const res = await fetch(`${API_BASE}/api_help.php`, {
                method: 'POST',
                body: fd
            });
            const data = await res.json();

            if (data.status === 'ok') {
                setSubmitted(true);
            } else {
                Alert.alert('Optimization Error', data.message || 'Failed to register issue.');
            }
        } catch (e) {
            Alert.alert('Connection Error', 'Please check your internet and try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <View style={styles.successRoot}>
                <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.successCard}>
                    <CheckCircle2 color="#fff" size={60} strokeWidth={2.5} />
                    <Text style={styles.successTitle}>Ticket Raised!</Text>
                    <Text style={styles.successSub}>
                        We've received your issue. Our team will reach out via email shortly.
                    </Text>
                    <TouchableOpacity
                        style={styles.doneBtn}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.doneBtnTxt}>Back to Profile</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </View>
        );
    }

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <LinearGradient
                colors={['#4F46E5', '#7C3AED', '#ac94f4']}
                style={styles.topBg}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <SafeAreaView style={{ flex: 1 }}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                        <View style={styles.cardHeader}>
                            <View>
                                <Text style={styles.cardTitle}>Contact Support</Text>
                                <Text style={styles.cardSub}>How can we help you today?</Text>
                            </View>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                                <X color="#fff" size={24} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.formCard}>
                            <Text style={styles.label}>NATURE OF ISSUE</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                                {CATEGORIES.map((cat) => {
                                    const active = category === cat.id;
                                    return (
                                        <TouchableOpacity
                                            key={cat.id}
                                            style={[styles.catPill, active && { backgroundColor: cat.color }]}
                                            onPress={() => setCategory(cat.id)}
                                        >
                                            <cat.icon color={active ? '#fff' : '#94a3b8'} size={14} />
                                            <Text style={[styles.catText, active && { color: '#fff' }]}>{cat.id}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>

                            <Text style={styles.label}>SUBJECT</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Short summary of the issue"
                                placeholderTextColor="#94a3b8"
                                value={subject}
                                onChangeText={setSubject}
                            />

                            <Text style={styles.label}>DETAILS</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Explain the problem in detail..."
                                placeholderTextColor="#94a3b8"
                                multiline
                                textAlignVertical="top"
                                value={description}
                                onChangeText={setDescription}
                            />

                            <TouchableOpacity
                                style={styles.submitBtn}
                                onPress={handleSubmit}
                                disabled={loading}
                                activeOpacity={0.9}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Text style={styles.submitTxt}>Submit Request</Text>
                                        <Send size={18} color="#fff" strokeWidth={2.5} />
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>

                        <View style={styles.contactInfo}>
                            <View style={styles.infoRow}>
                                <View style={styles.infoIcon}>
                                    <PhoneCall size={16} color="#4F46E5" />
                                </View>
                                <Text style={styles.infoText}>Available 24/7 for SlotB Partners</Text>
                            </View>
                        </View>

                    </ScrollView>
                </SafeAreaView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#f8f9fc' },
    topBg: {
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: H * 0.4,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    scroll: { padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 10 },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    closeBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardTitle: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
    cardSub: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },

    formCard: {
        backgroundColor: '#fff',
        borderRadius: 30,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    label: {
        fontSize: 11,
        fontWeight: '800',
        color: '#94a3b8',
        marginBottom: 10,
        marginTop: 15,
        letterSpacing: 1,
    },
    catScroll: { marginBottom: 10, marginHorizontal: -5 },
    catPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        marginHorizontal: 5,
    },
    catText: { fontSize: 12, fontWeight: '700', color: '#64748b' },

    input: {
        backgroundColor: '#f8f9fc',
        borderRadius: 15,
        padding: 16,
        fontSize: 15,
        color: Colors?.text || '#1A1A2E',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    textArea: { height: 120, paddingTop: 16 },
    submitBtn: {
        backgroundColor: '#4F46E5',
        height: 56,
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginTop: 24,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 5,
    },
    submitTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },

    contactInfo: {
        marginTop: 30,
        alignItems: 'center',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: 'rgba(79, 70, 229, 0.08)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    infoIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoText: { fontSize: 13, color: '#4F46E5', fontWeight: '700' },

    // Success Card
    successRoot: { flex: 1, backgroundColor: '#f8f9fc', justifyContent: 'center', alignItems: 'center', padding: 30 },
    successCard: {
        width: '100%',
        borderRadius: 35,
        padding: 40,
        alignItems: 'center',
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.4,
        shadowRadius: 30,
        elevation: 20,
    },
    successTitle: { fontSize: 26, fontWeight: '900', color: '#fff', marginTop: 24, marginBottom: 12 },
    successSub: { fontSize: 16, color: 'rgba(255,255,255,0.9)', textAlign: 'center', lineHeight: 24, marginBottom: 32, fontWeight: '500' },
    doneBtn: {
        backgroundColor: '#fff',
        paddingHorizontal: 30,
        paddingVertical: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    doneBtnTxt: { color: '#4F46E5', fontSize: 16, fontWeight: '800' },
});
