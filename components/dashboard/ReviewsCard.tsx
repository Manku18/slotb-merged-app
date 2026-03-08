import { useTheme } from '@/hooks/useTheme';
import { apiService } from '@/services/api';
import { useAppStore } from '@/store/useAppStore';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { DashboardCard } from './DashboardCard';

interface ReviewsCardProps {
    onRefresh?: () => void;
}

export function ReviewsCard({ onRefresh }: ReviewsCardProps) {
    const { colors } = useTheme();
    const { reviews_data } = useAppStore(); // Use store data directly
    const [modalVisible, setModalVisible] = useState(false);

    // Reply State
    const [replyingToId, setReplyingToId] = useState<number | null>(null);
    const [replyText, setReplyText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Derived State
    const reviews = useMemo(() => {
        if (!Array.isArray(reviews_data)) return [];
        return reviews_data.map(r => ({
            ...r,
            display_text: r.review_text || r.text || r.message || 'No comment provided'
        }));
    }, [reviews_data, reviews_data?.length]);

    const totalReviews = reviews.length;
    const averageRating = useMemo(() => {
        if (totalReviews === 0) return 0;
        const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
        return (sum / totalReviews).toFixed(1);
    }, [reviews, totalReviews]);

    const handleReplySubmit = async (reviewId: number) => {
        if (!replyText.trim()) {
            Alert.alert('Empty Reply', 'Please write a response before sending.');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await apiService.replyReview(reviewId, replyText);
            if (response.ok) {
                Alert.alert('Success', 'Your reply has been posted!');
                setReplyingToId(null);
                setReplyText('');
                if (onRefresh) onRefresh(); // Refresh data to show new reply
            } else {
                Alert.alert('Error', response.error || 'Failed to post reply.');
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong. Please check your internet connection.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openReplyBox = (review: any) => {
        setReplyingToId(review.id);
        setReplyText(review.reply || ''); // Pre-fill if editing
    };

    // Render Review Item in Modal
    const renderReviewItem = (item: any) => {
        const hasReply = !!(item.reply && item.reply.trim());
        const isReplying = replyingToId === item.id;

        return (
            <View key={item.id} style={[styles.reviewItem, { borderBottomColor: colors.border }]}>
                {/* Review Header */}
                <View style={styles.reviewHeader}>
                    <View style={styles.userInfo}>
                        <Image
                            source={{ uri: `https://api.dicebear.com/7.x/initials/svg?seed=${item.name}&backgroundColor=e2e8f0` }}
                            style={styles.avatar}
                        />
                        <View>
                            <Text style={[styles.userName, { color: colors.textPrimary }]}>{item.name}</Text>
                            <Text style={[styles.reviewDate, { color: colors.textTertiary }]}>
                                {new Date(item.created_at || Date.now()).toLocaleDateString()}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={12} color="#B45309" />
                        <Text style={styles.ratingText}>{item.rating}.0</Text>
                    </View>
                </View>

                {/* Review Text */}
                <Text style={[styles.reviewText, { color: colors.textSecondary }]}>
                    {item.display_text}
                </Text>

                {/* Reply Section */}
                <View style={styles.actionContainer}>
                    {isReplying ? (
                        <View style={[styles.replyBox, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
                            <Text style={[styles.replyLabel, { color: colors.primary }]}>Your Reply:</Text>
                            <TextInput
                                style={[styles.input, { color: colors.textPrimary }]}
                                value={replyText}
                                onChangeText={setReplyText}
                                placeholder="Type your message to the customer..."
                                placeholderTextColor={colors.textTertiary}
                                multiline
                                autoFocus
                            />
                            <View style={styles.replyButtons}>
                                <TouchableOpacity onPress={() => setReplyingToId(null)} style={styles.cancelBtn}>
                                    <Text style={{ color: colors.textTertiary }}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => handleReplySubmit(item.id)}
                                    style={[styles.sendBtn, { backgroundColor: colors.primary }]}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="#FFF" size="small" />
                                    ) : (
                                        <Text style={{ color: '#FFF', fontWeight: '600' }}>Send Reply</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        hasReply ? (
                            <View style={[styles.existingReply, { backgroundColor: '#F0F9FF', borderLeftColor: colors.primary }]}>
                                <View style={styles.replyHeader}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                        <Ionicons name="return-down-forward" size={16} color={colors.primary} />
                                        <Text style={[styles.replyTitle, { color: colors.primary }]}>Response from Shop</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => openReplyBox(item)}>
                                        <Ionicons name="pencil" size={14} color={colors.textTertiary} />
                                    </TouchableOpacity>
                                </View>
                                <Text style={[styles.replyContent, { color: '#334155' }]}>{item.reply}</Text>
                            </View>
                        ) : (
                            <TouchableOpacity onPress={() => openReplyBox(item)} style={styles.replyLink}>
                                <Ionicons name="chatbubble-outline" size={16} color={colors.primary} />
                                <Text style={[styles.replyLinkText, { color: colors.primary }]}>Reply to User</Text>
                            </TouchableOpacity>
                        )
                    )}
                </View>
            </View>
        );
    };

    return (
        <>
            <DashboardCard
                title="Customer Reviews"
                icon="star-outline"
                rightElement={
                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                        <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 13 }}>View All</Text>
                    </TouchableOpacity>
                }
            >
                {/* Summary View */}
                <View style={styles.summaryContainer}>
                    <View style={styles.statsColumn}>
                        <Text style={[styles.bigRating, { color: colors.textPrimary }]}>{averageRating}</Text>
                        <View style={{ flexDirection: 'row', gap: 2 }}>
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Ionicons key={s} name="star" size={14} color={s <= Number(averageRating) ? "#F59E0B" : "#E2E8F0"} />
                            ))}
                        </View>
                        <Text style={[styles.totalReviews, { color: colors.textTertiary }]}>{totalReviews} Reviews</Text>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <View style={styles.recentColumn}>
                        {reviews.length > 0 ? (
                            <>
                                <View style={styles.recentHeader}>
                                    <Image
                                        source={{ uri: `https://api.dicebear.com/7.x/initials/svg?seed=${reviews[0].name}&backgroundColor=e2e8f0` }}
                                        style={styles.miniAvatar}
                                    />
                                    <Text style={[styles.recentName, { color: colors.textPrimary }]} numberOfLines={1}>
                                        {reviews[0].name}
                                    </Text>
                                    <View style={[styles.miniBadge, { backgroundColor: '#FEF3C7' }]}>
                                        <Text style={{ fontSize: 10, fontWeight: '700', color: '#B45309' }}>{reviews[0].rating}★</Text>
                                    </View>
                                </View>
                                <Text style={[styles.recentText, { color: colors.textSecondary }]} numberOfLines={2}>
                                    "{reviews[0].display_text}"
                                </Text>
                            </>
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={{ color: colors.textTertiary, fontSize: 12 }}>No reviews yet.</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* CTA Button */}
                <TouchableOpacity
                    style={[styles.ctaButton, { backgroundColor: colors.surface, borderColor: colors.primary }]}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={[styles.ctaText, { color: colors.primary }]}>Manage Reviews</Text>
                    <Ionicons name="arrow-forward" size={16} color={colors.primary} />
                </TouchableOpacity>
            </DashboardCard>

            {/* Full Screen Modal for Reviews */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={[styles.modalContainer, { backgroundColor: colors.background }]}
                >
                    {/* Modal Header */}
                    <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>All Reviews ({totalReviews})</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    {/* Reviews List */}
                    <ScrollView contentContainerStyle={styles.listContent}>
                        {reviews.length > 0 ? (
                            reviews.map(renderReviewItem)
                        ) : (
                            <View style={styles.modalEmpty}>
                                <Ionicons name="chatbubbles-outline" size={48} color={colors.textTertiary} />
                                <Text style={{ color: colors.textSecondary, marginTop: 12 }}>No reviews found for your shop yet.</Text>
                            </View>
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    summaryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    statsColumn: {
        alignItems: 'center',
        paddingRight: 16,
        minWidth: 80,
    },
    bigRating: {
        fontSize: 32,
        fontWeight: '800',
        lineHeight: 38,
    },
    totalReviews: {
        fontSize: 11,
        marginTop: 4,
    },
    divider: {
        width: 1,
        height: '80%',
        marginRight: 16,
    },
    recentColumn: {
        flex: 1,
        justifyContent: 'center',
    },
    recentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        gap: 8,
    },
    miniAvatar: {
        width: 20,
        height: 20,
        borderRadius: 10,
    },
    recentName: {
        fontSize: 13,
        fontWeight: '600',
        flex: 1,
    },
    miniBadge: {
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 4,
    },
    recentText: {
        fontSize: 12,
        lineHeight: 18,
        fontStyle: 'italic',
    },
    emptyState: {
        paddingVertical: 12,
        justifyContent: 'center',
    },
    ctaButton: {
        marginTop: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
        gap: 8,
    },
    ctaText: {
        fontSize: 13,
        fontWeight: '600',
    },

    // Modal Styles
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    closeBtn: {
        padding: 4,
    },
    listContent: {
        padding: 16,
        paddingBottom: 40,
    },
    modalEmpty: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
    },

    // Review Item Styles
    reviewItem: {
        marginBottom: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    userInfo: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    userName: {
        fontSize: 15,
        fontWeight: '700',
    },
    reviewDate: {
        fontSize: 11,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#B45309',
    },
    reviewText: {
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 12,
    },
    actionContainer: {
        marginTop: 4,
    },
    replyLink: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
        paddingVertical: 4,
    },
    replyLinkText: {
        fontSize: 13,
        fontWeight: '600',
    },
    existingReply: {
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 3,
        marginTop: 8,
    },
    replyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    replyTitle: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    replyContent: {
        fontSize: 13,
        lineHeight: 20,
    },

    // Reply Box Styles
    replyBox: {
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginTop: 8,
    },
    replyLabel: {
        fontSize: 11,
        fontWeight: '700',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    input: {
        minHeight: 80,
        textAlignVertical: 'top',
        fontSize: 14,
        marginBottom: 12,
    },
    replyButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        alignItems: 'center',
    },
    cancelBtn: {
        paddingHorizontal: 12,
    },
    sendBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    }
});
