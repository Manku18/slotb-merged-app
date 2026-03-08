import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    KeyboardAvoidingView, Platform, ActivityIndicator, Image,
    Dimensions, Keyboard, TouchableWithoutFeedback, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, User, KeyRound, ArrowRight, X } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../constants/Colors';

const { width, height } = Dimensions.get('window');

interface Props {
    onClose?: () => void;
}

export default function AuthScreen({ onClose }: Props) {
    const { login, signup, sendForgotOtp, resetPassword } = useAuth();

    const [mode, setMode] = useState<'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD' | 'RESET_PASSWORD'>('LOGIN');
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handleAction = async () => {
        if (!email) return;
        setIsLoading(true);
        Keyboard.dismiss();

        try {
            if (mode === 'LOGIN') {
                if (!password) { setIsLoading(false); return; }
                const success = await login(email, password);
                if (success && onClose) onClose();
            } else if (mode === 'SIGNUP') {
                if (!name || !password) { setIsLoading(false); return; }
                if (password.length < 6) {
                    Alert.alert("Error", "Password must be at least 6 characters.");
                    setIsLoading(false);
                    return;
                }
                const success = await signup(name, email, password);
                if (success && onClose) onClose();
            } else if (mode === 'FORGOT_PASSWORD') {
                const success = await sendForgotOtp(email);
                if (success) setMode('RESET_PASSWORD');
            } else if (mode === 'RESET_PASSWORD') {
                if (!otp || !newPassword) {
                    Alert.alert("Error", "Please enter OTP and new password.");
                    setIsLoading(false);
                    return;
                }
                const success = await resetPassword(email, otp, newPassword);
                if (success) setMode('LOGIN');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const renderInput = (
        icon: any,
        placeholder: string,
        value: string,
        onChange: (t: string) => void,
        secure = false,
        keyType: 'default' | 'email-address' | 'numeric' = 'default'
    ) => {
        const Icon = icon;
        return (
            <View style={styles.inputContainer}>
                <View style={styles.iconWrap}>
                    <Icon color={Colors.textMuted} size={20} strokeWidth={2} />
                </View>
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor="#9CA3AF"
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry={secure}
                    keyboardType={keyType}
                    autoCapitalize="none"
                />
            </View>
        );
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <LinearGradient
                    colors={['#fdfbfb', '#ebedee']}
                    style={StyleSheet.absoluteFillObject}
                />

                <KeyboardAvoidingView
                    style={{ flex: 1, justifyContent: 'center' }}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <View style={styles.card}>
                        {/* Close button if rendered as modal logic */}
                        {onClose && (
                            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                                <X color={Colors.textLight} size={24} />
                            </TouchableOpacity>
                        )}

                        <View style={styles.header}>
                            <Image
                                source={require('../../assets/slotblogo.png')}
                                style={styles.logoImage}
                                resizeMode="contain"
                            />
                            <Text style={styles.title}>
                                {mode === 'LOGIN' ? 'Welcome Back' :
                                    mode === 'SIGNUP' ? 'Create Account' :
                                        mode === 'FORGOT_PASSWORD' ? 'Forgot Password' : 'Verify OTP'}
                            </Text>
                            <Text style={styles.subtitle}>
                                {mode === 'LOGIN' ? 'Login to continue booking' :
                                    mode === 'SIGNUP' ? 'Join SlotB for exclusive salon deals' :
                                        mode === 'FORGOT_PASSWORD' ? 'Enter your email to receive an OTP' : 'Check your email for the code'}
                            </Text>
                        </View>

                        <View style={styles.formContainer}>
                            {mode === 'SIGNUP' && renderInput(User, 'Full Name', name, setName)}
                            {renderInput(Mail, 'Email Address', email, setEmail, false, 'email-address')}

                            {mode === 'LOGIN' && (
                                <>
                                    {renderInput(Lock, 'Password', password, setPassword, true)}
                                    <TouchableOpacity
                                        style={styles.forgotPassLink}
                                        onPress={() => setMode('FORGOT_PASSWORD')}
                                    >
                                        <Text style={styles.forgotPassText}>Forgot Password?</Text>
                                    </TouchableOpacity>
                                </>
                            )}

                            {mode === 'RESET_PASSWORD' && (
                                <>
                                    {renderInput(KeyRound, 'Enter 6-digit OTP', otp, setOtp, false, 'numeric')}
                                    {renderInput(Lock, 'New Password', newPassword, setNewPassword, true)}
                                </>
                            )}

                            {mode === 'SIGNUP' && renderInput(Lock, 'Password', password, setPassword, true)}

                            <TouchableOpacity
                                style={styles.btnShadow}
                                activeOpacity={0.8}
                                onPress={handleAction}
                                disabled={isLoading}
                            >
                                <LinearGradient
                                    colors={['#fa709a', '#fee140']} // Nice orange-pink theme
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                    style={styles.actionBtn}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <View style={styles.btnRow}>
                                            <Text style={styles.btnText}>
                                                {mode === 'LOGIN' ? 'Login Now' :
                                                    mode === 'SIGNUP' ? 'Sign Up' :
                                                        mode === 'FORGOT_PASSWORD' ? 'Send OTP' : 'Reset Password'}
                                            </Text>
                                            <ArrowRight color="#fff" size={18} strokeWidth={2.5} style={{ marginLeft: 6 }} />
                                        </View>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>
                                {mode === 'LOGIN' ? "Don't have an account? " :
                                    mode === 'SIGNUP' ? 'Already registered? ' : 'Go back to '}
                            </Text>
                            <TouchableOpacity onPress={() => {
                                if (mode === 'FORGOT_PASSWORD' || mode === 'RESET_PASSWORD') setMode('LOGIN');
                                else setMode(mode === 'LOGIN' ? 'SIGNUP' : 'LOGIN');
                            }}>
                                <Text style={styles.linkText}>
                                    {mode === 'LOGIN' ? 'Sign Up' : 'Login'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        marginHorizontal: 24,
        borderRadius: 28,
        padding: 30,
        shadowColor: '#f43f5e',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.1,
        shadowRadius: 30,
        elevation: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.7)',
        position: 'relative'
    },
    closeBtn: {
        position: 'absolute',
        top: 16,
        right: 16,
        padding: 6,
        zIndex: 10
    },
    header: { alignItems: 'center', marginBottom: 32 },
    logoImage: {
        width: width - 80,
        height: (width - 80) * (80 / 220),
        marginBottom: 10
    },
    title: { fontSize: 26, fontWeight: '800', color: Colors.text, marginBottom: 8, letterSpacing: -0.5 },
    subtitle: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', paddingHorizontal: 20 },

    formContainer: { gap: 16 },
    forgotPassLink: {
        alignSelf: 'flex-end',
        marginTop: -8,
        marginBottom: 4
    },
    forgotPassText: {
        color: Colors.primary,
        fontSize: 13,
        fontWeight: '700'
    },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: Colors.surface,
        borderWidth: 1, borderColor: '#E5E7EB',
        borderRadius: 16,
        height: 56,
    },
    iconWrap: {
        width: 50, alignItems: 'center', justifyContent: 'center',
        borderRightWidth: 1, borderRightColor: '#E5E7EB',
        height: '60%'
    },
    input: {
        flex: 1, paddingHorizontal: 16, fontSize: 15,
        color: Colors.text, fontWeight: '500'
    },

    btnShadow: {
        marginTop: 10,
        shadowColor: '#fa709a', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35, shadowRadius: 18, elevation: 6,
    },
    actionBtn: {
        height: 58, borderRadius: 18,
        alignItems: 'center', justifyContent: 'center',
    },
    btnRow: { flexDirection: 'row', alignItems: 'center' },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },

    footer: {
        flexDirection: 'row', justifyContent: 'center',
        marginTop: 32,
    },
    footerText: { color: Colors.textMuted, fontSize: 13, fontWeight: '500' },
    linkText: { color: Colors.primary, fontSize: 13, fontWeight: '800' }
});
