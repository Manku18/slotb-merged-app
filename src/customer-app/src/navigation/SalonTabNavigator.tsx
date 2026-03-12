/**
 * SalonTabNavigator.tsx
 * Bottom tabs for the Salon section:
 *   Home* | My Bookings | Salon Home | Scan QR | Profile
 *   (* tapping Home switches back to HomeTabNavigator)
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, CalendarCheck, Scissors, QrCode, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import MyBookingsScreen from '../screens/MyBookingsScreen';
import SalonScreen from '../screens/SalonScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { ACTIVE_COLOR, INACTIVE_COLOR, TAB_BAR_STYLE, SALON_ACTIVE_WRAP, SALON_IDLE_WRAP } from './navConfig';

// ─── Placeholder screens (My Bookings, Scan QR) ───────────────────────────────
const Placeholder = ({ icon: Icon, label, sub }: { icon: any; label: string; sub: string }) => (
    <View style={ph.root}>
        <Icon size={38} color={ACTIVE_COLOR} strokeWidth={1.5} />
        <Text style={ph.title}>{label}</Text>
        <Text style={ph.sub}>{sub}</Text>
    </View>
);
const ScanQRScreen = () => (
    <Placeholder icon={QrCode} label="Scan QR" sub="Scan a slot QR code to check in" />
);
const ph = StyleSheet.create({
    root: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F6F7FA', gap: 10 },
    title: { fontSize: 18, fontWeight: '800', color: '#1A1A2E' },
    sub: { fontSize: 13, color: '#9CA3AF', fontWeight: '500' },
});

const s = StyleSheet.create({
    pillOuter: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(243, 244, 246, 0.5)',
        marginTop: -32,
    },
    pillOuterActive: {
        borderColor: 'rgba(233, 30, 99, 0.2)',
        shadowColor: ACTIVE_COLOR,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 15,
    },
    pillWrap: {
        width: 62,
        height: 62,
        borderRadius: 31,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fff',
        elevation: 8,
    },
});

// ─── Navigator ────────────────────────────────────────────────────────────────
const Tab = createBottomTabNavigator() as any;

export default function SalonTabNavigator() {
    return (
        <Tab.Navigator
            initialRouteName="ScanQR"
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: ACTIVE_COLOR,
                tabBarInactiveTintColor: INACTIVE_COLOR,
                tabBarShowLabel: false,
                tabBarStyle: TAB_BAR_STYLE,
            }}
        >
            {/* 1 — Home (tapping jumps back to HomeApp) */}
            <Tab.Screen
                name="HomeTab"
                component={SalonScreen}          // never rendered — listener hijacks tap
                listeners={({ navigation }: any) => ({
                    tabPress: (e: any) => {
                        e.preventDefault();
                        navigation.navigate('HomeApp');
                    },
                })}
                options={{
                    tabBarIcon: ({ color, focused }: any) => (
                        <Home
                            color={color} size={24}
                            strokeWidth={focused ? 2.5 : 1.8}
                            fill={focused ? '#FFF0F3' : 'transparent'}
                        />
                    ),
                }}
            />

            {/* 2 — My Bookings */}
            <Tab.Screen
                name="MyBookings"
                component={MyBookingsScreen}
                options={{
                    tabBarIcon: ({ color, focused }: any) => (
                        <CalendarCheck color={color} size={24} strokeWidth={focused ? 2.5 : 1.8} />
                    ),
                }}
            />

            {/* 3 — Scan QR (centre pill — active by default) */}
            <Tab.Screen
                name="ScanQR"
                component={ScanQRScreen}
                options={{
                    tabBarIcon: ({ focused }: any) => (
                        <View style={[s.pillOuter, focused && s.pillOuterActive]}>
                            <LinearGradient
                                colors={focused ? ['#FF4B81', '#E91E63'] : ['#FFFFFF', '#F3F4F6']}
                                style={s.pillWrap}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <QrCode
                                    color={focused ? '#fff' : INACTIVE_COLOR}
                                    size={30} strokeWidth={focused ? 2.8 : 1.8}
                                />
                            </LinearGradient>
                        </View>
                    ),
                }}
            />

            {/* 4 — Salon Home */}
            <Tab.Screen
                name="SalonHome"
                component={SalonScreen}
                options={{
                    tabBarIcon: ({ color, focused }: any) => (
                        <Scissors color={color} size={24} strokeWidth={focused ? 2.5 : 1.8} />
                    ),
                }}
            />

            {/* 5 — Profile */}
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color, focused }: any) => (
                        <User
                            color={color} size={24}
                            strokeWidth={focused ? 2.5 : 1.8}
                            fill={focused ? '#FFF0F3' : 'transparent'}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}
