import { useTheme } from '@/hooks/useTheme';
import { authService } from '@/services/api';
import { useAuth } from '@/src/customer-app/src/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('screen');
const LOGO = require('@/src/customer-app/assets/slotblogo.png');
const MASCOT_CUSTOMER = require('@/src/customer-app/assets/mascot_customer.png');
const MASCOT_PARTNER = require('@/src/customer-app/assets/mascot_partner.png');

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const { sendForgotOtp: customerSendOtp, resetPassword: customerResetPassword } = useAuth();

    const [userType, setUserType] = useState<'customer' | 'partner'>('customer');
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;
    const mascotFade = useRef(new Animated.Value(1)).current;
    const mascotScale = useRef(new Animated.Value(1)).current;
    const mascotMoveX = useRef(new Animated.Value(0)).current;
    const floatAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start();

        // Subtle Float Animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, { toValue: -8, duration: 2000, useNativeDriver: true }),
                Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
            ])
        ).start();
    }, [currentStep]);

    useEffect(() => {
        // Premium Pop, Fade & Move Animation
        mascotScale.setValue(0.9);
        Animated.parallel([
            Animated.timing(mascotFade, { toValue: 0, duration: 150, useNativeDriver: true }),
            Animated.spring(mascotScale, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.spring(mascotMoveX, {
                toValue: width * 0.22,
                friction: 10,
                tension: 50,
                useNativeDriver: true,
            }),
            Animated.timing(mascotFade, {
                toValue: 1,
                duration: 350,
                delay: 100,
                useNativeDriver: true,
            }),
        ]).start();
    }, [userType, currentStep]);

    const handleSendOTP = async () => {
        if (!email || !email.includes('@')) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            return;
        }

        setLoading(true);
        try {
            if (userType === 'partner') {
                const res = await authService.sendForgotPasswordOTP(email);
                if (res.status === 'success') setCurrentStep(2);
                else Alert.alert('Error', res.message || 'Failed to send reset OTP.');
            } else {
                const success = await customerSendOtp(email);
                if (success) setCurrentStep(2);
            }
        } catch (err) {
            Alert.alert('Error', 'Network error.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!otp || otp.length < 6) {
            Alert.alert('Invalid OTP', 'Enter the 6-digit code.');
            return;
        }
        if (!newPassword || newPassword.length < 6) {
            Alert.alert('Weak Password', 'Minimum 6 characters required.');
            return;
        }

        setLoading(true);
        try {
            if (userType === 'partner') {
                const res = await authService.resetPassword({ email, otp, new_password: newPassword });
                if (res.status === 'success') {
                    Alert.alert('Success 🎉', 'Password reset successful!', [
                        { text: 'Login Now', onPress: () => router.replace('/login') }
                    ]);
                } else {
                    Alert.alert('Error', res.message || 'Reset failed.');
                }
            } else {
                const success = await customerResetPassword(email, otp, newPassword);
                if (success) router.replace('/login');
            }
        } catch (err) {
            Alert.alert('Error', 'Request failed.');
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (placeholder: string, value: string, onChange: (v: string) => void, secure = false, keyboard: any = 'default') => (
        <View style={styles.inputWrapper}>
            <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder={placeholder}
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={value}
                onChangeText={onChange}
                secureTextEntry={secure && !showPassword}
                keyboardType={keyboard}
                autoCapitalize="none"
            />
            {secure && (
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Exact Screenshot Aesthetic Background */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: '#010d0f' }]}>
                <LinearGradient
                    colors={['#011417', '#010d0f', '#011417']}
                    style={StyleSheet.absoluteFill}
                />

                <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
                    <Defs>
                        <SvgGradient id="gradTop" x1="0%" y1="0%" x2="100%" y2="100%">
                            <Stop offset="0%" stopColor="#006666" stopOpacity="0.3" />
                            <Stop offset="100%" stopColor="transparent" stopOpacity="0" />
                        </SvgGradient>
                        <SvgGradient id="gradBottom" x1="100%" y1="100%" x2="0%" y2="0%">
                            <Stop offset="0%" stopColor="#014d4d" stopOpacity="0.6" />
                            <Stop offset="100%" stopColor="transparent" stopOpacity="0" />
                        </SvgGradient>
                        <SvgGradient id="gradAccent" x1="0%" y1="100%" x2="100%" y2="0%">
                            <Stop offset="0%" stopColor="#00ffff" stopOpacity="0.1" />
                            <Stop offset="100%" stopColor="transparent" stopOpacity="0" />
                        </SvgGradient>
                    </Defs>

                    {/* Top Primary Wave */}
                    <Path
                        d={`M0 0 L${width} 0 L${width} ${height * 0.35} Q${width * 0.6} ${height * 0.15} 0 ${height * 0.45} Z`}
                        fill="url(#gradTop)"
                    />

                    {/* Top Secondary Glow Wave */}
                    <Path
                        d={`M0 0 L${width * 0.6} 0 Q${width * 0.3} ${height * 0.2} 0 ${height * 0.25} Z`}
                        fill="#00ffff"
                        opacity="0.03"
                    />

                    {/* Bottom Primary Wave - Extended to fill bottom */}
                    <Path
                        d={`M0 ${height} L${width} ${height} L${width} ${height * 0.5} Q${width * 0.4} ${height * 0.8} 0 ${height * 0.6} Z`}
                        fill="url(#gradBottom)"
                    />

                    {/* Bottom Secondary Glow Wave */}
                    <Path
                        d={`M${width * 0.3} ${height} Q${width * 0.7} ${height * 0.9} ${width} ${height * 0.75} L${width} ${height} Z`}
                        fill="url(#gradAccent)"
                    />

                    {/* Extra Fluid Accent Wave */}
                    <Path
                        d={`M0 ${height * 0.7} Q${width * 0.2} ${height * 0.8} ${width * 0.5} ${height} L0 ${height} Z`}
                        fill="#00ffff"
                        opacity="0.05"
                    />
                </Svg>
            </View>

            <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

                            <View style={styles.logoContainer}>
                                <Image source={LOGO} style={styles.logo} resizeMode="contain" />
                            </View>

                            <View style={styles.header}>
                                <Text style={styles.welcomeText}>Forgot Password</Text>
                                <Text style={styles.subText}>Don't worry</Text>
                            </View>

                            {/* Dynamic Mascot Section */}
                            <View style={styles.mascotWrapper}>
                                <Animated.View style={[
                                    styles.mascotSection,
                                    {
                                        opacity: mascotFade,
                                        transform: [
                                            { translateX: mascotMoveX },
                                            { translateY: floatAnim },
                                            { scale: mascotScale }
                                        ]
                                    }
                                ]}>
                                    <Image
                                        source={userType === 'customer' ? MASCOT_CUSTOMER : MASCOT_PARTNER}
                                        style={styles.mascotImage}
                                        resizeMode="contain"
                                    />
                                </Animated.View>
                            </View>

                            {currentStep === 1 && (
                                <View style={styles.toggleWrapper}>
                                    <View style={styles.toggleContainer}>
                                        <TouchableOpacity
                                            style={[styles.toggleBtn, userType === 'customer' && styles.toggleActive]}
                                            onPress={() => setUserType('customer')}
                                        >
                                            <Text style={[styles.toggleBtnText, userType === 'customer' && styles.toggleBtnTextActive]}>CUSTOMER</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.toggleBtn, userType === 'partner' && styles.toggleActive]}
                                            onPress={() => setUserType('partner')}
                                        >
                                            <Text style={[styles.toggleBtnText, userType === 'partner' && styles.toggleBtnTextActive]}>PARTNER</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}

                            <View style={styles.form}>
                                {currentStep === 1 ? (
                                    <>
                                        {renderInput('Email Address', email, setEmail, false, 'email-address')}
                                        <View style={styles.buttonGlow}>
                                            <TouchableOpacity style={styles.primaryBtn} onPress={handleSendOTP} disabled={loading}>
                                                {loading ? <ActivityIndicator color="#002626" /> : <Text style={styles.primaryBtnText}>Send Reset Code</Text>}
                                            </TouchableOpacity>
                                        </View>
                                        <TouchableOpacity onPress={() => router.push('/login')} style={styles.footerLink}>
                                            <Text style={styles.footerText}>Back to <Text style={{ color: '#00ffff', fontWeight: 'bold' }}>Login</Text></Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <>
                                        <Text style={styles.infoText}>Code sent to {email}</Text>
                                        {renderInput('6-Digit Code', otp, setOtp, false, 'numeric')}
                                        {renderInput('New Password', newPassword, setNewPassword, true)}
                                        <View style={styles.buttonGlow}>
                                            <TouchableOpacity style={styles.primaryBtn} onPress={handleResetPassword} disabled={loading}>
                                                {loading ? <ActivityIndicator color="#002626" /> : <Text style={styles.primaryBtnText}>Update Password</Text>}
                                            </TouchableOpacity>
                                        </View>
                                        <TouchableOpacity onPress={() => setCurrentStep(1)} style={{ alignSelf: 'center', marginTop: 15 }}>
                                            <Text style={{ color: 'rgba(255,255,255,0.5)' }}>Back to Recovery</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>

                        </Animated.View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#010d0f' },
    scroll: { flexGrow: 1, justifyContent: 'center' },
    content: { paddingHorizontal: 32, paddingBottom: 30, paddingTop: 30 },
    backBtn: { position: 'absolute', top: 20, left: 20, zIndex: 100 },
    logoContainer: { alignItems: 'center', marginBottom: 8, marginTop: -25 },
    logo: { width: 124, height: 45 },
    header: { marginBottom: 10 },
    mascotWrapper: {
        width: '100%',
        alignItems: 'flex-end',
        paddingRight: 15,
        marginBottom: -12,
    },
    mascotSection: {
        height: 85,
        zIndex: 10,
        width: 85,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mascotImage: { width: 85, height: 85 },
    welcomeText: { fontSize: 36, fontWeight: '700', color: '#fff', letterSpacing: -1 },
    subText: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
    toggleWrapper: { marginBottom: 25, zIndex: 5 },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 30,
        padding: 5,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    toggleBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 25 },
    toggleActive: { backgroundColor: '#fff', elevation: 4, shadowColor: '#fff', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 5 },
    toggleBtnText: { color: 'rgba(255,255,255,0.6)', fontWeight: '700', fontSize: 12, letterSpacing: 1 },
    toggleBtnTextActive: { color: '#010d0f' },
    form: { gap: 12 },
    inputWrapper: {
        height: 54,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 14,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    input: { color: '#fff', fontSize: 16, fontWeight: '400', height: '100%', flex: 1, letterSpacing: 0.2 },
    eyeBtn: { padding: 10 },
    buttonGlow: {
        marginTop: 10,
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
    },
    primaryBtn: {
        height: 50,
        backgroundColor: '#fff',
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryBtnText: { fontSize: 16, fontWeight: '700', color: '#010d0f', letterSpacing: 0.5 },
    infoText: { color: '#00ffff', textAlign: 'center', marginBottom: 10, fontSize: 14, fontWeight: '600' },
    footerLink: { marginTop: 24, alignSelf: 'center' },
    footerText: { color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: '500' }
});
