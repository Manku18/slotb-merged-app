/**
 * HomeTabNavigator.tsx
 * Bottom tabs for the Home section:
 *   Home | Services | Salon* | Gym | Profile
 *   (* tapping Salon switches to SalonTabNavigator)
 */
import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Wrench, Scissors, Dumbbell, User } from 'lucide-react-native';

import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { ACTIVE_COLOR, INACTIVE_COLOR, TAB_BAR_STYLE, SALON_ACTIVE_WRAP, SALON_IDLE_WRAP } from './navConfig';

// ─── Placeholder screens (Services, Gym) ─────────────────────────────────────
import { View as RNView, Text, StyleSheet } from 'react-native';

const Placeholder = ({ icon: Icon, label }: { icon: any; label: string }) => (
    <RNView style={ph.root}>
        <Icon size={38} color={ACTIVE_COLOR} strokeWidth={1.5} />
        <Text style={ph.title}>{label}</Text>
    </RNView>
);
const ServicesScreen = () => <Placeholder icon={Wrench} label="Services" />;
const GymScreen = () => <Placeholder icon={Dumbbell} label="Gym" />;
const ph = StyleSheet.create({
    root: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F6F7FA', gap: 10 },
    title: { fontSize: 18, fontWeight: '800', color: '#1A1A2E' },
});

// ─── Navigator ────────────────────────────────────────────────────────────────
const Tab = createBottomTabNavigator() as any;

export default function HomeTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: ACTIVE_COLOR,
                tabBarInactiveTintColor: INACTIVE_COLOR,
                tabBarShowLabel: false,
                tabBarStyle: TAB_BAR_STYLE,
            }}
        >
            {/* 1 — Home */}
            <Tab.Screen
                name="Home"
                component={HomeScreen}
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

            {/* 2 — Services */}
            <Tab.Screen
                name="Services"
                component={ServicesScreen}
                options={{
                    tabBarIcon: ({ color, focused }: any) => (
                        <Wrench color={color} size={24} strokeWidth={focused ? 2.5 : 1.8} />
                    ),
                }}
            />

            {/* 3 — Salon (centre pill; tapping jumps to SalonApp) */}
            <Tab.Screen
                name="SalonTab"
                component={HomeScreen}          // never rendered — listener hijacks tap
                listeners={({ navigation }: any) => ({
                    tabPress: (e: any) => {
                        e.preventDefault();
                        navigation.navigate('SalonApp');
                    },
                })}
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

            {/* 4 — Gym */}
            <Tab.Screen
                name="Gym"
                component={GymScreen}
                options={{
                    tabBarIcon: ({ color, focused }: any) => (
                        <Dumbbell color={color} size={24} strokeWidth={focused ? 2.5 : 1.8} />
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
