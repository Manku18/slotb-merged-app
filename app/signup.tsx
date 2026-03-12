import { authService } from '@/services/api';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/useAppStore';
import { useAuth } from '@/src/customer-app/src/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Alert,
    ActivityIndicator,
    StatusBar,
    Animated,
    Image,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('screen');
const LOGO = require('@/src/customer-app/assets/slotblogo.png');
const MASCOT_CUSTOMER = require('@/src/customer-app/assets/mascot_customer.png');
const MASCOT_PARTNER = require('@/src/customer-app/assets/mascot_partner.png');

export default function SignupScreen() {
    const router = useRouter();
    const { login: partnerLogin } = useAppStore();
    const { signup: customerSignup } = useAuth();
    const { colors } = useTheme();

    const [userType, setUserType] = useState<'customer' | 'partner'>('customer');
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [otp, setOtp] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;
    const mascotFade = useRef(new Animated.Value(1)).current;
    const mascotScale = useRef(new Animated.Value(1)).current;
    const mascotMoveX = useRef(new Animated.Value(0)).current;
    const floatAnim = useRef(new Animated.Value(0)).current;

    const [formData, setFormData] = useState({
        // Shared & Customer
        name: '',
        email: '',
        password: '',
        // Partner Specific
        shop_name: '',
        owner_name: '',
        phone: '',
        address: '',
        district: '',
        pincode: '',
        latitude: '',
        longitude: ''
    });

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
    }, [currentStep, userType]);

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

    useEffect(() => {
        if (userType === 'partner') {
            (async () => {
                try {
                    let { status } = await Location.requestForegroundPermissionsAsync();
                    if (status !== 'granted') return;
                    let location = await Location.getCurrentPositionAsync({});
                    setFormData(prev => ({
                        ...prev,
                        latitude: location.coords.latitude.toString(),
                        longitude: location.coords.longitude.toString()
                    }));
                } catch (e) { }
            })();
        }
    }, [userType]);

    const handleChange = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const { sendSignupOtp, verifyOtpAndSignup } = useAuth();

    const handleCustomerNext = async () => {
        if (!formData.name || !formData.email || !formData.password) {
            Alert.alert('Missing Info', 'Please fill in all fields.');
            return;
        }
        setLoading(true);
        try {
            const success = await sendSignupOtp(formData.email);
            if (success) {
                setCurrentStep(2);
            }
        } catch (e) {
            Alert.alert('Error', 'Failed to send verification code.');
        } finally {
            setLoading(false);
        }
    };

    const handleCustomerFinal = async () => {
        if (!otp || otp.length < 6) {
            Alert.alert('Invalid OTP', 'Enter the 6-digit code.');
            return;
        }
        setLoading(true);
        try {
            const success = await verifyOtpAndSignup(formData.name, formData.email, formData.password, otp);
            if (success) {
                router.replace('/(customer-tabs)');
            }
        } catch (e) {
            Alert.alert('Error', 'Verification failed.');
        } finally {
            setLoading(false);
        }
    };

    const handlePartnerNext = async () => {
        if (currentStep === 1) {
            if (!formData.email || !formData.phone || !formData.password) {
                Alert.alert('Missing Info', 'Please fill in credentials.');
                return;
            }
            setCurrentStep(2);
        } else if (currentStep === 2) {
            if (!formData.shop_name || !formData.owner_name || !formData.pincode) {
                Alert.alert('Missing Info', 'Please fill in shop details.');
                return;
            }
            setLoading(true);
            try {
                const res = await authService.sendSignupOTP(formData.email);
                if (res.status === 'success') {
                    setCurrentStep(3);
                } else {
                    Alert.alert('Error', res.message || 'Failed to send OTP.');
                }
            } catch (err) {
                Alert.alert('Error', 'Network error.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handlePartnerFinal = async () => {
        if (!otp || otp.length < 6) {
            Alert.alert('Invalid OTP', 'Enter the 6-digit code.');
            return;
        }
        setLoading(true);
        try {
            const response = await authService.verifyOtpAndSignup({
                ...formData,
                otp: otp,
                district_id: '1'
            });
            if (response.status === 'success' && response.data) {
                const user = response.data;
                const authKey = `ak_${user.id}_${Date.now().toString(36)}`;
                partnerLogin({
                    id: user.id.toString(),
                    name: user.owner_name,
                    shopName: user.shop_name,
                    email: user.email,
                    phone: user.phone,
                    qrCode: user.qr_code,
                    upiId: user.upi_id || '',
                }, authKey);
                router.replace('/(tabs)');
            } else {
                Alert.alert('Error', response.message || 'Verification failed.');
            }
        } catch (e) {
            Alert.alert('Error', 'Request failed.');
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (key: string, placeholder: string, secure = false, keyboard: any = 'default', multiline = false) => (
        <View style={styles.inputWrapper}>
            <TextInput
                style={[styles.input, { flex: 1 }, multiline && { height: 80, textAlignVertical: 'top' }]}
                placeholder={placeholder}
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={key === 'otp' ? otp : (formData as any)[key]}
                onChangeText={v => key === 'otp' ? setOtp(v) : handleChange(key, v)}
                secureTextEntry={secure && !showPassword}
                keyboardType={keyboard}
                multiline={multiline}
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
                                <Text style={styles.welcomeText}>Create Account</Text>
                                <Text style={styles.subText}>Join the SlotB community</Text>
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

                            <View style={styles.toggleWrapper}>
                                <View style={styles.toggleContainer}>
                                    <TouchableOpacity
                                        style={[styles.toggleBtn, userType === 'customer' && styles.toggleActive]}
                                        onPress={() => { setUserType('customer'); setCurrentStep(1); }}
                                    >
                                        <Text style={[styles.toggleBtnText, userType === 'customer' && styles.toggleBtnTextActive]}>CUSTOMER</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.toggleBtn, userType === 'partner' && styles.toggleActive]}
                                        onPress={() => { setUserType('partner'); setCurrentStep(1); }}
                                    >
                                        <Text style={[styles.toggleBtnText, userType === 'partner' && styles.toggleBtnTextActive]}>PARTNER</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {userType === 'customer' ? (
                                <View style={styles.form}>
                                    {currentStep === 1 && (
                                        <>
                                            {renderInput('name', 'Full Name')}
                                            {renderInput('email', 'Email Address', false, 'email-address')}
                                            {renderInput('password', 'Password', true)}

                                            <View style={styles.buttonGlow}>
                                                <TouchableOpacity style={styles.primaryBtn} onPress={handleCustomerNext} disabled={loading}>
                                                    {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.primaryBtnText}>Continue</Text>}
                                                </TouchableOpacity>
                                            </View>
                                        </>
                                    )}
                                    {currentStep === 2 && (
                                        <>
                                            <Text style={styles.otpInfo}>Verification code sent to {formData.email}</Text>
                                            {renderInput('otp', 'Enter 6-Digit OTP', false, 'numeric')}
                                            <TouchableOpacity style={styles.primaryBtn} onPress={handleCustomerFinal} disabled={loading}>
                                                {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.primaryBtnText}>Verify & Sign Up</Text>}
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => setCurrentStep(1)} style={{ alignSelf: 'center', marginTop: 15 }}>
                                                <Text style={{ color: 'rgba(255,255,255,0.5)' }}>Change Details</Text>
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </View>
                            ) : (
                                <View style={styles.form}>
                                    {currentStep === 1 && (
                                        <>
                                            {renderInput('email', 'Email Address', false, 'email-address')}
                                            {renderInput('phone', 'Mobile Number', false, 'phone-pad')}
                                            {renderInput('password', 'Password', true)}
                                            <TouchableOpacity style={styles.primaryBtn} onPress={handlePartnerNext}>
                                                <Text style={styles.primaryBtnText}>Next: Shop Details</Text>
                                            </TouchableOpacity>
                                        </>
                                    )}
                                    {currentStep === 2 && (
                                        <>
                                            {renderInput('shop_name', 'Shop Name')}
                                            {renderInput('owner_name', 'Owner Name')}
                                            {renderInput('address', 'Full Address', false, 'default', true)}
                                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                                <View style={{ flex: 1 }}>{renderInput('district', 'District')}</View>
                                                <View style={{ flex: 1 }}>{renderInput('pincode', 'Pincode', false, 'numeric')}</View>
                                            </View>
                                            <TouchableOpacity style={styles.primaryBtn} onPress={handlePartnerNext} disabled={loading}>
                                                {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.primaryBtnText}>Send OTP</Text>}
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => setCurrentStep(1)} style={{ alignSelf: 'center', marginTop: 15 }}>
                                                <Text style={{ color: 'rgba(255,255,255,0.5)' }}>Back to Credentials</Text>
                                            </TouchableOpacity>
                                        </>
                                    )}
                                    {currentStep === 3 && (
                                        <>
                                            <Text style={styles.otpInfo}>OTP sent to {formData.email}</Text>
                                            {renderInput('otp', 'Enter 6-Digit OTP', false, 'numeric')}
                                            <TouchableOpacity style={styles.primaryBtn} onPress={handlePartnerFinal} disabled={loading}>
                                                {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.primaryBtnText}>Verify & Sign Up</Text>}
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => setCurrentStep(2)} style={{ alignSelf: 'center', marginTop: 15 }}>
                                                <Text style={{ color: 'rgba(255,255,255,0.5)' }}>Back to Shop Details</Text>
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </View>
                            )}

                            <TouchableOpacity style={styles.footerLink} onPress={() => router.push('/login')}>
                                <Text style={styles.footerText}>Already have an account? <Text style={{ color: '#00ffff', fontWeight: 'bold' }}>Login</Text></Text>
                            </TouchableOpacity>

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
    otpInfo: { color: '#00ffff', textAlign: 'center', marginBottom: 10, fontSize: 14, fontWeight: '600' },
    footerLink: { marginTop: 24, alignSelf: 'center' },
    footerText: { color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: '500' }
});
