import React, { useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, Animated,
    Dimensions, TouchableOpacity, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, Sparkles, BellRing } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { AlertEmitter } from '../components/AlertEmitter';

const { width: W, height: H } = Dimensions.get('window');

export default function ComingSoonScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const route = useRoute<any>();

    // Default values if no params provided
    const {
        title = 'Coming Soon',
        subtitle = 'We are working hard to bring this feature to you. Stay tuned for something amazing!',
        emoji = '🚀',
        primaryColor = '#E91E63',
        secondaryColor = '#9C27B0'
    } = route.params || {};

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const floatAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 40,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, {
                    toValue: -15,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(floatAnim, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const { user } = useAuth();
    const [submitting, setSubmitting] = React.useState(false);

    const handleNotify = async () => {
        if (!user?.email) {
            AlertEmitter.show({
                type: 'error',
                title: 'Sign In Required',
                message: 'Please sign in to receive notifications about new features.'
            });
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('https://slotb.in/api_home.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'notify_me',
                    email: user.email,
                    feature: title
                })
            });
            const data = await res.json();
            if (data.status === 'ok') {
                AlertEmitter.show({
                    type: 'success',
                    title: 'Interest Recorded!',
                    message: data.message || 'We will notify you once this feature is live.'
                });
            } else {
                throw new Error(data.message || 'Something went wrong');
            }
        } catch (e: any) {
            AlertEmitter.show({
                type: 'error',
                title: 'Request Failed',
                message: e.message || 'Could not save your request. Please try again.'
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View style={s.root}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <LinearGradient
                colors={['#0F172A', '#1E293B']}
                style={StyleSheet.absoluteFill}
            />

            {/* Background Decorative Elements */}
            <View style={[s.decorCircle, { top: -50, right: -50, width: 220, height: 220, backgroundColor: primaryColor + '20' }]} />
            <View style={[s.decorCircle, { bottom: -80, left: -80, width: 300, height: 300, backgroundColor: secondaryColor + '15' }]} />

            {/* Header */}
            <View style={[s.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity
                    style={s.backBtn}
                    onPress={() => navigation.goBack()}
                >
                    <ChevronLeft size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={s.content}>
                <Animated.View style={[
                    s.emojiBox,
                    {
                        transform: [{ translateY: floatAnim }],
                        shadowColor: primaryColor,
                    }
                ]}>
                    <Text style={s.emojiText}>{emoji}</Text>
                </Animated.View>

                <Animated.View style={[
                    s.textBox,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }
                ]}>
                    <View style={s.badge}>
                        <Sparkles size={14} color={primaryColor} />
                        <Text style={[s.badgeText, { color: primaryColor }]}>STAY TUNED</Text>
                    </View>

                    <Text style={s.title}>{title}</Text>
                    <Text style={s.sub}>{subtitle}</Text>
                </Animated.View>

                <Animated.View style={[
                    s.footer,
                    { opacity: fadeAnim }
                ]}>
                    <TouchableOpacity
                        style={[s.notifyBtn, { backgroundColor: primaryColor }, submitting && { opacity: 0.7 }]}
                        activeOpacity={0.8}
                        onPress={handleNotify}
                        disabled={submitting}
                    >
                        <BellRing size={20} color="#fff" strokeWidth={2.5} />
                        <Text style={s.notifyText}>{submitting ? 'Saving...' : 'Notify Me'}</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1 },
    header: {
        paddingHorizontal: 20,
        zIndex: 10,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        gap: 24,
    },
    emojiBox: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.15)',
        elevation: 20,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
    },
    emojiText: { fontSize: 60 },
    textBox: { alignItems: 'center', gap: 12 },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    badgeText: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },
    title: {
        fontSize: 36,
        fontWeight: '900',
        color: '#fff',
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    sub: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        lineHeight: 24,
        fontWeight: '500',
    },
    footer: {
        marginTop: 10,
        width: '100%',
    },
    notifyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 18,
        borderRadius: 20,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    notifyText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 0.5,
    },
    decorCircle: {
        position: 'absolute',
        borderRadius: 999,
    }
});
