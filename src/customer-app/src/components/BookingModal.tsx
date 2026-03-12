import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Animated,
    Modal,
    ScrollView,
    Alert,
    TextInput,
    ActivityIndicator,
    PanResponder,
    Easing,
    Platform,
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Calendar,
    X,
    CheckCircle2,
    Timer,
    Hash,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

// ------ Scratch Card Component --------------------------------------------------------------------------------------------------------------------
const ScratchCard = ({ code }: { code: string }) => {
    const [scratched, setScratched] = useState(false);
    const [scratchProgress, setScratchProgress] = useState(0);
    const revealAnim = useRef(new Animated.Value(0)).current;
    const shimmerAnim = useRef(new Animated.Value(0)).current;
    const totalScratch = useRef(0);
    const THRESHOLD = 180; // total swipe distance to reveal

    useEffect(() => {
        // shimmer loop on the scratch area
        Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, { toValue: 1, duration: 1400, useNativeDriver: true, easing: Easing.linear }),
                Animated.timing(shimmerAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const reveal = useCallback(() => {
        setScratched(true);
        Animated.spring(revealAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 7 }).start();
    }, []);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => !scratched,
            onMoveShouldSetPanResponder: () => !scratched,
            onPanResponderMove: (_, gs) => {
                const dist = Math.abs(gs.dx) + Math.abs(gs.dy);
                totalScratch.current += dist * 0.3;
                const progress = Math.min(totalScratch.current / THRESHOLD, 1);
                setScratchProgress(progress);
                if (progress >= 1) reveal();
            },
        })
    ).current;

    const shimmerX = shimmerAnim.interpolate({ inputRange: [0, 1], outputRange: [-80, 200] });
    const codeScale = revealAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.6, 1.1, 1] });
    const overlayOpacity = scratched ? 0 : (1 - scratchProgress);

    return (
        <View style={sc.card}>
            <Text style={sc.hint}>{scratched ? 'Your Reward!' : 'Scratch to Reveal Coupon'}</Text>
            <View style={sc.scratchArea} {...panResponder.panHandlers}>
                {/* Code underneath */}
                <Animated.View style={[sc.codeWrap, { transform: [{ scale: codeScale }], opacity: revealAnim }]}>
                    <Text style={sc.couponLabel}>COUPON CODE</Text>
                    <Text style={sc.couponCode}>{code}</Text>
                    <Text style={sc.couponNote}>Criteria to be announced soon</Text>
                </Animated.View>
                {/* Scratch overlay */}
                {!scratched && (
                    <Animated.View style={[sc.overlay, { opacity: overlayOpacity }]} pointerEvents="none">
                        <Animated.View style={[sc.shimmer, { transform: [{ translateX: shimmerX }] }]} />
                        <Text style={sc.scratchText}>SCRATCH HERE</Text>
                        <Text style={sc.scratchSub}>{Math.round(scratchProgress * 100)}% revealed</Text>
                    </Animated.View>
                )}
            </View>
        </View>
    );
};

const sc = StyleSheet.create({
    card: {
        width: '100%', borderRadius: 18,
        borderWidth: 2, borderColor: '#E5E7EB', overflow: 'hidden',
    },
    hint: {
        textAlign: 'center', fontSize: 11, fontWeight: '700',
        color: '#6B7280', paddingVertical: 8, backgroundColor: '#F9F9FC',
        letterSpacing: 0.3,
    },
    scratchArea: {
        height: 80, justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
    },
    codeWrap: {
        position: 'absolute', alignItems: 'center',
    },
    couponLabel: { fontSize: 8, fontWeight: '800', color: '#9CA3AF', letterSpacing: 1.5, marginBottom: 2 },
    couponCode: { fontSize: 26, fontWeight: '900', color: '#7C3AED', letterSpacing: 2 },
    couponNote: { fontSize: 9, color: '#9CA3AF', marginTop: 2 },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#C4B5FD',
        justifyContent: 'center', alignItems: 'center',
        overflow: 'hidden',
    },
    shimmer: {
        position: 'absolute', top: 0, bottom: 0, width: 60,
        backgroundColor: 'rgba(255,255,255,0.35)',
        transform: [{ skewX: '-20deg' }],
    },
    scratchText: { fontSize: 13, fontWeight: '900', color: '#fff', letterSpacing: 1.5, textTransform: 'uppercase' },
    scratchSub: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 4, fontWeight: '600' },
});

