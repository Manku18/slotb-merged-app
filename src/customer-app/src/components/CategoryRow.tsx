import React from 'react';
import {
    StyleSheet, ScrollView, Pressable, Animated, Image,
    ImageResizeMode,
} from 'react-native';
// ── PNG icon assets (each image already contains its own label text) ──────────
const ICONS = {
    salon: require('../../assets/icons/salon_parlour.png'),
    homeService: require('../../assets/icons/service.png'),
    medical: require('../../assets/icons/medical.png'),
    gym: require('../../assets/icons/gym.png'),
    groceries: require('../../assets/icons/groceries.png'),
};

const SCROLL_DISTANCE = 110;

type Category = {
    id: string;
    icon: any;
    screen: string;
    isTab?: boolean;
    /** 'contain' = show full image (text visible), 'cover' = fill card (may crop) */
    fit?: ImageResizeMode;
    /** true = 110% scale to crop away thin borders */
    zoom?: boolean;
};

const CATEGORIES: Category[] = [
    { id: 'salon', icon: ICONS.salon, screen: 'Salon', isTab: true, fit: 'contain' },
    { id: 'home-service', icon: ICONS.homeService, screen: 'Services', isTab: true, zoom: true },
    { id: 'medical', icon: ICONS.medical, screen: 'DoctorHomeScreen' },
    { id: 'gym', icon: ICONS.gym, screen: 'Gym', isTab: true, fit: 'contain' },
    { id: 'groceries', icon: ICONS.groceries, screen: 'Grocery', isTab: true },
];

type Props = {
    scrollY: Animated.Value;
    navigation: any;
};

export default function CategoryRow({ scrollY, navigation }: Props) {
    const opacity = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const translateY = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE],
        outputRange: [0, -14],
        extrapolate: 'clamp',
    });

    const handlePress = (cat: Category) => {
        if (cat.id === 'medical') {
            navigation.navigate('coming-soon', {
                title: 'SlotB Medical',
                subtitle: 'Booking nearby hospitals & clinics will be live shortly.',
                emoji: '🩺',
                primaryColor: '#14B8A6',
                secondaryColor: '#042F2E'
            });
        } else if (cat.id === 'gym') {
            navigation.navigate('coming-soon', {
                title: 'SlotB Gym',
                subtitle: 'Gym booking & memberships are arriving soon.',
                emoji: '🏋️',
                primaryColor: '#FFD740',
                secondaryColor: '#1A1A1A'
            });
        } else if (cat.id === 'groceries') {
            navigation.navigate('coming-soon', {
                title: 'SlotB Grocery',
                subtitle: 'Hyperlocal grocery delivery is on its way!',
                emoji: '🛒',
                primaryColor: '#10B981',
                secondaryColor: '#022C22'
            });
        } else if (cat.id === 'home-service') {
            navigation.navigate('coming-soon', {
                title: 'SlotB Home-Service',
                subtitle: 'Electricians, Plumbers & local pros will be available at your doorstep soon!',
                emoji: '🔧',
                primaryColor: '#7C3AFF',
                secondaryColor: '#0A0A1A'
            });
        } else if (cat.isTab) {
            navigation.navigate('Main', { screen: cat.screen });
        } else {
            navigation.navigate(cat.screen);
        }
    };

    return (
        <Animated.View style={[styles.wrapper, { opacity, transform: [{ translateY }] }]}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.row}
            >
                {CATEGORIES.map(cat => (
                    <Pressable
                        key={cat.id}
                        style={styles.card}
                        android_ripple={{ color: 'rgba(0,0,0,0.08)', borderless: false }}
                        onPress={() => handlePress(cat)}
                    >
                        <Image
                            source={cat.icon}
                            style={cat.zoom ? styles.zoomedIcon : styles.icon}
                            resizeMode={cat.fit || 'cover'}
                        />
                    </Pressable>
                ))}
            </ScrollView>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    wrapper: {},
    row: {
        paddingHorizontal: 16,
        gap: 12,
    },
    card: {
        width: 66,
        height: 66,
        borderRadius: 14,
        overflow: 'hidden',
    },
    icon: {
        width: '100%',
        height: '100%',
    },
    zoomedIcon: {
        width: '110%',
        height: '110%',
        marginTop: '-5%',
        marginLeft: '-5%',
    },
});
