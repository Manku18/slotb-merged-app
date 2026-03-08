import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

// ─── Coming Soon Screen ────────────────────────────────────────────────────────
export default function DoctorHomeScreen() {
    const insets = useSafeAreaInsets();
    return (
        <View style={cs.root}>
            <View style={{ height: insets.top, backgroundColor: '#042F2E' }} />
            <LinearGradient
                colors={['#042F2E', '#0F766E', '#14B8A6']}
                style={cs.header}
            >
                <Text style={cs.headerTitle}>SlotB Medical</Text>
            </LinearGradient>
            <View style={cs.body}>
                <Text style={cs.emoji}>🩺</Text>
                <Text style={cs.title}>Coming Soon</Text>
                <Text style={cs.sub}>{"Your health, our priority!\nDoctor & clinic booking will be live shortly."}</Text>
                <View style={cs.badge}>
                    <Text style={cs.badgeText}>Walk-in · Online Consult · Verified Doctors</Text>
                </View>
            </View>
        </View>
    );
}

const cs = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F0FDFA' },
    header: { paddingHorizontal: 20, paddingVertical: 18, alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '900', color: '#5EEAD4', letterSpacing: 0.3 },
    body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 14 },
    emoji: { fontSize: 64, marginBottom: 8 },
    title: { fontSize: 32, fontWeight: '900', color: '#042F2E', letterSpacing: 0.5 },
    sub: { fontSize: 15, color: '#6B7280', fontWeight: '500', textAlign: 'center', lineHeight: 22 },
    badge: {
        marginTop: 8, paddingHorizontal: 18, paddingVertical: 9,
        backgroundColor: '#CCFBF1', borderRadius: 999,
        borderWidth: 1, borderColor: '#5EEAD4',
    },
    badgeText: { fontSize: 12, fontWeight: '700', color: '#134E4A' },
});

// ─────────────────────────────────────────────────────────────────────────────
// ORIGINAL DOCTOR HOME SCREEN CODE — preserved below, commented out (Coming Soon)
// ─────────────────────────────────────────────────────────────────────────────

// import React, { useRef } from 'react';
// import { View, Text, StyleSheet, Pressable, Dimensions, Animated } from 'react-native';
// import { CalendarCheck, MapPin, Video } from 'lucide-react-native';
// import SectionHeader from '../components/SectionHeader';
//
// const { width: W } = Dimensions.get('window');
// const CARD_W = (W - 48 - 12) / 2;
//
// const ITEMS = [
//     { label: 'Book Appointment', Icon: CalendarCheck },
//     { label: 'Nearby Clinics', Icon: MapPin },
//     { label: 'Online Consult', Icon: Video },
// ];
//
// export default function DoctorHomeScreen() {
//     const scrollY = useRef(new Animated.Value(0)).current;
//     return (
//         <View style={styles.root}>
//             <SectionHeader title="Doctor" scrollY={scrollY} searchPlaceholder="Search doctors, clinics..." accentColor="#14B8A6" gradientColors={['#042F2E', '#0F766E', '#14B8A6']} />
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
