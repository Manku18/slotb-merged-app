import React, { useEffect, useRef } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export type AlertType = 'error' | 'success' | 'info' | 'warning';

interface CustomAlertProps {
    visible: boolean;
    type?: AlertType;
    title: string;
    message?: string;
    buttonText?: string;
    onClose: () => void;
}

const TYPE_CONFIG = {
    error: {
        grad: ['#FF416C', '#FF4B2B'] as [string, string],
        emoji: '✕',
        emojiColor: '#fff',
    },
    success: {
        grad: ['#11998e', '#38ef7d'] as [string, string],
        emoji: '✓',
        emojiColor: '#fff',
    },
    info: {
        grad: ['#2193b0', '#6dd5ed'] as [string, string],
        emoji: 'ℹ',
        emojiColor: '#fff',
    },
    warning: {
        grad: ['#F7971E', '#FFD200'] as [string, string],
        emoji: '!',
        emojiColor: '#fff',
    },
};

export default function CustomAlert({
    visible,
    type = 'error',
    title,
    message,
    buttonText = 'OK',
    onClose,
}: CustomAlertProps) {
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 80,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(scaleAnim, {
                    toValue: 0.8,
                    duration: 160,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 160,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const cfg = TYPE_CONFIG[type];

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <Animated.View style={[st.overlay, { opacity: opacityAnim }]}>
                <TouchableOpacity
                    style={st.backdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />
                <Animated.View
                    style={[
                        st.card,
                        { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
                    ]}
                >
                    {/* Icon circle with gradient */}
                    <View style={st.iconWrap}>
                        <LinearGradient
                            colors={cfg.grad}
                            style={st.iconCircle}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Text style={[st.iconText, { color: cfg.emojiColor }]}>
                                {cfg.emoji}
                            </Text>
                        </LinearGradient>
                    </View>

                    {/* Title */}
                    <Text style={st.title}>{title}</Text>

                    {/* Message */}
                    {!!message && (
                        <Text style={st.message}>{message}</Text>
                    )}

                    {/* Button */}
                    <TouchableOpacity
                        style={st.btnWrap}
                        onPress={onClose}
                        activeOpacity={0.8}
                        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                    >
                        <LinearGradient
                            colors={cfg.grad}
                            style={st.btn}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={st.btnText}>{buttonText}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}

const st = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.52)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    card: {
        width: width - 64,
        backgroundColor: '#FFFFFF',
        borderRadius: 28,
        paddingTop: 36,
        paddingBottom: 28,
        paddingHorizontal: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.22,
        shadowRadius: 32,
        elevation: 20,
    },
    iconWrap: {
        marginBottom: 20,
    },
    iconCircle: {
        width: 68,
        height: 68,
        borderRadius: 34,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconText: {
        fontSize: 28,
        fontWeight: '900',
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: '#0F172A',
        textAlign: 'center',
        marginBottom: 10,
        letterSpacing: 0.2,
        lineHeight: 26,
    },
    message: {
        fontSize: 14,
        fontWeight: '500',
        color: '#475569',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 8,
    },
    btnWrap: {
        marginTop: 22,
        borderRadius: 999,
        overflow: 'hidden',
        width: '100%',
        shadowColor: '#FF416C',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.28,
        shadowRadius: 10,
        elevation: 6,
    },
    btn: {
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 999,
    },
    btnText: {
        fontSize: 15,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 0.4,
    },
});
