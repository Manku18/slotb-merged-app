/**
 * TabNavigator.tsx  —  Zero-lag navigation + system nav integration
 *
 * Architecture: ONE Tab.Navigator with ALL screens + custom tab bar.
 * lazy: false → all screens mount at startup → zero switch lag.
 * Custom tab bar renders HOME set or SALON set or GROCERY set based on active route.
 *
 * Home    section routes : Home | Services | Salon | Gym | Profile
 * Salon   section routes : Salon | MyBookings | ScanQR | Profile
 * Grocery section routes : Grocery | GroceryCart | Profile
 * Shared                 : Profile
 *
 * • Hides Android system navigation bar on mount (immersive)
 * • Bottom tab bar uses safe-area insets so it sits ABOVE system nav area
 * • When system nav appears → bottom bar shifts up (via insets.bottom change)
 * • After 3s idle → system nav auto-hides, bottom bar returns
 */
import React, { useEffect } from 'react';
import {
    View, Text, TouchableOpacity,
    StyleSheet, Platform, AppState,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as NavigationBar from 'expo-navigation-bar';
import {
    Home, Wrench, Scissors, Dumbbell,
    User, CalendarCheck, QrCode, ShoppingBag,
} from 'lucide-react-native';

import HomeScreen from '../screens/HomeScreen';
import SalonScreen from '../screens/SalonScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationScreen from '../screens/NotificationScreen';
import GroceryScreen from '../screens/GroceryScreen';
import ServicesScreen from '../screens/ServicesScreen';
import HomeServiceScreen from '../screens/HomeServiceScreen';
import DoctorHomeScreen from '../screens/DoctorHomeScreen';
import GymHomeScreen from '../screens/GymHomeScreen';
import GroceryHomeScreen from '../screens/GroceryHomeScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import ScanQRScreen from '../screens/ScanQRScreen';

// ─── Design tokens ────────────────────────────────────────────────────────────
const ACTIVE = '#E91E63';
const INACTIVE = '#9CA3AF';
const GROCERY_ACTIVE = '#10B981'; // Emerald for grocery tab

// ─── Which routes belong to the Salon section ─────────────────────────────────
const SALON_ROUTES = new Set(['Salon', 'MyBookings', 'ScanQR']);
const GROCERY_ROUTES = new Set(['Grocery']);

// ─── Tab descriptors ──────────────────────────────────────────────────────────
type TabItem = { target: string; Icon: any; label: string; activeColor?: string };

const HOME_ITEMS: TabItem[] = [
    { target: 'Home', Icon: Home, label: 'Home' },
    { target: 'Services', Icon: Wrench, label: 'Services' },
    { target: 'Salon', Icon: Scissors, label: 'Salon' },
    { target: 'Grocery', Icon: ShoppingBag, label: 'Grocery', activeColor: GROCERY_ACTIVE },
    { target: 'Profile', Icon: User, label: 'Profile' },
];

const SALON_ITEMS: TabItem[] = [
    { target: 'Home', Icon: Home, label: 'Home' },
    { target: 'MyBookings', Icon: CalendarCheck, label: 'Bookings' },
    { target: 'Salon', Icon: Scissors, label: 'Salon' },
    { target: 'ScanQR', Icon: QrCode, label: 'Scan QR' },
    { target: 'Profile', Icon: User, label: 'Profile' },
];

const GROCERY_ITEMS: TabItem[] = [
    { target: 'Home', Icon: Home, label: 'Home' },
    { target: 'Grocery', Icon: ShoppingBag, label: 'Grocery', activeColor: GROCERY_ACTIVE },
    { target: 'Profile', Icon: User, label: 'Profile' },
];

// ─── Custom tab bar ────────────────────────────────────────────────────────────
function CustomTabBar({ state, navigation }: any) {
    const insets = useSafeAreaInsets();
    const currentRoute = state.routes[state.index].name;
    const inSalon = SALON_ROUTES.has(currentRoute);
    const inGrocery = GROCERY_ROUTES.has(currentRoute);
    const items = inSalon ? SALON_ITEMS : inGrocery ? GROCERY_ITEMS : HOME_ITEMS;

    // Dynamic bottom padding: when system nav is visible, insets.bottom > 0
    // When hidden (immersive), insets.bottom = 0
    // We add a minimum 6px lift so the bar never sits flush against the screen edge
    const bottomPad = Math.max(insets.bottom, 2);

    return (
        <View style={[s.bar, { paddingBottom: bottomPad }]}>
            {items.map((item, idx) => {
                const isActive = currentRoute === item.target;
                const activeColor = item.activeColor ?? ACTIVE;
                const color = isActive ? activeColor : INACTIVE;
                return (
                    <TouchableOpacity
                        key={idx}
                        onPress={() => navigation.navigate(item.target)}
                        activeOpacity={0.7}
                        style={s.tab}
                    >
                        <item.Icon
                            color={color}
                            size={22}
                            strokeWidth={isActive ? 2.4 : 1.8}
                        />
                        <Text style={[s.label, { color }]}>{item.label}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

// ─── Placeholder screens ──────────────────────────────────────────────────────
const MakePlaceholder = (Icon: any, title: string) => () => (
    <View style={ph.root}>
        <Icon size={38} color={ACTIVE} strokeWidth={1.5} />
        <Text style={ph.title}>{title}</Text>
    </View>
);
const GymScreen = MakePlaceholder(Dumbbell, 'Gym');

const ph = StyleSheet.create({
    root: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F6F7FA', gap: 12 },
    title: { fontSize: 18, fontWeight: '800', color: '#1A1A2E' },
});

// ─── Single Tab Navigator (all screens, no unmount lag) ───────────────────────
const Tab = createBottomTabNavigator() as any;
const Stack = createNativeStackNavigator() as any;

function MainTabs() {
    return (
        <Tab.Navigator
            tabBar={(props: any) => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
                lazy: false,
            }}
        >
            {/* HOME section */}
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Services" component={ServicesScreen} />
            <Tab.Screen name="Gym" component={GymScreen} />

            {/* SALON section */}
            <Tab.Screen name="Salon" component={SalonScreen} />
            <Tab.Screen name="MyBookings" component={MyBookingsScreen} />
            <Tab.Screen name="ScanQR" component={ScanQRScreen} />

            {/* GROCERY section */}
            <Tab.Screen name="Grocery" component={GroceryScreen} />

            {/* SHARED */}
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

// ─── Root stack + system nav control ──────────────────────────────────────────
export default function TabNavigator() {
    useEffect(() => {
        if (Platform.OS !== 'android') return;

        const hideSystemNav = () => {
            NavigationBar.setBackgroundColorAsync('transparent');
            NavigationBar.setPositionAsync('absolute');
            NavigationBar.setBehaviorAsync('overlay-swipe');
            NavigationBar.setVisibilityAsync('hidden');
        };

        // Hide on first mount
        hideSystemNav();

        // Re-hide when app comes back to foreground
        const sub = AppState.addEventListener('change', (state) => {
            if (state === 'active') {
                // Small delay lets the OS finish its transition
                setTimeout(hideSystemNav, 300);
            }
        });

        return () => sub.remove();
    }, []);

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
                name="Notifications"
                component={NotificationScreen}
                options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
                name="HomeServiceScreen"
                component={HomeServiceScreen}
                options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
                name="DoctorHomeScreen"
                component={DoctorHomeScreen}
                options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
                name="GymHomeScreen"
                component={GymHomeScreen}
                options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
                name="GroceryHomeScreen"
                component={GroceryHomeScreen}
                options={{ animation: 'slide_from_right' }}
            />
        </Stack.Navigator>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    bar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 8,
        paddingHorizontal: 4,
        elevation: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.09,
        shadowRadius: 14,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6,
        gap: 3,
    },
    label: {
        fontSize: 10,
        fontWeight: '600',
        marginTop: 2,
    },
});
