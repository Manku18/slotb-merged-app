import React from 'react';
import {
    StyleSheet, View, Text, ScrollView, TouchableOpacity,
    StatusBar, SafeAreaView, Dimensions, Platform
} from 'react-native';
import { X, ShieldCheck } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';

const { height: H } = Dimensions.get('window');

export default function PrivacyScreen() {
    const navigation = useNavigation();

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <LinearGradient
                colors={['#0F172A', '#1E293B', '#334155']}
                style={styles.topBg}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                    <View style={styles.cardHeader}>
                        <View>
                            <Text style={styles.cardTitle}>Privacy & Security</Text>
                            <Text style={styles.cardSub}>Effective: Feb 2, 2026</Text>
                        </View>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                            <X color="#fff" size={24} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.formCard}>
                        <View style={styles.iconHdr}>
                            <ShieldCheck color="#6366f1" size={32} strokeWidth={2.5} />
                            <Text style={styles.mainTitle}>SlotB Security</Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>1. Information We Collect</Text>
                            <Text style={styles.text}>
                                We collect your name, email, and phone number for account management.
                                <Text style={styles.bold}> Precise location data</Text> is used to show nearby salons and calculate travel times.
                            </Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>2. How We Use Data</Text>
                            <Text style={styles.text}>
                                Your data helps us match you with the best service providers and manage real-time queues via our token system.
                            </Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>3. Data Sharing</Text>
                            <Text style={styles.text}>
                                We <Text style={styles.bold}>never</Text> sell your data. Information is only shared with salons you choose to book with.
                            </Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>4. Data Security</Text>
                            <Text style={styles.text}>
                                All communication is encrypted via SSL/TLS. We implement industry-standard hashing for password protection.
                            </Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>5. Your Rights</Text>
                            <Text style={styles.text}>
                                You can access, update, or permanently delete your account and associated data directly from your profile settings.
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={styles.closeBtnFooter}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.closeBtnTxt}>Go Back</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Built for a faster, smarter salon experience.</Text>
                        <Text style={styles.footerText}>© 2026 SlotB Technologies</Text>
                    </View>

                </ScrollView>
            </SafeAreaView>
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
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardTitle: { fontSize: 24, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
    cardSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },

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
    iconHdr: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    mainTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#6366f1', marginBottom: 8, letterSpacing: -0.3 },
    text: { fontSize: 14, color: '#475569', lineHeight: 22 },
    bold: { fontWeight: '700', color: '#0f172a' },

    closeBtnFooter: {
        backgroundColor: '#f1f5f9',
        height: 54,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    closeBtnTxt: { color: '#475569', fontSize: 15, fontWeight: '700' },

    footer: {
        marginTop: 30,
        alignItems: 'center',
        paddingBottom: 40,
    },
    footerText: { fontSize: 11, color: '#94a3b8', fontWeight: '600', marginBottom: 4 },
});