// ------ Confetti Component --------------------------------------------------------------------------------------------------------------------
const CONFETTI_COLORS = ['#F59E0B', '#EC4899', '#8B5CF6', '#10B981', '#3B82F6', '#F97316', '#fff'];
const NUM_CONFETTI = 22;

const Confetti = () => {
    const pieces = useRef(
        Array.from({ length: NUM_CONFETTI }, () => ({
            x: useRef(new Animated.Value(Math.random() * width)).current,
            y: useRef(new Animated.Value(-30)).current,
            rot: useRef(new Animated.Value(0)).current,
            color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
            size: 7 + Math.random() * 8,
            delay: Math.random() * 600,
        }))
    ).current;

    useEffect(() => {
        pieces.forEach(p => {
            const fall = Animated.loop(
                Animated.parallel([
                    Animated.sequence([
                        Animated.delay(p.delay),
                        Animated.timing(p.y, { toValue: height + 40, duration: 2200 + Math.random() * 1200, useNativeDriver: true, easing: Easing.linear }),
                    ]),
                    Animated.loop(
                        Animated.timing(p.rot, { toValue: 1, duration: 700 + Math.random() * 600, useNativeDriver: true, easing: Easing.linear })
                    ),
                ])
            );
            fall.start();
        });
    }, []);

    return (
        <>
            {pieces.map((p, i) => (
                <Animated.View
                    key={i}
                    pointerEvents="none"
                    style={[
                        {
                            position: 'absolute', width: p.size, height: p.size * 0.45,
                            borderRadius: 2, backgroundColor: p.color
                        },
                        {
                            transform: [
                                { translateX: p.x },
                                { translateY: p.y },
                                { rotate: p.rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) },
                            ]
                        },
                    ]}
                />
            ))}
        </>
    );
};

// ------ Success Modal Component ----------------------------------------------------------------------------------------------------------
interface SuccessModalProps {
    visible: boolean;
    onClose: () => void;
    tokenNum: number;
    shopName: string;
    serviceName: string;
    bookingDate: string;
}

const SuccessModal = ({ visible, onClose, tokenNum, shopName, serviceName, bookingDate }: SuccessModalProps) => {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const badgeAnim = useRef(new Animated.Value(0)).current;
    const slideUp = useRef(new Animated.Value(60)).current;
    const fadeIn = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            scaleAnim.setValue(0); badgeAnim.setValue(0); slideUp.setValue(60); fadeIn.setValue(0);
            Animated.sequence([
                Animated.timing(fadeIn, { toValue: 1, duration: 280, useNativeDriver: true }),
                Animated.spring(scaleAnim, { toValue: 1, tension: 70, friction: 7, useNativeDriver: true }),
                Animated.parallel([
                    Animated.spring(badgeAnim, { toValue: 1, tension: 55, friction: 6, useNativeDriver: true }),
                    Animated.timing(slideUp, { toValue: 0, duration: 400, useNativeDriver: true, easing: Easing.out(Easing.back(1.5)) }),
                ]),
            ]).start();
        }
    }, [visible]);

    const badgeScale = badgeAnim.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.4, 1.15, 1] });

    if (!visible) return null;
    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
            <Animated.View style={[ss.overlay, { opacity: fadeIn }]}>
                <Confetti />
                <Animated.View style={[ss.card, { transform: [{ scale: scaleAnim }] }]}>
                    {/* Close */}
                    <TouchableOpacity style={ss.closeBtn} onPress={onClose}><Text style={ss.closeBtnText}>X</Text></TouchableOpacity>

                    {/* Emoji burst */}
                    <Animated.View style={{ transform: [{ scale: badgeScale }] }}>
                        <View style={ss.emojiRing}>
                            <Text style={ss.mainEmoji}>🎉</Text>
                        </View>
                    </Animated.View>

                    <Text style={ss.congrats}>Token Confirmed!</Text>
                    <Text style={ss.subLine}>{shopName}</Text>

                    {/* Token big badge */}
                    <Animated.View style={[ss.tokenPill, { transform: [{ translateY: slideUp }] }]}>
                        <Text style={ss.tokenLabel}>YOUR TOKEN</Text>
                        <Text style={ss.tokenNum}>#{tokenNum}</Text>
                        <Text style={ss.tokenMeta}>{serviceName}  •  {bookingDate}</Text>
                    </Animated.View>

                    {/* Scratch card */}
                    <ScratchCard code="SLOTB2026" />

                    <TouchableOpacity style={ss.doneBtn} onPress={onClose}>
                        <Text style={ss.doneBtnText}>Done - See You There! 🎉</Text>
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

