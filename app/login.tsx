import { authService } from '@/services/api';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/useAppStore';
import { useAuth } from '@/src/customer-app/src/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Dimensions,
  Image,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('screen');
const LOGO = require('@/src/customer-app/assets/slotblogo.png');
const MASCOT_CUSTOMER = require('@/src/customer-app/assets/mascot_customer.png');
const MASCOT_PARTNER = require('@/src/customer-app/assets/mascot_partner.png');

export default function LoginScreen() {
  const router = useRouter();
  const { login: partnerLogin, setReviews } = useAppStore();
  const { login: customerLogin } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<'customer' | 'partner'>('customer');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const mascotFade = useRef(new Animated.Value(1)).current;
  const mascotScale = useRef(new Animated.Value(1)).current;
  const mascotMoveX = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
    ]).start();

    // Subtle Float Animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 2000, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

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
        toValue: width * 0.22, // Shifting further right within the container
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
  }, [userType]);

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert("Missing Details", "Please enter your details.");
      return;
    }

    setLoading(true);

    try {
      if (userType === 'partner') {
        const response = await authService.login(identifier, password);
        if (response.status === 'success') {
          const shop = response.data;
          const reviews = response.reviews || [];
          const authKey = `ak_${shop.id}_${Date.now().toString(36)}`;
          setReviews(reviews);
          partnerLogin({
            id: shop.id.toString(),
            name: shop.owner_name,
            shopName: shop.shop_name,
            qrCode: shop.qr_code,
            upiId: shop.upi_id,
          }, authKey);
          router.replace('/(tabs)');
        } else {
          Alert.alert("Login Failed", response.message || "Invalid credentials");
        }
      } else {
        const success = await customerLogin(identifier, password);
        if (success) {
          router.replace('/(customer-tabs)');
        }
      }
    } catch (error) {
      console.error("Login Error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

              {/* Logo Section */}
              <View style={styles.logoContainer}>
                <Image source={LOGO} style={styles.logo} resizeMode="contain" />
              </View>

              {/* Welcome Text */}
              <View style={styles.header}>
                <Text style={styles.welcomeText}>Welcome!</Text>
                <Text style={styles.subText}>Log in to continue</Text>
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

              {/* Role Toggle */}
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

              {/* Input Fields */}
              <View style={styles.form}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder={userType === 'customer' ? "Email Address" : "Mobile / Email"}
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={identifier}
                    onChangeText={setIdentifier}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Password"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="rgba(255,255,255,0.6)" />
                  </TouchableOpacity>
                </View>

                <View style={styles.row}>
                  <TouchableOpacity
                    style={styles.rememberRow}
                    onPress={() => setRememberMe(!rememberMe)}
                  >
                    <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                      {rememberMe && <Ionicons name="checkmark" size={12} color="#000" />}
                    </View>
                    <Text style={styles.rememberText}>Remember me</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => router.push('/forgot-password')}>
                    <Text style={styles.forgotText}>Forgot password?</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Login Button */}
              <View style={styles.buttonGlow}>
                <TouchableOpacity
                  style={styles.loginBtn}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.9}
                >
                  {loading ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <Text style={styles.loginBtnText}>Log In</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Sign Up Link */}
              <TouchableOpacity
                style={styles.signupLink}
                onPress={() => router.push('/signup')}
              >
                <Text style={styles.signupText}>Don't have an account? <Text style={{ color: '#00ffff', fontWeight: 'bold' }}>Sign Up</Text></Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View >
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#010d0f' },
  scroll: { flexGrow: 1, justifyContent: 'center' },
  glowBlob: { position: 'absolute', borderRadius: 2000 },
  content: { paddingHorizontal: 32, paddingBottom: 30, paddingTop: 30 },
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
  form: { gap: 12, marginBottom: 20 },
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
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
  rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: '#fff', borderColor: '#fff' },
  rememberText: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },
  forgotText: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '500' },
  buttonGlow: {
    marginTop: 24,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  loginBtn: {
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnText: { fontSize: 16, fontWeight: '700', color: '#010d0f', letterSpacing: 0.5 },
  signupLink: { marginTop: 24, alignSelf: 'center' },
  signupText: { color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: '500' }
});
