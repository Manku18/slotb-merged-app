import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
// BlurView removed - package missing
import React, { useEffect } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, Dimensions, Platform } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withDelay,
    withSequence,
    withTiming
} from 'react-native-reanimated';

interface ComingSoonModalProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    gradient?: readonly [string, string, ...string[]];
}

const { width } = Dimensions.get('window');

export function ComingSoonModal({
    visible,
    onClose,
    title = "Coming Soon 🚀",
    message = "We're building something powerful for you. Courses and SlotB Shop are launching soon!",
    icon = "rocket",
    gradient = ['#064e3b', '#10b981'] // Dark Green to Emerald
}: ComingSoonModalProps) {
    const { colors } = useTheme();

    // Animations
    const scale = useSharedValue(0.8);
    const opacity = useSharedValue(0);
    const rotate = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            opacity.value = withTiming(1, { duration: 300 });
            scale.value = withSpring(1, { damping: 12 });
            rotate.value = withSequence(
                withDelay(300, withTiming(-5, { duration: 150 })),
                withTiming(5, { duration: 150 }),
                withTiming(-5, { duration: 150 }),
                withTiming(0, { duration: 150 })
            );
        } else {
            opacity.value = withTiming(0, { duration: 200 });
            scale.value = withTiming(0.8, { duration: 200 });
        }
    }, [visible]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value
    }));

    const iconStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotate.value}deg` }]
    }));

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Animated.View style={[
                    styles.card,
                    { backgroundColor: colors.surface }, // Use surface color
                    animatedStyle
                ]}>
                    <LinearGradient
                        colors={gradient}
                        style={styles.headerGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        {/* Decorative Circles */}
                        <View style={[styles.circle, { top: -20, right: -20, opacity: 0.15 }]} />
                        <View style={[styles.circle, { bottom: -30, left: -20, opacity: 0.1 }]} />

                        <Animated.View style={[styles.iconContainer, iconStyle]}>
                            <Ionicons name={icon} size={38} color="#FFF" />
                        </Animated.View>
                    </LinearGradient>

                    <View style={styles.content}>
                        <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>We're building something powerful</Text>

                        <Text style={[styles.message, { color: colors.textTertiary }]}>
                            {message}
                        </Text>

                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={onClose}
                            style={styles.buttonWrapper}
                        >
                            <LinearGradient
                                colors={gradient} // Use the passed gradient for button too
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.button}
                            >
                                <Text style={styles.buttonText}>Notify Me</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <Text style={[styles.footerText, { color: colors.textTertiary }]}>SlotB Exclusive Feature</Text>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)', // Darker overlay
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    card: {
        width: '100%',
        maxWidth: 320,
        borderRadius: 24,
        overflow: 'hidden',
        // Shadow is handled by platform/elevation
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    headerGradient: {
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    circle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#FFF',
        position: 'absolute',
    },
    iconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        padding: 24,
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 4,
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 16,
        textAlign: 'center',
        letterSpacing: 0,
        textTransform: 'uppercase',
        opacity: 0.7,
    },
    message: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
        opacity: 0.9,
    },
    buttonWrapper: {
        width: '100%',
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        marginBottom: 16,
    },
    button: {
        width: '100%',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    footerText: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        opacity: 0.6
    }
});