const ss = StyleSheet.create({
    overlay: {
        flex: 1, backgroundColor: 'rgba(10,5,30,0.88)',
        alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20,
    },
    card: {
        width: '100%', backgroundColor: '#fff',
        borderRadius: 28, padding: 24, alignItems: 'center',
        shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3, shadowRadius: 30, elevation: 20,
    },
    closeBtn: {
        position: 'absolute', top: 14, right: 14,
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center',
    },
    closeBtnText: { fontSize: 13, color: '#6B7280', fontWeight: '800' },
    emojiRing: {
        width: 72, height: 72, borderRadius: 36,
        backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center',
        marginBottom: 12,
        shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10,
    },
    mainEmoji: { fontSize: 38 },
    congrats: { fontSize: 24, fontWeight: '900', color: '#1A1A2E', marginBottom: 4, letterSpacing: -0.5 },
    subLine: { fontSize: 13, color: '#6B7280', marginBottom: 16, fontWeight: '500' },
    tokenPill: {
        width: '100%', backgroundColor: '#1C1040', borderRadius: 18,
        padding: 16, alignItems: 'center', marginBottom: 16,
    },
    tokenLabel: { fontSize: 9, fontWeight: '800', color: 'rgba(255,255,255,0.45)', letterSpacing: 1.2, marginBottom: 4 },
    tokenNum: { fontSize: 44, fontWeight: '900', color: '#fff', lineHeight: 50 },
    tokenMeta: { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 4, fontWeight: '500' },
    doneBtn: {
        marginTop: 12, backgroundColor: '#7C3AED', borderRadius: 20,
        paddingHorizontal: 28, paddingVertical: 12,
    },
    doneBtnText: { fontSize: 14, fontWeight: '800', color: '#fff' },
});

// ------ Main Booking Modal Component ----------------------------------------------------------------------------------------------------------
interface BookingModalProps {
    visible: boolean;
    onClose: () => void;
    shopId: string;
    shopName: string;
    shopAddress: string;
    user: { name: string; email: string } | null;
    navigation: any;
    initialSelectedServices?: { id: number; title: string; price: number }[];
}

