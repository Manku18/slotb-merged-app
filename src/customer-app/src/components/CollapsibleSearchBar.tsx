import React, { useState } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { Search, QrCode } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import UniversalSearchModal from './UniversalSearchModal';

const SCROLL_DISTANCE = 110;

type Props = {
    scrollY: Animated.Value;
};

export default function CollapsibleSearchBar({ scrollY }: Props) {
    const navigation = useNavigation<any>();
    const [searchVisible, setSearchVisible] = useState(false);

    // Height: 52 → 44
    const barHeight = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE],
        outputRange: [52, 44],
        extrapolate: 'clamp',
    });

    // Border radius: 16 → 22
    const borderRadius = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE],
        outputRange: [16, 22],
        extrapolate: 'clamp',
    });

    // Shadow opacity: subtle → medium
    const shadowOpacity = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE],
        outputRange: [0.06, 0.14],
        extrapolate: 'clamp',
    });

    // Elevation: 2 → 5
    const elevation = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE],
        outputRange: [2, 5],
        extrapolate: 'clamp',
    });

    return (
        <View style={styles.wrapper}>
            <Animated.View
                style={[
                    styles.bar,
                    {
                        height: barHeight,
                        borderRadius,
                        shadowOpacity,
                        elevation,
                    },
                ]}
            >
                <Pressable
                    style={styles.innerRow}
                    android_ripple={{ color: '#E8ECF0' }}
                    onPress={() => setSearchVisible(true)}
                >
                    <Search size={18} color="#9CA3AF" strokeWidth={2} />
                    <Text style={styles.placeholder} numberOfLines={1}>
                        Search salons, services…
                    </Text>
                    <View style={styles.rightIcons}>
                        <Pressable
                            style={styles.iconBtn}
                            hitSlop={12}
                            onPress={() => navigation.navigate('ScanQR')}
                        >
                            <QrCode size={18} color="#6B7280" strokeWidth={1.8} />
                        </Pressable>
                    </View>
                </Pressable>
            </Animated.View>

            <UniversalSearchModal
                visible={searchVisible}
                onClose={() => setSearchVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        paddingHorizontal: 16,
    },
    bar: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E8ECF0',
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 8,
        overflow: 'hidden',
    },
    innerRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        gap: 10,
    },
    placeholder: {
        flex: 1,
        fontSize: 14,
        color: '#9CA3AF',
        fontWeight: '400',
    },
    rightIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    iconBtn: {
        width: 34,
        height: 34,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },
    divider: {
        width: 1,
        height: 18,
        backgroundColor: '#E5E7EB',
    },
});
