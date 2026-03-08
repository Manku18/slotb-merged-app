import React, { useRef, useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Animated, StatusBar
} from 'react-native';
import {
    Calendar, CreditCard, Tag, Star, Bell,
    Gift, Zap, AlertCircle, Trash2, CheckCheck,
    ShoppingBag, Megaphone, ArrowLeft
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/Colors';

// ─── Types ───────────────────────────────────────────────────────────────────
type NotifType = 'booking' | 'payment' | 'promo' | 'reward' | 'alert' | 'system';

interface Notif {
    id: string;
    type: NotifType;
    title: string;
    body: string;
    time: string;
    read: boolean;
}

import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';

const NOTIF_API = 'https://slotb.in/api_notifications.php';

// ─── Type → icon config ────────────────────────────────────────────────────
const TYPE: Record<NotifType, { icon: React.ElementType; color: string; bg: string }> = {
    booking: { icon: Calendar, color: '#6366f1', bg: '#eef2ff' },
    payment: { icon: CreditCard, color: '#10b981', bg: '#ecfdf5' },
    promo: { icon: Megaphone, color: '#f59e0b', bg: '#fffbeb' },
    reward: { icon: Gift, color: '#f43f5e', bg: '#fff1f2' },
    alert: { icon: AlertCircle, color: '#ef4444', bg: '#fff5f5' },
    system: { icon: Zap, color: '#8b5cf6', bg: '#f5f3ff' },
};

// ─── Category icon tabs ────────────────────────────────────────────────────
const TABS = [
    { key: 'All', icon: Bell, types: ['booking', 'payment', 'promo', 'reward', 'alert', 'system'] },
    { key: 'Bookings', icon: Calendar, types: ['booking'] },
    { key: 'Payments', icon: CreditCard, types: ['payment'] },
    { key: 'Offers', icon: Tag, types: ['promo', 'reward'] },
    { key: 'Alerts', icon: AlertCircle, types: ['alert', 'system'] },
] as const;

// ─── Animated Card ────────────────────────────────────────────────────────────
const NotifItem: React.FC<{ item: Notif; index: number; email?: string; onDismiss: (id: string) => void, onMarkRead: (id: string) => void }> = ({ item, index, email, onDismiss, onMarkRead }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(16)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration: 350, delay: index * 50, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0, duration: 350, delay: index * 50, useNativeDriver: true }),
        ]).start();

        // Auto mark read when viewed
        if (!item.read) {
            fetch(NOTIF_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'mark_read', id: item.id, email }),
            })
                .then(() => onMarkRead(item.id))
                .catch(console.error);
        }
    }, [item.read]);


    const { icon: Icon, color, bg } = TYPE[item.type] || TYPE.system;

    // Format time: '2025-03-05 14:30:00' -> '14:30' or '5 Mar'
    const notifDate = new Date(item.time.replace(' ', 'T'));
    const timeStr = isNaN(notifDate.getTime())
        ? item.time
        : notifDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <Animated.View style={[styles.item, { opacity, transform: [{ translateY }] }]}>
            {!item.read && <View style={styles.unreadStripe} />}

            {/* Icon */}
            <View style={[styles.iconBox, { backgroundColor: bg }]}>
                <Icon color={color} size={20} strokeWidth={2} />
                {!item.read && <View style={[styles.unreadDot, { backgroundColor: color }]} />}
            </View>

            {/* Text */}
            <View style={styles.textBox}>
                <Text style={[styles.notifTitle, !item.read && { fontWeight: '700' }]} numberOfLines={1}>
                    {item.title}
                </Text>
                <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
            </View>

            {/* Time + dismiss */}
            <View style={styles.rightCol}>
                <Text style={styles.time}>{timeStr}</Text>
                <TouchableOpacity onPress={() => onDismiss(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Trash2 size={14} color={Colors.textLight} strokeWidth={1.5} />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

// ─── Section header ───────────────────────────────────────────────────────────
const SectionHeader: React.FC<{ label: string }> = ({ label }) => (
    <Text style={styles.sectionLabel}>{label}</Text>
);

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function NotificationScreen() {
    const navigation = useNavigation();
    const { user } = useAuth();
    const { userLocation } = useLocation();
    const [activeTab, setActiveTab] = useState<string>('All');
    const [notifs, setNotifs] = useState<Notif[]>([]);
    const [loading, setLoading] = useState(true);

    const headerY = useRef(new Animated.Value(-10)).current;
    const headerOpacity = useRef(new Animated.Value(0)).current;

    const fetchNotifs = async () => {
        if (!user?.email) return;
        try {
            setLoading(true);
            const url = `${NOTIF_API}?action=get_notifications&email=${encodeURIComponent(user.email)}&district=${encodeURIComponent(userLocation)}`;
            const res = await fetch(url);
            const text = await res.text();

            try {
                const data = JSON.parse(text);
                if (data.status === 'ok') {
                    const mapped: Notif[] = data.notifications.map((n: any) => ({
                        id: String(n.id),
                        type: n.type,
                        title: n.title,
                        body: n.message,
                        time: n.created_at,
                        read: Boolean(n.is_read)
                    }));
                    setNotifs(mapped);
                }
            } catch (jsonError) {
                console.error('[NotificationScreen] JSON Parse error. Raw response:', text);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        Animated.parallel([
            Animated.timing(headerY, { toValue: 0, duration: 380, useNativeDriver: true }),
            Animated.timing(headerOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
        ]).start();

        fetchNotifs();
    }, [user?.email]);

    const dismissed = (id: string) => setNotifs(p => p.filter(n => n.id !== id));
    const handleMarkRead = (id: string) => {
        setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllRead = async () => {
        if (!user?.email) return;
        setNotifs(p => p.map(n => ({ ...n, read: true })));
        try {
            await fetch(NOTIF_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'mark_all_read',
                    email: user.email,
                    district: userLocation
                }),
            });
        } catch (e) {
            console.error('[NotificationScreen] markAllRead error:', e);
        }
    };


    const activeTypes = TABS.find(t => t.key === activeTab)?.types ?? [];
    const filtered = notifs.filter(n => (activeTypes as string[]).includes(n.type));
    const unread = notifs.filter(n => !n.read);
    const read = filtered.filter(n => n.read);
    const unreadFiltered = filtered.filter(n => !n.read);

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* ── Header ── */}
            <Animated.View style={[styles.header, { opacity: headerOpacity, transform: [{ translateY: headerY }] }]}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{ marginRight: 12 }}
                    >
                        <ArrowLeft color={Colors.text} size={22} strokeWidth={2.5} />
                    </TouchableOpacity>
                    <Bell color={Colors.text} size={22} strokeWidth={2.5} />
                    {unread.length > 0 && (
                        <View style={styles.badge}><Text style={styles.badgeText}>{unread.length}</Text></View>
                    )}
                </View>
                {unread.length > 0 && (
                    <TouchableOpacity onPress={markAllRead} style={styles.markBtn}>
                        <CheckCheck size={14} color={Colors.primary} strokeWidth={2.5} />
                        <Text style={styles.markBtnText}>Mark read</Text>
                    </TouchableOpacity>
                )}
            </Animated.View>

            {/* ── Icon category tabs ── */}
            <Animated.View style={{ opacity: headerOpacity }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
                    {TABS.map(tab => {
                        const active = tab.key === activeTab;
                        const TabIcon = tab.icon;
                        return (
                            <TouchableOpacity
                                key={tab.key}
                                style={[styles.tab, active && styles.tabActive]}
                                onPress={() => setActiveTab(tab.key)}
                                activeOpacity={0.75}
                            >
                                <TabIcon color={active ? Colors.primary : Colors.textMuted} size={16} strokeWidth={active ? 2.5 : 2} />
                                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.key}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </Animated.View>

            {/* ── List ── */}
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
                {unreadFiltered.length > 0 && <SectionHeader label="New" />}
                {unreadFiltered.map((n, i) => (
                    <NotifItem key={n.id} item={n} index={i} email={user?.email} onDismiss={dismissed} onMarkRead={handleMarkRead} />
                ))}

                {read.length > 0 && <SectionHeader label="Earlier" />}
                {read.map((n, i) => (
                    <NotifItem key={n.id} item={n} index={i + unreadFiltered.length} email={user?.email} onDismiss={dismissed} onMarkRead={handleMarkRead} />
                ))}

                {filtered.length === 0 && (
                    <View style={styles.empty}>
                        <Bell size={32} color={Colors.textLight} strokeWidth={1.5} />
                        <Text style={styles.emptyText}>Nothing here yet</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#fafbff' },

    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 58, paddingHorizontal: 20, paddingBottom: 12,
        backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    badge: {
        backgroundColor: Colors.secondary, borderRadius: 10,
        minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
    },
    badgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
    markBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        backgroundColor: '#ede9fe', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
    },
    markBtnText: { color: Colors.primary, fontSize: 12, fontWeight: '700' },

    // Tabs
    tabs: { paddingHorizontal: 16, paddingVertical: 10, gap: 6 },
    tab: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        paddingHorizontal: 14, paddingVertical: 7,
        backgroundColor: '#f1f5f9', borderRadius: 20,
        borderWidth: 1, borderColor: 'transparent',
    },
    tabActive: { backgroundColor: '#ede9fe', borderColor: '#c7d2fe' },
    tabLabel: { fontSize: 12, fontWeight: '600', color: Colors.textMuted },
    tabLabelActive: { color: Colors.primary },

    // List
    list: { flex: 1, paddingHorizontal: 16 },
    sectionLabel: {
        fontSize: 11, fontWeight: '700', color: Colors.textMuted,
        textTransform: 'uppercase', letterSpacing: 0.8,
        marginTop: 16, marginBottom: 8, marginLeft: 2,
    },

    // Item — slim row
    item: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#fff', borderRadius: 16,
        paddingHorizontal: 14, paddingVertical: 12,
        marginBottom: 8,
        borderWidth: 1, borderColor: Colors.border,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
        position: 'relative', overflow: 'hidden',
    },
    unreadStripe: {
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: 3, backgroundColor: Colors.primary,
        borderTopLeftRadius: 16, borderBottomLeftRadius: 16,
    },
    iconBox: {
        width: 40, height: 40, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
        marginRight: 12, flexShrink: 0, position: 'relative',
    },
    unreadDot: {
        position: 'absolute', top: 0, right: 0,
        width: 8, height: 8, borderRadius: 4,
        borderWidth: 1.5, borderColor: '#fff',
    },
    textBox: { flex: 1, marginRight: 8 },
    notifTitle: { fontSize: 13, fontWeight: '500', color: Colors.text, marginBottom: 2 },
    notifBody: { fontSize: 12, color: Colors.textMuted },
    rightCol: { alignItems: 'flex-end', gap: 6, flexShrink: 0 },
    time: { fontSize: 11, color: Colors.textMuted, fontWeight: '500' },

    // Empty
    empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
    emptyText: { fontSize: 15, color: Colors.textMuted, fontWeight: '500' },
});
