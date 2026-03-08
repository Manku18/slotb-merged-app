import { SlotBShadows } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
    Animated,
    LayoutAnimation,
    Linking,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { GlassCard } from '../ui/GlassCard';
import { TOKEN_COLORS } from './token.constants';
import { Token } from './token.types';

if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface TokenCardProps {
    token: Token;
    onUpdateStatus: (id: string, status: Token['status']) => void;
    onPressCard?: (token: Token) => void;
}

export function TokenCard({ token, onUpdateStatus, onPressCard }: TokenCardProps) {
    const { colors, isDarkMode } = useTheme();
    const [showCallModal, setShowCallModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const swipeableRef = useRef<Swipeable>(null);

    const isServing = token.status === 'serving';
    const isCancelled = token.status === 'cancelled' || token.status === 'no-show';
    const isCompleted = token.status === 'completed';

    const handleCall = () => {
        const phoneNumber = `tel:${token.mobileNumber || ''}`;
        Linking.openURL(phoneNumber).catch((err) =>
            console.error('Error opening dialer', err)
        );

        setTimeout(() => {
            setShowCallModal(true);
        }, 500);
    };

    const handleCustomerResponse = (isComing: boolean) => {
        setShowCallModal(false);
        if (!isComing) {
            onUpdateStatus(token.id, 'cancelled');
        }
    };

    // --- SWIPE ACTIONS ---

    // Left Action (Done) - Swipe Left->Right
    const renderLeftActions = (progress: any, dragX: any) => {
        if (isCompleted || isCancelled) return null;

        const trans = dragX.interpolate({
            inputRange: [0, 100],
            outputRange: [-100, 0],
            extrapolate: 'clamp',
        });

        return (
            <View style={styles.leftActionContainer}>
                <Animated.View style={[styles.leftAction, { transform: [{ translateX: trans }] }]}>
                    <Ionicons name="checkmark-done-circle" size={32} color="#FFF" />
                    <Text style={styles.actionText}>Done</Text>
                </Animated.View>
            </View>
        );
    };

    // Right Action (Re-queue) - Swipe Right->Left
    const renderRightActions = (progress: any, dragX: any) => {
        if (isCompleted || isCancelled) return null;

        const trans = dragX.interpolate({
            inputRange: [-100, 0],
            outputRange: [0, 100],
            extrapolate: 'clamp',
        });

        return (
            <View style={styles.rightActionContainer}>
                <Animated.View style={[styles.rightAction, { transform: [{ translateX: trans }] }]}>
                    <Ionicons name="time" size={32} color="#FFF" />
                    <Text style={styles.actionText}>Wait more</Text>
                </Animated.View>
            </View>
        );
    };

    const onSwipeableOpen = (direction: 'left' | 'right') => {
        // Left means Left->Right swipe (Done)
        if (direction === 'left') {
            onUpdateStatus(token.id, 'completed');
            swipeableRef.current?.close();
        }
        // Right means Right->Left swipe (Re-queue)
        else if (direction === 'right') {
            // Send to Waiting
            onUpdateStatus(token.id, 'waiting');
            swipeableRef.current?.close();
        }
    };

    // --- RENDER ---

    // 1. Completed / Cancelled
    if (isCompleted || isCancelled) {
        const statusColor = isCompleted ? TOKEN_COLORS.completed : TOKEN_COLORS.cancelled;
        const bgColor = isDarkMode ? '#1E1E1E' : (isCompleted ? '#F3F4F6' : '#FEF2F2');

        return (
            <TouchableOpacity onPress={() => onPressCard?.(token)} activeOpacity={0.8}>
                <View style={[styles.historyContainer, { backgroundColor: bgColor, borderLeftColor: statusColor }]}>
                    <View style={styles.historyLeft}>
                        <Text style={[styles.historyToken, { color: statusColor }]}>#{token.tokenNumber}</Text>
                        <Text style={[styles.historyName, { color: colors.textPrimary }]}>{token.customerName}</Text>
                    </View>
                    <Text style={[styles.historyStatus, { color: statusColor }]}>{token.status.toUpperCase()}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    // 2. Active Card
    return (
        <Swipeable
            ref={swipeableRef}
            renderRightActions={renderRightActions}
            renderLeftActions={renderLeftActions}
            onSwipeableOpen={onSwipeableOpen}
            overshootRight={false}
            overshootLeft={false}
        >
            <TouchableOpacity activeOpacity={0.95} onPress={() => onPressCard?.(token)}>
                <GlassCard
                    style={[
                        styles.card,
                        { backgroundColor: colors.surface },
                        isServing && {
                            borderColor: TOKEN_COLORS.serving,
                            borderWidth: 2,
                            // Semi-transparent bg for serving in dark mode
                            backgroundColor: isDarkMode ? '#05966915' : '#F0FDF4'
                        },
                    ]}
                >
                    {/* Main Content Body */}
                    <View style={styles.cardBody}>
                        {/* Left: Token Number */}
                        <View style={styles.leftColumn}>
                            <Text style={[styles.tokenSymbol, { color: colors.textSecondary }]}>#</Text>
                            <Text style={[styles.tokenNumber, { color: colors.textPrimary }]}>{token.tokenNumber}</Text>
                        </View>

                        {/* Right: Info */}
                        <View style={styles.rightColumn}>
                            <View style={styles.infoRow}>
                                <Text style={[styles.customerName, { color: colors.textPrimary }]} numberOfLines={1}>{token.customerName}</Text>
                                <View style={[styles.timeContainer, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }]}>
                                    <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
                                    <Text style={[styles.timeText, { color: colors.textSecondary }]}>{token.time}</Text>
                                </View>
                            </View>
                            <Text style={[styles.serviceText, { color: colors.textSecondary }]} numberOfLines={1}>{token.service}</Text>
                        </View>
                    </View>

                    {/* Separated Action Buttons Row */}
                    <View style={styles.actionRowContainer}>
                        {isServing ? (
                            // Serving State Actions
                            <>
                                {/* Done Button (Full Width) */}
                                <TouchableOpacity
                                    style={[
                                        styles.actionBtnBase,
                                        styles.primaryBtn,
                                        { backgroundColor: TOKEN_COLORS.serving, flex: 1 }
                                    ]}
                                    onPress={() => onUpdateStatus(token.id, 'completed')}
                                >
                                    <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                                    <Text style={styles.btnTextInverse}>Done</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            // Waiting State Actions
                            <>
                                {/* Start Button (Modified Shape) */}
                                <TouchableOpacity
                                    style={[
                                        styles.actionBtnBase,
                                        styles.primaryBtn,
                                        { backgroundColor: TOKEN_COLORS.serving, flex: 2 }
                                    ]}
                                    onPress={() => {
                                        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                                        onUpdateStatus(token.id, 'serving');
                                    }}
                                >
                                    <Ionicons name="play" size={24} color="#FFF" />
                                    <Text style={styles.btnTextInverse}>Start</Text>
                                </TouchableOpacity>

                                {/* Call Button */}
                                <TouchableOpacity
                                    style={[
                                        styles.actionBtnBase,
                                        { backgroundColor: isDarkMode ? '#1E3A8A' : '#EFF6FF', flex: 1 }
                                    ]}
                                    onPress={handleCall}
                                >
                                    <Ionicons name="call" size={22} color={TOKEN_COLORS.CALL_BTN_BLUE} />
                                    <Text style={[styles.btnText, { color: TOKEN_COLORS.CALL_BTN_BLUE }]}>Call</Text>
                                </TouchableOpacity>

                                {/* Cancel Button */}
                                <TouchableOpacity
                                    style={[
                                        styles.actionBtnBase,
                                        { backgroundColor: isDarkMode ? '#7F1D1D' : '#FEF2F2', flex: 1 }
                                    ]}
                                    onPress={() => setShowCancelModal(true)}
                                >
                                    <Ionicons name="close-circle" size={22} color={TOKEN_COLORS.cancelled} />
                                    <Text style={[styles.btnText, { color: TOKEN_COLORS.cancelled }]}>Cancel</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </GlassCard>
            </TouchableOpacity>

            {/* Modal */}
            <Modal visible={showCallModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Is Customer Coming?</Text>
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: isDarkMode ? '#7F1D1D20' : '#FEF2F2' }]}
                                onPress={() => handleCustomerResponse(false)}
                            >
                                <Text style={[styles.modalBtnText, { color: TOKEN_COLORS.cancelled }]}>No (Cancel)</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: TOKEN_COLORS.serving }]}
                                onPress={() => handleCustomerResponse(true)}
                            >
                                <Text style={[styles.modalBtnText, { color: '#FFF' }]}>Yes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Cancel Confirmation Modal */}
            <Modal visible={showCancelModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Cancel Token?</Text>
                        <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                            Are you sure you want to cancel {token.customerName}'s token? This cannot be undone.
                        </Text>
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}
                                onPress={() => setShowCancelModal(false)}
                            >
                                <Text style={[styles.modalBtnText, { color: colors.textPrimary }]}>No, Keep</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: isDarkMode ? '#7F1D1D20' : '#FEF2F2' }]}
                                onPress={() => {
                                    onUpdateStatus(token.id, 'cancelled');
                                    setShowCancelModal(false);
                                }}
                            >
                                <Text style={[styles.modalBtnText, { color: TOKEN_COLORS.cancelled }]}>Yes, Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </Swipeable >
    );
}