export const BookingModal = ({ visible, onClose, shopId, shopName, shopAddress, user, navigation, initialSelectedServices }: BookingModalProps) => {
    const today = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const fmtLabel = (d: Date) => d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });

    const slideAnim = useRef(new Animated.Value(500)).current;
    const bgAnim = useRef(new Animated.Value(0)).current;

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [selectedDate, setSelectedDate] = useState<'today' | 'tomorrow'>('today');
    const [services, setServices] = useState<{ id: number; title: string; price: number }[]>([]);
    const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
    const [estimatedToken, setEstimatedToken] = useState<number | null>(null);
    const [waitingCount, setWaitingCount] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingServices, setLoadingServices] = useState(false);
    // Success state
    const [successVisible, setSuccessVisible] = useState(false);
    const [confirmedToken, setConfirmedToken] = useState(0);
    const [confirmedService, setConfirmedService] = useState('');

    const bookingDate = selectedDate === 'today' ? fmt(today) : fmt(tomorrow);
    const selectedServiceObjects = services.filter(s => selectedServiceIds.includes(s.id));
    const totalPrice = selectedServiceObjects.reduce((sum, s) => sum + s.price, 0);

    const formatTime = (totalMin: number) => {
        const hrs = Math.floor(totalMin / 60);
        const mins = totalMin % 60;
        if (hrs > 0) {
            return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}hr`;
        }
        return `${totalMin}m`;
    };

    const etaMin = waitingCount * 20;
    const etaMax = waitingCount * 25;

    // Animate open / close
    useEffect(() => {
        if (visible) {
            if (user) { setName(user.name); }
            Animated.parallel([
                Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
                Animated.timing(bgAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
            ]).start();
            fetchServices();
            fetchTokenStatus();
            if (initialSelectedServices && initialSelectedServices.length > 0) {
                setSelectedServiceIds(initialSelectedServices.map(s => s.id));
            }
        } else {
            slideAnim.setValue(500); bgAnim.setValue(0);
            setSelectedServiceIds([]);
        }
    }, [visible, shopId, initialSelectedServices]);

    useEffect(() => {
        if (visible && shopId) fetchTokenStatus();
    }, [selectedDate]);

    const fetchServices = async () => {
        setLoadingServices(true);
        try {
            const res = await fetch('https://slotb.in/salon_home.php', {
                method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ action: 'fetch_shop_details', shop_id: shopId }).toString(),
            });
            const text = await res.text(); const start = text.indexOf('{');
            if (start >= 0) { const d = JSON.parse(text.substring(start)); if (d.status === 'ok' && d.services) setServices(d.services); }
        } catch (e) { }
        finally { setLoadingServices(false); }
    };

    const fetchTokenStatus = async () => {
        try {
            const res = await fetch('https://slotb.in/salon_home.php', {
                method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ action: 'fetch_token_status', shop_id: shopId, date: bookingDate }).toString(),
            });
            const text = await res.text(); const start = text.indexOf('{');
            if (start >= 0) { const d = JSON.parse(text.substring(start)); if (d.status === 'ok') { setEstimatedToken(d.next_token); setWaitingCount(d.waiting ?? 0); } }
        } catch (e) { }
    };

    const dismiss = () => {
        Animated.parallel([
            Animated.timing(slideAnim, { toValue: 500, duration: 220, useNativeDriver: true }),
            Animated.timing(bgAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
        ]).start(() => { onClose(); setPhone(''); setSelectedServiceIds([]); setSelectedDate('today'); setEstimatedToken(null); setServices([]); });
    };

    const handleConfirm = async () => {
        if (!user) {
            Alert.alert('Login Required', 'Please login to book a token.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Login', onPress: () => { dismiss(); navigation.navigate('Profile'); } }
            ]); return;
        }
        if (!name.trim()) { Alert.alert('Required', 'Enter your name'); return; }
        if (!/^\d{10}$/.test(phone.trim())) { Alert.alert('Invalid', 'Enter a valid 10-digit phone'); return; }

        setIsSubmitting(true);
        try {
            // 1. Create Razorpay Order for ₹2 Booking Fee
            const orderRes = await fetch('https://slotb.in/api_booking.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ action: 'create_payment_order' }).toString(),
            });
            const orderText = await orderRes.text();
            const orderJsonStart = orderText.indexOf('{');
            if (orderJsonStart < 0) throw new Error('Failed to create payment order');
            const orderData = JSON.parse(orderText.substring(orderJsonStart));

            if (orderData.status !== 'ok') {
                throw new Error(orderData.message || 'Payment initiation failed');
            }

            // 2. Open Razorpay Checkout
            const options = {
                description: 'SlotB Booking Fee',
                image: 'https://slotb.in/favicon.png', // Fallback icon
                currency: 'INR',
                key: 'rzp_live_SQ4FojmDPwm6on', // Razorpay Key ID
                amount: orderData.order.amount,
                name: 'SlotB India',
                order_id: orderData.order.id,
                prefill: {
                    email: user.email,
                    contact: phone.trim(),
                    name: name.trim()
                },
                theme: { color: '#7C3AED' }
            };

            const paymentData = await RazorpayCheckout.open(options);

            // 3. Complete Booking with Payment Details
            const body: Record<string, string> = {
                shop_id: shopId,
                shop_name: shopName,
                user_email: user.email,
                user_name: name.trim(),
                phone: phone.trim(),
                booking_date: bookingDate,
                razorpay_payment_id: paymentData.razorpay_payment_id,
                razorpay_order_id: paymentData.razorpay_order_id,
                razorpay_signature: paymentData.razorpay_signature
            };

            if (selectedServiceIds.length > 0) {
                body.service_ids = selectedServiceIds.join(',');
            } else {
                body.service_title = 'General Slot';
            }

            const res = await fetch('https://slotb.in/api_booking.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(body).toString(),
            });

            const text = await res.text();
            const start = text.indexOf('{');
            if (start < 0) throw new Error('Bad response from server');
            const data = JSON.parse(text.substring(start));

            if (data.status === 'ok') {
                setConfirmedToken(data.booking.token);
                setConfirmedService(data.booking.service_title || 'General Slot');
                dismiss();
                setTimeout(() => setSuccessVisible(true), 350);
            } else {
                Alert.alert('Booking Failed', data.message || 'Something went wrong.');
            }
        } catch (e: any) {
            if (e.code === 2) {
                // User cancelled payment
                console.log('Payment cancelled by user');
            } else {
                Alert.alert('Error', e.message || 'Payment or Booking failed');
            }
        }
        finally { setIsSubmitting(false); }
    };

    const bgColor = bgAnim.interpolate({ inputRange: [0, 1], outputRange: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.55)'] });

    return (
        <>
            <Modal visible={visible} transparent animationType="none" onRequestClose={dismiss}>
                <Animated.View style={[bStyles.backdrop, { backgroundColor: bgColor }]}>
                    <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={dismiss} />
                    <Animated.View style={[bStyles.sheet, { transform: [{ translateY: slideAnim }] }]}>

                        {/* Drag handle */}
                        <View style={bStyles.dragHandle} />

                        {/* Header strip */}
                        <LinearGradient colors={['#1E0050', '#4A1090']} style={bStyles.sheetHeader} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                            <View>
                                <Text style={bStyles.sheetShopName} numberOfLines={1}>{shopName}</Text>
                                {!!shopAddress && <Text style={bStyles.sheetAddr} numberOfLines={1}>📍 {shopAddress}</Text>}
                            </View>
                            {estimatedToken !== null && (
                                <View style={bStyles.miniToken}>
                                    <Text style={bStyles.miniTokenNum}>#{estimatedToken}</Text>
                                    <View style={{ maxWidth: 70 }}>
                                        <Text
                                            style={bStyles.miniTokenEta}
                                            numberOfLines={1}
                                            adjustsFontSizeToFit
                                        >
                                            {waitingCount === 0 ? 'No wait' : `~${formatTime(etaMin)}-${formatTime(etaMax)}`}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </LinearGradient>

                        {/* Form body */}
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={bStyles.formBody} keyboardShouldPersistTaps="handled">

                            {/* Name + Phone row */}
                            <View style={bStyles.row}>
                                <View style={bStyles.halfField}>
                                    <Text style={bStyles.lbl}>Name</Text>
                                    <TextInput style={bStyles.inp} value={name} onChangeText={setName} placeholder="Full name" placeholderTextColor="#AAAABC" />
                                </View>
                                <View style={bStyles.halfField}>
                                    <Text style={bStyles.lbl}>Phone</Text>
                                    <TextInput style={bStyles.inp} value={phone} onChangeText={setPhone} placeholder="10-digit" placeholderTextColor="#AAAABC" keyboardType="phone-pad" maxLength={10} />
                                </View>
                            </View>

                            {/* Date pills */}
                            <Text style={bStyles.lbl}>Date</Text>
                            <View style={bStyles.dateRow}>
                                {(['today', 'tomorrow'] as const).map(d => (
                                    <TouchableOpacity key={d} style={[bStyles.datePill, selectedDate === d && bStyles.datePillActive]} onPress={() => setSelectedDate(d)}>
                                        <Text style={[bStyles.datePillMain, selectedDate === d && bStyles.datePillMainActive]}>{d === 'today' ? 'Today' : 'Tomorrow'}</Text>
                                        <Text style={[bStyles.datePillSub, selectedDate === d && bStyles.datePillSubActive]}>{fmtLabel(d === 'today' ? today : tomorrow)}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Service chips */}
                            <Text style={bStyles.lbl}>Service</Text>
                            {loadingServices ? (
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 4 }}>
                                    {[1, 2, 3, 4].map(i => (
                                        <View key={i} style={bStyles.svcCardSkel}>
                                            <View style={bStyles.svcBadgeSkel} />
                                            <View style={bStyles.svcNameSkel} />
                                        </View>
                                    ))}
                                </ScrollView>
                            ) : (
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 4, paddingHorizontal: 2 }}>
                                    {[{ id: null, title: 'General', price: 0 }, ...services].map((s: any) => {
                                        const isActive = s.id === null ? selectedServiceIds.length === 0 : selectedServiceIds.includes(s.id);
                                        return (
                                            <TouchableOpacity
                                                key={s.id ?? 'gen'}
                                                style={[bStyles.svcCard, isActive && bStyles.svcCardActive]}
                                                onPress={() => {
                                                    if (s.id === null) {
                                                        setSelectedServiceIds([]);
                                                    } else {
                                                        setSelectedServiceIds(prev => {
                                                            if (prev.includes(s.id)) return prev.filter(id => id !== s.id);
                                                            return [...prev, s.id];
                                                        });
                                                    }
                                                }}
                                                activeOpacity={0.8}
                                            >
                                                {/* Price badge - top, inline */}
                                                <View style={[bStyles.svcBadge, isActive && bStyles.svcBadgeActive, s.price === 0 && bStyles.svcBadgeFree]}>
                                                    <Text style={[bStyles.svcBadgeTxt, isActive && bStyles.svcBadgeTxtActive]}>{s.price > 0 ? ('₹' + s.price) : 'FREE'}</Text>
                                                </View>
                                                {/* Service name */}
                                                <Text style={[bStyles.svcName, isActive && bStyles.svcNameActive]} numberOfLines={2}>{s.title}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            )
                            }

                            {/* Stats bar */}
                            <View style={bStyles.statsBar}>
                                <View style={bStyles.statCell}>
                                    <Text style={bStyles.statIcon}>#</Text>
                                    <Text style={bStyles.statVal}>{estimatedToken !== null ? ('#' + estimatedToken) : '-'}</Text>
                                    <Text style={bStyles.statKey}>Token</Text>
                                </View>
                                <View style={bStyles.statDiv} />
                                <View style={bStyles.statCell}>
                                    <Text style={bStyles.statIcon}>~</Text>
                                    <View style={{ width: '90%', alignItems: 'center' }}>
                                        <Text
                                            style={bStyles.statVal}
                                            numberOfLines={1}
                                            adjustsFontSizeToFit
                                        >
                                            {waitingCount === 0 ? '0m' : `${formatTime(etaMin)}-${formatTime(etaMax)}`}
                                        </Text>
                                    </View>
                                    <Text style={bStyles.statKey}>Wait</Text>
                                </View>
                                <View style={bStyles.statDiv} />
                                <View style={bStyles.statCell}>
                                    <Text style={bStyles.statIcon}>?</Text>
                                    <Text style={bStyles.statVal}>{totalPrice > 0 ? ('₹' + totalPrice) : 'Free'}</Text>
                                    <Text style={bStyles.statKey}>Price</Text>
                                </View>
                            </View>

                        </ScrollView>

                        {/* Confirm button */}
                        <View style={bStyles.footer}>
                            <TouchableOpacity style={bStyles.confirmBtn} onPress={handleConfirm} disabled={isSubmitting} activeOpacity={0.85}>
                                <LinearGradient colors={['#7C3AED', '#C2006E']} style={bStyles.confirmGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                                    {isSubmitting
                                        ? <ActivityIndicator color="#fff" size="small" />
                                        : <Text style={bStyles.confirmTxt}>Confirm Token</Text>
                                    }
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>

                    </Animated.View>
                </Animated.View>
            </Modal>

            {/* Success Celebration */}
            <SuccessModal
                visible={successVisible}
                onClose={() => setSuccessVisible(false)}
                tokenNum={confirmedToken}
                shopName={shopName}
                serviceName={confirmedService}
                bookingDate={bookingDate}
            />
        </>
    );
};

const bStyles = StyleSheet.create({
    // Bottom sheet
    backdrop: { flex: 1, justifyContent: 'flex-end' },
    sheet: {
        backgroundColor: '#F4F4F8',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        maxHeight: height * 0.82,
        shadowColor: '#000', shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.15, shadowRadius: 20, elevation: 24,
    },
    dragHandle: {
        width: 38, height: 4, borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.35)',
        alignSelf: 'center', marginTop: 10, marginBottom: 12,
    },
    // Header
    sheetHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 18, paddingBottom: 16,
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
    },
    sheetShopName: { fontSize: 18, fontWeight: '900', color: '#fff', letterSpacing: -0.3 },
    sheetAddr: { fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
    miniToken: {
        backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14,
        paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    },
    miniTokenNum: { fontSize: 20, fontWeight: '900', color: '#fff', lineHeight: 24 },
    miniTokenEta: { fontSize: 9, color: 'rgba(255,255,255,0.6)', marginTop: 1, fontWeight: '600' },
    // Form
    formBody: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8, gap: 10 },
    row: { flexDirection: 'row', gap: 10 },
    halfField: { flex: 1 },
    lbl: { fontSize: 11, fontWeight: '700', color: '#6B7280', marginBottom: 5, letterSpacing: 0.4 },
    inp: {
        borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12,
        paddingHorizontal: 13, paddingVertical: 11,
        fontSize: 14, color: '#111827', backgroundColor: '#fff',
    },
    // Date
    dateRow: { flexDirection: 'row', gap: 10 },
    datePill: {
        flex: 1, borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12,
        paddingVertical: 10, alignItems: 'center', backgroundColor: '#fff',
    },
    datePillActive: { borderColor: '#7C3AED', backgroundColor: '#F5F3FF' },
    datePillMain: { fontSize: 13, fontWeight: '800', color: '#374151' },
    datePillMainActive: { color: '#7C3AED' },
    datePillSub: { fontSize: 9, color: '#9CA3AF', marginTop: 2, fontWeight: '500' },
    datePillSubActive: { color: '#8B5CF6' },
    // Service cards
    svcCard: {
        borderRadius: 22,
        borderWidth: 1.5, borderColor: '#E9E8F0',
        backgroundColor: '#FAFAFA',
        paddingHorizontal: 14, paddingVertical: 10,
        alignItems: 'center',
        flexDirection: 'column',
        gap: 6,
        minWidth: 80,
        shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
    },
    svcCardActive: {
        backgroundColor: '#6D28D9', borderColor: '#6D28D9',
        shadowOpacity: 0.25, elevation: 6,
    },
    svcName: {
        fontSize: 13, fontWeight: '700', color: '#374151',
        textAlign: 'center',
    },
    svcNameActive: { color: '#fff' },
    // Badge aliases used in JSX (svcBadge = svcPrice family)
    svcBadge: { backgroundColor: '#EDE9FE', borderRadius: 7, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'center' },
    svcBadgeActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
    svcBadgeFree: { backgroundColor: '#D1FAE5' },
    svcBadgeTxt: { fontSize: 8, fontWeight: '800', color: '#6D28D9', letterSpacing: 0.3 },
    svcBadgeTxtActive: { color: '#fff' },
    // Stats bar
    statsBar: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#1C1040', borderRadius: 16, overflow: 'hidden', marginTop: 4,
    },
    statCell: { flex: 1, alignItems: 'center', paddingVertical: 12 },
    statIcon: { fontSize: 12, marginBottom: 3, color: 'rgba(255,255,255,0.5)', fontWeight: '700' },
    statVal: { fontSize: 14, fontWeight: '900', color: '#fff' },
    statKey: { fontSize: 8, color: 'rgba(255,255,255,0.4)', fontWeight: '700', marginTop: 1, letterSpacing: 0.6 },
    statDiv: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.1)' },
    // Footer
    footer: {
        paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff',
        borderTopWidth: 1, borderTopColor: '#F0F0F5',
        shadowColor: '#000', shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.04, shadowRadius: 8, elevation: 6,
    },
    confirmBtn: { borderRadius: 22, overflow: 'hidden' },
    confirmGrad: { paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
    confirmTxt: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },

    // Skeleton
    svcCardSkel: {
        width: 100, height: 75, borderRadius: 22, backgroundColor: '#F3F4F6',
        alignItems: 'center', justifyContent: 'center', gap: 6,
        borderWidth: 1.5, borderColor: '#E5E7EB'
    },
    svcBadgeSkel: { width: 34, height: 14, borderRadius: 6, backgroundColor: '#E5E7EB' },
    svcNameSkel: { width: 64, height: 16, borderRadius: 6, backgroundColor: '#E5E7EB' },
});
