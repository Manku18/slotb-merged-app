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

// ─── Navigator ────────────────────────────────────────────────────────────────
const Tab = createBottomTabNavigator() as any;

export default function SalonTabNavigator() {
    return (
        <Tab.Navigator
            initialRouteName="SalonHome"
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

            {/* 3 — Salon Home (centre pill — active by default) */}
            <Tab.Screen
                name="SalonHome"
                component={SalonScreen}
                options={{
                    tabBarIcon: ({ focused }: any) => (
                        <View style={focused ? SALON_ACTIVE_WRAP : SALON_IDLE_WRAP}>
                            <Scissors
                                color={focused ? '#fff' : INACTIVE_COLOR}
                                size={22} strokeWidth={focused ? 2.5 : 1.8}
                            />
                        </View>
                    ),
                }}
            />

            {/* 4 — Scan QR */}
            <Tab.Screen
                name="ScanQR"
                component={ScanQRScreen}
                options={{
                    tabBarIcon: ({ color, focused }: any) => (
                        <QrCode color={color} size={24} strokeWidth={focused ? 2.5 : 1.8} />
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
