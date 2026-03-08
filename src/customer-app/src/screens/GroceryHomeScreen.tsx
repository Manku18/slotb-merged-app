import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

// ─── Coming Soon Screen ────────────────────────────────────────────────────────
export default function GroceryHomeScreen() {
    const insets = useSafeAreaInsets();
    return (
        <View style={cs.root}>
            <View style={{ height: insets.top, backgroundColor: '#022C22' }} />
            <LinearGradient
                colors={['#022C22', '#064E3B', '#065F46']}
                style={cs.header}
            >
                <Text style={cs.headerTitle}>SlotB Groceries</Text>
            </LinearGradient>
            <View style={cs.body}>
                <Text style={cs.emoji}>🛒</Text>
                <Text style={cs.title}>Coming Soon</Text>
                <Text style={cs.sub}>{"Fresh picks near you!\nGrocery ordering will be live shortly."}</Text>
                <View style={cs.badge}>
                    <Text style={cs.badgeText}>Fruits · Vegetables · Daily Needs</Text>
                </View>
            </View>
        </View>
    );
}

const cs = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F0FDF8' },
    header: { paddingHorizontal: 20, paddingVertical: 18, alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '900', color: '#34D399', letterSpacing: 0.3 },
    body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 14 },
    emoji: { fontSize: 64, marginBottom: 8 },
    title: { fontSize: 32, fontWeight: '900', color: '#064E3B', letterSpacing: 0.5 },
    sub: { fontSize: 15, color: '#6B7280', fontWeight: '500', textAlign: 'center', lineHeight: 22 },
    badge: {
        marginTop: 8, paddingHorizontal: 18, paddingVertical: 9,
        backgroundColor: '#D1FAE5', borderRadius: 999,
        borderWidth: 1, borderColor: '#6EE7B7',
    },
    badgeText: { fontSize: 12, fontWeight: '700', color: '#065F46' },
});

// ─────────────────────────────────────────────────────────────────────────────
// ORIGINAL GROCERY HOME SCREEN CODE — preserved below, commented out (Coming Soon)
// ─────────────────────────────────────────────────────────────────────────────

// import React, { useRef } from 'react';
// import { View, Text, StyleSheet, Pressable, Dimensions, Animated } from 'react-native';
// import { Apple, Carrot, ShoppingBag } from 'lucide-react-native';
// import SectionHeader from '../components/SectionHeader';
//
// const { width: W } = Dimensions.get('window');
// const CARD_W = (W - 48 - 12) / 2;
//
// const ITEMS = [
//     { label: 'Fruits', Icon: Apple },
//     { label: 'Vegetables', Icon: Carrot },
//     { label: 'Daily Needs', Icon: ShoppingBag },
// ];
//
// export default function GroceryHomeScreen() {
//     const scrollY = useRef(new Animated.Value(0)).current;
//     return (
//         <View style={styles.root}>
//             <SectionHeader title="Groceries" scrollY={scrollY} searchPlaceholder="Search groceries..." accentColor="#34D399" gradientColors={['#022C22', '#064E3B', '#065F46']} />
//             <Animated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 200, paddingBottom: 40 }}
//                 onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })} scrollEventThrottle={16}>
//                 <View style={styles.grid}>
//                     {ITEMS.map(s => (
//                         <Pressable key={s.label} style={styles.card} android_ripple={{ color: '#E5E7EB' }}>
//                             <s.Icon size={24} color="#374151" strokeWidth={1.6} />
//                             <Text style={styles.cardLabel}>{s.label}</Text>
//                         </Pressable>
//                     ))}
//                 </View>
//             </Animated.ScrollView>
//         </View>
//     );
// }
//
// const styles = StyleSheet.create({
//     root: { flex: 1, backgroundColor: '#F9FAFB' },
//     grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingTop: 16, gap: 12 },
//     card: { width: CARD_W, backgroundColor: '#fff', borderRadius: 16, padding: 20, gap: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
//     cardLabel: { fontSize: 14, fontWeight: '600', color: '#374151' },
// });