// Styling improvements for detached buttons
const styles = StyleSheet.create({
    // Swipe Styles
    leftActionContainer: {
        flex: 1,
        backgroundColor: TOKEN_COLORS.serving,
        justifyContent: 'center',
        marginBottom: 12,
        borderRadius: 20, // Match Card Radius
        marginLeft: 0, // Removed negative margin hack
        paddingLeft: 20,
        marginRight: 0,
    },
    leftAction: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 10 },
    rightActionContainer: {
        flex: 1,
        backgroundColor: TOKEN_COLORS.REQUEUE,
        justifyContent: 'center',
        alignItems: 'flex-end',
        marginBottom: 12,
        borderRadius: 20, // Match Card Radius
        marginRight: 0, // Removed negative margin hack
        paddingRight: 20,
        marginLeft: 0,
    },
    rightAction: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingRight: 10 },
    actionText: { color: '#FFF', fontWeight: '700', fontSize: 16 },

    // Card
    card: {
        padding: 0,
        marginBottom: 12,
        overflow: 'hidden',
        borderRadius: 20, // Slightly more rounded card
        ...SlotBShadows.card,
    },
    cardBody: {
        flexDirection: 'row',
        padding: 16,
        gap: 16,
        alignItems: 'center',
    },
    // Left/Right Columns (same as before)
    leftColumn: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        minWidth: 60,
        justifyContent: 'center',
    },
    rightColumn: {
        flex: 1,
        justifyContent: 'center',
        gap: 4,
    },
    tokenSymbol: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: 4,
        marginRight: 2,
        opacity: 0.5,
    },
    tokenNumber: {
        fontSize: 36,
        fontWeight: '800',
        lineHeight: 42,
        letterSpacing: -1,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    customerName: {
        fontSize: 18,
        fontWeight: '700',
        flex: 1,
        marginRight: 8,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    timeText: { fontSize: 11, fontWeight: '600' },
    serviceText: {
        fontSize: 14,
        fontWeight: '500',
        opacity: 0.7,
    },

    // New Action Row: Detached Buttons style
    actionRowContainer: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        paddingBottom: 12, // Bottom padding for detached look
        gap: 8,
    },
    actionBtnBase: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        height: 50,
        borderRadius: 12, // Standard rounding for buttons (approx 5% of card width)
    },
    primaryBtn: {
        borderRadius: 12, // User requested ~5% radius, not full capsule
        elevation: 2,
        shadowColor: '#059669',
        shadowOpacity: 0.3,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    btnText: { fontSize: 14, fontWeight: '700' },
    btnTextInverse: { fontSize: 15, fontWeight: '800', color: '#FFF' }, // Slightly bolder for primary

    // History
    historyContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 18,
        marginBottom: 8,
        borderRadius: 12,
        borderLeftWidth: 4,
    },
    historyLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    historyToken: { fontSize: 14, fontWeight: '800' },
    historyName: { fontSize: 14, fontWeight: '700' },
    historyStatus: { fontSize: 11, fontWeight: '800' },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        padding: 24,
        borderRadius: 20,
        alignItems: 'center',
        ...SlotBShadows.card,
    },
    modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
    modalSubtitle: { fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
    modalActions: { flexDirection: 'row', gap: 16, width: '100%' },
    modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    modalBtnText: { fontWeight: '700', fontSize: 15 },
});
