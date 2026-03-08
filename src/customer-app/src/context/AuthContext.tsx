import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AlertEmitter } from '../components/AlertEmitter';

// --- CONFIGURATION ---
// Change this to your actual PHP backend URL. Please upload `api_auth.php` (created in your folder root) to your Hostinger server public_html and change this URL to it!
export const API_URL = 'https://slotb.in/api_auth.php';

// Utility to create Form-urlencoded data the PHP expects
export const createFormData = (params: Record<string, string>) => {
    const data = new URLSearchParams();
    Object.keys(params).forEach(key => data.append(key, params[key]));
    return data.toString();
};

interface User {
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, pass: string) => Promise<boolean>;
    signup: (name: string, email: string, pass: string) => Promise<boolean>;
    sendSignupOtp: (email: string) => Promise<boolean>;
    verifyOtpAndSignup: (name: string, email: string, pass: string, otp: string) => Promise<boolean>;
    logout: () => Promise<void>;
    updateUser: (user: User) => void;
    sendForgotOtp: (email: string) => Promise<boolean>;
    resetPassword: (email: string, otp: string, newPass: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Load stored user session state
        const loadUser = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('@user');
                if (storedUser) setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to load user session", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadUser();
    }, []);

    const login = async (email: string, pass: string) => {
        try {
            const cleanEmail = email.trim().toLowerCase();
            const formData = new FormData();
            formData.append('action', 'login');
            formData.append('email', cleanEmail);
            formData.append('password', pass);

            const res = await fetch(API_URL, {
                method: 'POST',
                body: formData,
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });
            const raw = await res.text();
            console.log('Login Raw:', raw);

            // Extract JSON from output in case PHP dumps HTML headers
            const startIdx = raw.indexOf('{');
            const parsed = JSON.parse(startIdx >= 0 ? raw.substring(startIdx) : raw);

            if (parsed.status === 'ok') {
                const loggedInUser = {
                    name: parsed.user?.name || 'User',
                    email: cleanEmail,
                };
                setUser(loggedInUser);
                await AsyncStorage.setItem('@user', JSON.stringify(loggedInUser));
                return true;
            } else {
                AlertEmitter.show({ type: 'error', title: 'Login Failed', message: parsed.message || 'Invalid credentials. Please check your email and password.' });
                return false;
            }
        } catch (e) {
            console.error("Login Error:", e);
            AlertEmitter.show({ type: 'error', title: 'Network Error', message: 'Could not connect to the server. Please check your internet connection.' });
            return false;
        }
    };

    const signup = async (name: string, email: string, pass: string) => {
        try {
            const cleanEmail = email.trim().toLowerCase();
            const formData = new FormData();
            formData.append('action', 'signup');
            formData.append('name', name);
            formData.append('email', cleanEmail);
            formData.append('password', pass);

            const res = await fetch(API_URL, {
                method: 'POST',
                body: formData,
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });

            const raw = await res.text();
            console.log('Signup Raw:', raw);
            const startIdx = raw.indexOf('{');
            if (startIdx === -1) {
                AlertEmitter.show({ type: 'error', title: 'Server Error', message: 'Could not connect to the server. Please try again later.' });
                return false;
            }
            const parsed = JSON.parse(raw.substring(startIdx));

            if (parsed.status === 'ok') {
                const registeredUser = {
                    name: parsed.user?.name || name,
                    email: cleanEmail,
                };
                setUser(registeredUser);
                await AsyncStorage.setItem('@user', JSON.stringify(registeredUser));
                return true; // Sent successfully
            } else {
                AlertEmitter.show({ type: 'error', title: 'Sign Up Failed', message: parsed.message || 'This email might already be registered. Try logging in instead.' });
                return false;
            }
        } catch (e) {
            console.error(e);
            AlertEmitter.show({ type: 'error', title: 'Network Error', message: 'Could not connect to the server. Please check your internet connection.' });
            return false;
        }
    };

    const sendForgotOtp = async (email: string) => {
        try {
            const formData = new FormData();
            formData.append('action', 'send_forgot_password_otp');
            formData.append('email', email.trim().toLowerCase());

            const res = await fetch(API_URL, {
                method: 'POST',
                body: formData,
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });
            const parsed = await res.json();
            if (parsed.status === 'ok') {
                AlertEmitter.show({ type: 'success', title: 'OTP Sent!', message: 'A verification code has been sent to your email address.' });
                return true;
            } else {
                AlertEmitter.show({ type: 'error', title: 'Failed to Send OTP', message: parsed.message || 'Could not send OTP. Please try again.' });
                return false;
            }
        } catch (e) {
            AlertEmitter.show({ type: 'error', title: 'Network Error', message: 'Could not connect to the server. Please check your internet connection.' });
            return false;
        }
    };

    const resetPassword = async (email: string, otp: string, newPass: string) => {
        try {
            const formData = new FormData();
            formData.append('action', 'verify_otp_reset_password');
            formData.append('email', email.trim().toLowerCase());
            formData.append('otp', otp);
            formData.append('new_password', newPass);

            const res = await fetch(API_URL, {
                method: 'POST',
                body: formData,
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });
            const parsed = await res.json();
            if (parsed.status === 'ok') {
                AlertEmitter.show({ type: 'success', title: 'Password Reset!', message: 'Your password has been reset successfully. Please log in with your new password.' });
                return true;
            } else {
                AlertEmitter.show({ type: 'error', title: 'Reset Failed', message: parsed.message || 'Could not reset your password. Please check the OTP and try again.' });
                return false;
            }
        } catch (e) {
            AlertEmitter.show({ type: 'error', title: 'Network Error', message: 'Could not connect to the server. Please check your internet connection.' });
            return false;
        }
    };

    const sendSignupOtp = async (email: string) => {
        try {
            const formData = new FormData();
            formData.append('action', 'send_signup_otp');
            formData.append('email', email.trim().toLowerCase());

            const res = await fetch(API_URL, {
                method: 'POST',
                body: formData,
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });
            const parsed = await res.json();
            if (parsed.status === 'ok') {
                return true;
            } else {
                AlertEmitter.show({ type: 'error', title: 'OTP Error', message: parsed.message || 'Failed to send OTP. Please try again.' });
                return false;
            }
        } catch (e) {
            AlertEmitter.show({ type: 'error', title: 'Network Error', message: 'Could not connect to the server. Please check your internet connection.' });
            return false;
        }
    };

    const verifyOtpAndSignup = async (name: string, email: string, pass: string, otp: string) => {
        try {
            const cleanEmail = email.trim().toLowerCase();
            const formData = new FormData();
            formData.append('action', 'verify_otp_and_signup');
            formData.append('name', name);
            formData.append('email', cleanEmail);
            formData.append('password', pass);
            formData.append('otp', otp);

            const res = await fetch(API_URL, {
                method: 'POST',
                body: formData,
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });

            const raw = await res.text();
            console.log('Verify Signup Raw:', raw);
            const startIdx = raw.indexOf('{');
            if (startIdx === -1) {
                AlertEmitter.show({ type: 'error', title: 'Server Error', message: 'Invalid server response. Please try again later.' });
                return false;
            }
            const parsed = JSON.parse(raw.substring(startIdx));

            if (parsed.status === 'ok') {
                const registeredUser = {
                    name: parsed.user?.name || name,
                    email: cleanEmail,
                };
                setUser(registeredUser);
                await AsyncStorage.setItem('@user', JSON.stringify(registeredUser));
                return true;
            } else {
                AlertEmitter.show({ type: 'error', title: 'Verification Failed', message: parsed.message || 'Invalid OTP or details. Please check and try again.' });
                return false;
            }
        } catch (e) {
            console.error(e);
            AlertEmitter.show({ type: 'error', title: 'Network Error', message: 'Could not connect to the server. Please check your internet connection.' });
            return false;
        }
    };

    const logout = async () => {
        try {
            const formData = new FormData();
            formData.append('logout', '1');
            await fetch(API_URL + "?logout=1", { method: 'POST' }); // Using the ?logout=1 query from index.php logout flow
        } catch (e) {
            console.error("Logout API call failed", e);
        }
        setUser(null);
        await AsyncStorage.removeItem('@user');
    };

    const updateUser = async (newUser: User) => {
        setUser(newUser);
        await AsyncStorage.setItem('@user', JSON.stringify(newUser));
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, signup, sendSignupOtp, verifyOtpAndSignup, logout, updateUser, sendForgotOtp, resetPassword }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
