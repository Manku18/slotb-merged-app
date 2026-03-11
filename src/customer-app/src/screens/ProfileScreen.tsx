import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    StyleSheet, View, Text, ScrollView, Image,
    TouchableOpacity, Dimensions, Animated, StatusBar,
    Modal, TextInput, ActivityIndicator, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    ChevronRight, Calendar, Heart, History, Award,
    ShieldCheck, LifeBuoy, UserPlus, Settings,
    CreditCard, Zap, Edit3, LogOut, Bell, Star, X, Camera
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useLocation } from '../context/LocationContext';
import AuthScreen from './AuthScreen';

const API_BASE = 'https://slotb.in';


const { width } = Dimensions.get('window');

// ─── Animated Fade+Slide wrapper ───────────────────────────────────────────
const AnimatedSection: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(28)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
        ]).start();
    }, []);

    return (
        <Animated.View style={{ opacity, transform: [{ translateY }] }}>
            {children}
        </Animated.View>
    );
};

// ─── Stat Item ──────────────────────────────────────────────────────────────
const StatItem: React.FC<{ value: string; label: string; color: string }> = ({ value, label, color }) => (
    <View style={styles.statItem}>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

// ─── Action Tile ────────────────────────────────────────────────────────────
interface TileProps { icon: React.ElementType; label: string; color: string; bg: string; count?: string; onPress?: () => void; }
const ActionTile: React.FC<TileProps> = ({ icon: Icon, label, color, bg, count, onPress }) => {
    const scale = useRef(new Animated.Value(1)).current;

    // Animate only if onPress is provided, or always animate but do nothing? 
    // Usually it's better to animate in both cases
    const onPressIn = () => Animated.spring(scale, { toValue: 0.93, useNativeDriver: true }).start();
    const onPressOut = () => {
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
        if (onPress) onPress();
    };

    return (
        <TouchableOpacity onPressIn={onPressIn} onPressOut={onPressOut} activeOpacity={1}>
            <Animated.View style={[styles.tile, { transform: [{ scale }] }]}>
                <View style={[styles.tileIcon, { backgroundColor: bg }]}>
                    <Icon color={color} size={22} strokeWidth={2} />
                    {count ? <View style={[styles.tileBadge, { backgroundColor: color }]}><Text style={styles.tileBadgeText}>{count}</Text></View> : null}
                </View>
                <Text style={styles.tileLabel}>{label}</Text>
                <ChevronRight color={Colors.textLight} size={14} strokeWidth={2} />
            </Animated.View>
        </TouchableOpacity>
    );
};

// ─── Setting Row ────────────────────────────────────────────────────────────
interface RowProps { icon: React.ElementType; label: string; sub?: string; accent?: boolean; danger?: boolean; onPress?: () => void }
const SettingRow: React.FC<RowProps> = ({ icon: Icon, label, sub, accent = false, danger = false, onPress }) => {
    const tintColor = danger ? '#ef4444' : accent ? Colors.primary : Colors.textMuted;
    const bgColor = danger ? '#fff5f5' : accent ? '#ede9fe' : Colors.surface;

    return (
        <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={onPress}>
            <View style={[styles.rowIcon, { backgroundColor: bgColor }]}>
                <Icon color={tintColor} size={18} strokeWidth={2} />
            </View>
            <View style={styles.rowText}>
                <Text style={[styles.rowLabel, danger && { color: '#ef4444' }, accent && { color: Colors.primary }]}>{label}</Text>
                {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
            </View>
            <ChevronRight color={Colors.textLight} size={16} strokeWidth={2} />
        </TouchableOpacity>
    );
};

// ─── Main Screen ────────────────────────────────────────────────────────────
export default function ProfileScreen() {
    const { userLocation } = useLocation();
    const { user, logout, updateUser } = useAuth();
    const navigation = useNavigation<any>();

    // Profile Data State
    const [profileData, setProfileData] = useState<any>(null);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Edit Modal State
    const [editVisible, setEditVisible] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editPic, setEditPic] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Account Deletion State
    const { sendDeleteAccountOtp, deleteAccount } = useAuth();
    const [delVisible, setDelVisible] = useState(false);
    const [delStep, setDelStep] = useState(1);
    const [delOtp, setDelOtp] = useState('');
    const [delLoading, setDelLoading] = useState(false);

    const handleDeleteInit = () => {
        setDelStep(1);
        setDelOtp('');
        setDelVisible(true);
    };

    const sendDelOtp = async () => {
        if (!user?.email) return;
        setDelLoading(true);
        const ok = await sendDeleteAccountOtp(user.email);
        setDelLoading(false);
        if (ok) setDelStep(2);
    };

    const confirmDeletion = async () => {
        if (!user?.email) return;
        setDelLoading(true);
        const ok = await deleteAccount(user.email, delOtp);
        setDelLoading(false);
        if (ok) {
            setDelVisible(false);
            navigation.reset({ index: 0, routes: [{ name: 'login' as any }] });
        }
    };

    const checkUnread = useCallback(async () => {
        if (!user?.email) return;
        try {
            const url = `${API_BASE}/api_notifications.php?action=get_unread_count&email=${encodeURIComponent(user.email)}&district=${encodeURIComponent(userLocation)}`;
            const res = await fetch(url);
            const text = await res.text();
            const d = JSON.parse(text);
            if (d.status === 'ok') setUnreadCount(d.count);
        } catch (e) { }
    }, [user?.email, userLocation]);

    useFocusEffect(
        useCallback(() => {
            if (user) checkUnread();
        }, [user, checkUnread])
    );

    // Fetch live profile from DB
    const fetchProfile = async () => {
        if (!user?.email) return;
        setLoadingProfile(true);
        try {
            const fd = new FormData();
            fd.append('action', 'get_profile');
            fd.append('email', user.email);
            const res = await fetch(`${API_BASE}/api_auth.php`, {
                method: 'POST', body: fd
            });
            const text = await res.text();
            try {
                const data = JSON.parse(text);
                if (data.status === 'ok') {
                    setProfileData(data.profile);
                    // Update AuthContext if needed (name sync)
                    if (updateUser && data.profile.name !== user.name) {
                        updateUser({ ...user, name: data.profile.name });
                    }
                }
            } catch (e) { console.error('JSON parse error in fetchProfile:', text); }
        } catch (e) {
            console.error('Error fetching profile:', e);
        } finally {
            setLoadingProfile(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!user?.email) return;
        if (!editName.trim()) { Alert.alert('Error', 'Name is required'); return; }
        setSaving(true);
        try {
            const fd = new FormData();
            fd.append('action', 'update_profile');
            fd.append('email', user.email);
            fd.append('name', editName);
            fd.append('phone', editPhone);
            if (editPic) fd.append('profile_pic', editPic);

            const res = await fetch(`${API_BASE}/api_auth.php`, { method: 'POST', body: fd });
            const data = await res.json();
            if (data.status === 'ok') {
                setEditVisible(false);
                fetchProfile(); // Refresh
            } else {
                Alert.alert('Error', data.message || 'Failed to update profile');
            }
        } catch (e) {
            Alert.alert('Error', 'Connection failed');
        } finally {
            setSaving(false);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.6,
            base64: true,
        });

        if (!result.canceled && result.assets[0].base64) {
            setEditPic(`data:image/jpeg;base64,${result.assets[0].base64}`);
        }
    };

    const openEditModal = () => {
        setEditName(profileData?.name || user?.name || '');
        setEditPhone(profileData?.phone || '');
        setEditPic(null); // Keep null unless changing
        setEditVisible(true);
    };

    // Sparkle on cash card
    const sparkle = useRef(new Animated.Value(0)).current;
    // Pulse for the online dot
    const pulse = useRef(new Animated.Value(1)).current;
    // Scale for card entrance
    const cardScale = useRef(new Animated.Value(0.92)).current;
    const cardOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!user) return;
        fetchProfile();

        Animated.loop(
            Animated.sequence([
                Animated.timing(sparkle, { toValue: 1, duration: 1400, useNativeDriver: true }),
                Animated.timing(sparkle, { toValue: 0, duration: 1400, useNativeDriver: true }),
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, { toValue: 1.5, duration: 900, useNativeDriver: true }),
                Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
            ])
        ).start();

        Animated.parallel([
            Animated.timing(cardScale, { toValue: 1, duration: 600, delay: 300, useNativeDriver: true }),
            Animated.timing(cardOpacity, { toValue: 1, duration: 600, delay: 300, useNativeDriver: true }),
        ]).start();
    }, [user]);

    // If not logged in, the root index.tsx will redirect to /login
    if (!user) {
        return null;
    }

    const sparkleOpacity = sparkle.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] });
    const sparkleScale = sparkle.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.3] });

    const avatarSource = profileData?.profile_pic
        ? { uri: profileData.profile_pic }
        : { uri: `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(user.name)}` };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* ── Edit Profile Modal ── */}
            <Modal visible={editVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Profile</Text>
                            <TouchableOpacity onPress={() => setEditVisible(false)}>
                                <X size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.editImgWrap}>
                            <Image source={editPic ? { uri: editPic } : avatarSource} style={styles.editImg} />
                            <TouchableOpacity style={styles.camBtn} onPress={pickImage}>
                                <Camera size={16} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                value={editName}
                                onChangeText={setEditName}
                                placeholder="Enter name"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Phone Number</Text>
                            <TextInput
                                style={styles.input}
                                value={editPhone}
                                onChangeText={setEditPhone}
                                placeholder="Enter phone"
                                keyboardType="phone-pad"
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.saveBtn}
                            activeOpacity={0.8}
                            onPress={handleSaveProfile}
                            disabled={saving}
                        >
                            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnTxt}>Save Changes</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* ── Hero Header ── */}
                <AnimatedSection delay={0}>
                    <LinearGradient
                        colors={['#f0f4ff', '#fdf2fb', '#fff']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={styles.hero}
                    >
                        <View style={styles.heroActions}>
                            <TouchableOpacity style={styles.heroBtn} onPress={() => navigation.navigate('Notifications')}>
                                <Bell size={18} color={Colors.primary} strokeWidth={2} />
                                {unreadCount > 0 && <View style={styles.notifDot} />}
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.heroBtn} onPress={openEditModal}>
                                <Edit3 size={18} color={Colors.primary} strokeWidth={2} />
                            </TouchableOpacity>
                        </View>


                        <View style={styles.avatarOuter}>
                            <LinearGradient colors={[Colors.primary, '#a78bfa', Colors.secondary]} style={styles.avatarGradient}>
                                <Image
                                    source={avatarSource}
                                    style={styles.avatar}
                                />
                            </LinearGradient>

                            <View style={styles.pulseWrap}>
                                <Animated.View style={[styles.pulseBg, { transform: [{ scale: pulse }], opacity: 0.3 }]} />
                                <View style={styles.onlineDot} />
                            </View>

                            <View style={styles.starBadge}>
                                <Star size={10} color="#fff" fill="#fff" strokeWidth={0} />
                            </View>
                        </View>

                        <Text style={styles.name}>{profileData?.name || user.name}</Text>
                        <Text style={styles.email}>{user.email}</Text>
                        {profileData?.phone ? <Text style={styles.phone}>{profileData.phone}</Text> : null}

                        <View style={styles.tagRow}>
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>✦ Verified Member</Text>
                            </View>
                        </View>

                        <View style={styles.statsCard}>
                            <StatItem value={String(profileData?.bookings || 0)} label="Bookings" color={Colors.primary} />
                            <View style={styles.statDiv} />
                            <StatItem value="0" label="Favourites" color={Colors.secondary} />
                            <View style={styles.statDiv} />
                            <StatItem value={String(profileData?.points || 0)} label="Points" color={Colors.accent} />
                        </View>

                    </LinearGradient>
                </AnimatedSection>

                {/* ── Cash Card ── */}
                <AnimatedSection delay={150}>
                    <Animated.View style={[styles.cardWrap, { opacity: cardOpacity, transform: [{ scale: cardScale }] }]}>
                        <LinearGradient
                            colors={['#6366f1', '#8b5cf6', '#a78bfa']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                            style={styles.cashCard}
                        >
                            <View style={styles.c1} />
                            <View style={styles.c2} />
                            <View style={styles.c3} />

                            <Animated.View style={[styles.sparkle, { opacity: sparkleOpacity, transform: [{ scale: sparkleScale }] }]}>
                                <Zap size={18} color="rgba(255,255,255,0.95)" fill="rgba(255,255,255,0.95)" />
                            </Animated.View>

                            <View style={styles.cardTop}>
                                <View>
                                    <Text style={styles.cardName}>SlotB Cash</Text>
                                    <Text style={styles.cardSub}>Save on bookings</Text>
                                </View>
                                <CreditCard color="rgba(255,255,255,0.7)" size={26} strokeWidth={1.5} />
                            </View>

                            <Text style={styles.amount}>₹ {parseFloat(profileData?.wallet_balance || '0.00').toFixed(2)}</Text>

                            <View style={styles.cardBottom}>
                                <TouchableOpacity style={styles.addBtn} activeOpacity={0.85}>
                                    <Text style={styles.addBtnText}>+ Refill Wallet</Text>
                                </TouchableOpacity>
                                <TouchableOpacity activeOpacity={0.8}>
                                    <Text style={styles.txnLink}>Details →</Text>
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    </Animated.View>
                </AnimatedSection>

                {/* ── Quick Actions ── */}
                <AnimatedSection delay={250}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Dashboard</Text>
                        <View style={styles.tileGrid}>
                            <ActionTile
                                icon={Calendar}
                                label="My Bookings"
                                color="#6366f1"
                                bg="#eef2ff"
                                onPress={() => navigation.navigate('MyBookings')}
                            />
                            <ActionTile icon={Heart} label="Favourites" color="#f43f5e" bg="#fff1f2" />
                        </View>
                    </View>
                </AnimatedSection>

                {/* ── Account Settings ── */}
                <AnimatedSection delay={350}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Account</Text>
                        <View style={styles.card}>
                            <SettingRow icon={ShieldCheck} label="Privacy & Security" sub="Manage permissions" />
                            <View style={styles.div} />
                            <SettingRow icon={LifeBuoy} label="Help Center" sub="Live support 24/7" />
                        </View>
                    </View>
                </AnimatedSection>

                {/* ── Sign Out & Delete ── */}
                <AnimatedSection delay={420}>
                    <View style={styles.section}>
                        <View style={styles.card}>
                            <SettingRow
                                icon={LogOut}
                                label="Log Out"
                                danger
                                onPress={() => {
                                    Alert.alert('Log Out', 'Are you sure you want to log out?', [
                                        { text: 'Cancel', style: 'cancel' },
                                        {
                                            text: 'Log Out',
                                            style: 'destructive',
                                            onPress: async () => {
                                                await logout();
                                                navigation.reset({
                                                    index: 0,
                                                    routes: [{ name: 'login' as any }],
                                                });
                                            }
                                        }
                                    ]);
                                }}
                            />
                            <View style={styles.div} />
                            <SettingRow
                                icon={ShieldCheck}
                                label="Delete Account"
                                danger
                                onPress={handleDeleteInit}
                            />
                        </View>
                    </View>
                </AnimatedSection>

                <View style={{ height: 32 }} />
            </ScrollView>

            {/* ── Delete Account Modal ── */}
            <Modal visible={delVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { paddingBottom: 60 }]}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={[styles.modalTitle, { color: '#ef4444' }]}>Delete Account</Text>
                                <Text style={styles.modalSub}>Permanently remove your data</Text>
                            </View>
                            <TouchableOpacity onPress={() => setDelVisible(false)} disabled={delLoading}>
                                <X size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {delStep === 1 ? (
                            <View style={{ gap: 16 }}>
                                <View style={styles.warningBox}>
                                    <ShieldCheck size={20} color="#ef4444" />
                                    <Text style={styles.warningTxt}>This action is irreversible. All your bookings and points will be lost.</Text>
                                </View>
                                <TouchableOpacity
                                    style={[styles.saveBtn, { backgroundColor: '#ef4444' }]}
                                    onPress={sendDelOtp}
                                    disabled={delLoading}
                                >
                                    {delLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnTxt}>Send Verification OTP</Text>}
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={{ gap: 16 }}>
                                <Text style={styles.otpInfo}>A 6-digit code has been sent to {user.email}</Text>
                                <View style={styles.inputGroup}>
                                    <TextInput
                                        style={[styles.input, { textAlign: 'center', fontSize: 24, letterSpacing: 8, height: 60 }]}
                                        placeholder="000000"
                                        keyboardType="numeric"
                                        maxLength={6}
                                        value={delOtp}
                                        onChangeText={setDelOtp}
                                    />
                                </View>
                                <TouchableOpacity
                                    style={[styles.saveBtn, { backgroundColor: '#000' }]}
                                    onPress={confirmDeletion}
                                    disabled={delLoading || delOtp.length < 6}
                                >
                                    {delLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnTxt}>Verify & Delete Permanently</Text>}
                                </TouchableOpacity>

                                <View style={styles.tipBox}>
                                    <Text style={styles.tipText}>
                                        Tip: If you don't see the code, check your spam folder as automated emails can sometimes be filtered.
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#fafbff' },
    scroll: { paddingBottom: 20 },

    // Hero
    hero: { paddingTop: 52, paddingBottom: 28, paddingHorizontal: 24, alignItems: 'center' },
    heroActions: {
        width: '100%', flexDirection: 'row',
        justifyContent: 'flex-end', gap: 10, marginBottom: 20,
    },
    heroBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
        shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12, shadowRadius: 8, elevation: 4, position: 'relative',
    },
    notifDot: {
        position: 'absolute', top: 9, right: 9,
        width: 7, height: 7, borderRadius: 4,
        backgroundColor: Colors.secondary, borderWidth: 1.5, borderColor: '#fff',
    },

    // Avatar
    avatarOuter: { position: 'relative', marginBottom: 16 },
    avatarGradient: { width: 104, height: 104, borderRadius: 52, padding: 3 },
    avatar: { width: 98, height: 98, borderRadius: 49, borderWidth: 3, borderColor: '#fff' },
    pulseWrap: { position: 'absolute', bottom: 4, right: 0, alignItems: 'center', justifyContent: 'center' },
    pulseBg: { position: 'absolute', width: 18, height: 18, borderRadius: 9, backgroundColor: Colors.green },
    onlineDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.green, borderWidth: 2.5, borderColor: '#fff' },
    starBadge: {
        position: 'absolute', top: 2, right: 0,
        width: 22, height: 22, borderRadius: 11,
        backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: '#fff',
    },

    name: { fontSize: 22, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
    email: { fontSize: 13, color: Colors.textMuted, marginTop: 4 },
    phone: { fontSize: 13, color: Colors.text, fontWeight: '600', marginTop: 2, marginBottom: 14 },

    tagRow: { flexDirection: 'row', gap: 8, marginBottom: 22, marginTop: 14 },
    tag: {
        backgroundColor: '#ede9fe', borderRadius: 20,
        paddingHorizontal: 12, paddingVertical: 5,
        borderWidth: 1, borderColor: '#ddd6fe',
    },
    tagGreen: { backgroundColor: '#dcfce7', borderColor: '#bbf7d0' },
    tagText: { fontSize: 11, fontWeight: '700', color: Colors.primary },

    // Stats
    statsCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#fff', borderRadius: 20,
        paddingVertical: 18, paddingHorizontal: 10,
        width: '100%',
        shadowColor: '#6366f1', shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
    },
    statItem: { flex: 1, alignItems: 'center' },
    statValue: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
    statLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 3, fontWeight: '500' },
    statDiv: { width: 1, height: 36, backgroundColor: Colors.border },

    // Cash Card
    cardWrap: { paddingHorizontal: 20, marginTop: 20 },
    cashCard: {
        borderRadius: 26, padding: 26, overflow: 'hidden',
        shadowColor: '#6366f1', shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.35, shadowRadius: 22, elevation: 14,
    },
    c1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.07)', top: -70, right: -50 },
    c2: { position: 'absolute', width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -40, left: -10 },
    c3: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.04)', top: 30, right: 80 },
    sparkle: { position: 'absolute', top: 22, right: 80 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    cardName: { color: '#fff', fontSize: 15, fontWeight: '700' },
    cardSub: { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 2 },
    amount: { color: '#fff', fontSize: 38, fontWeight: '800', marginVertical: 16, letterSpacing: -1 },
    cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    addBtn: {
        backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.35)',
        paddingHorizontal: 22, paddingVertical: 11, borderRadius: 14,
    },
    addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    txnLink: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '600' },

    // Sections
    section: { paddingHorizontal: 20, marginTop: 22 },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.text, marginBottom: 12, letterSpacing: -0.3 },

    // Tile action grid
    tileGrid: { gap: 10 },
    tile: {
        backgroundColor: '#fff', borderRadius: 16,
        paddingHorizontal: 16, paddingVertical: 14,
        flexDirection: 'row', alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
        borderWidth: 1, borderColor: Colors.border,
    },
    tileIcon: { width: 42, height: 42, borderRadius: 13, justifyContent: 'center', alignItems: 'center', marginRight: 14, position: 'relative' },
    tileLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.text },
    tileBadge: {
        position: 'absolute', top: -4, right: -4,
        minWidth: 18, height: 18, borderRadius: 9,
        justifyContent: 'center', alignItems: 'center',
        paddingHorizontal: 4, borderWidth: 1.5, borderColor: '#fff',
    },
    tileBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },

    // Settings card
    card: {
        backgroundColor: '#fff', borderRadius: 20,
        borderWidth: 1, borderColor: Colors.border,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 18, paddingVertical: 14,
    },
    rowIcon: {
        width: 38, height: 38, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center', marginRight: 14,
    },
    rowText: { flex: 1 },
    rowLabel: { fontSize: 14, fontWeight: '600', color: Colors.text },
    rowSub: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
    div: { height: 1, backgroundColor: Colors.border, marginHorizontal: 18 },

    // Edit Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
    editImgWrap: { alignSelf: 'center', width: 90, height: 90, borderRadius: 45, marginBottom: 24, position: 'relative' },
    editImg: { width: '100%', height: '100%', borderRadius: 45, backgroundColor: '#f0f0f0' },
    camBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: Colors.primary, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
    inputGroup: { marginBottom: 16 },
    inputLabel: { fontSize: 12, fontWeight: '600', color: Colors.textLight, marginBottom: 6, paddingLeft: 4 },
    input: { backgroundColor: '#f8f9fc', borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 16, height: 48, fontSize: 15, color: Colors.text },
    saveBtn: { backgroundColor: Colors.primary, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
    saveBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },

    // Deletion Modal
    modalSub: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
    warningBox: { backgroundColor: '#fef2f2', padding: 16, borderRadius: 12, flexDirection: 'row', gap: 12, alignItems: 'flex-start', borderWidth: 1, borderColor: '#fee2e2', marginTop: 10 },
    warningTxt: { flex: 1, fontSize: 13, color: '#991b1b', lineHeight: 18, fontWeight: '500' },
    otpInfo: { fontSize: 14, color: Colors.text, textAlign: 'center', lineHeight: 20, paddingHorizontal: 20 },

    tipBox: { marginTop: 15, padding: 12, backgroundColor: '#f0f9ff', borderRadius: 10, borderWidth: 1, borderColor: '#e0f2fe' },
    tipText: { fontSize: 11, color: '#0369a1', textAlign: 'center', lineHeight: 16, fontWeight: '500' },
});
