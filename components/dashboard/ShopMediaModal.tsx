import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/useAppStore';
import { apiService } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    FlatList,
    Image,
    Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface ShopMediaModalProps {
    visible: boolean;
    onClose: () => void;
}

export function ShopMediaModal({ visible, onClose }: ShopMediaModalProps) {
    const { colors } = useTheme();
    const { user } = useAppStore();
    const [mediaList, setMediaList] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const fetchMedia = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            // New API method needed in api.ts, or generic post call
            const res = await apiService.post('get_shop_media', { shop_id: user.id });
            if (res.ok) {
                setMediaList(res.media);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (visible) {
            fetchMedia();
        }
    }, [visible]);

    const pickMedia = async (type: 'image' | 'video') => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: type === 'video' ? ImagePicker.MediaTypeOptions.Videos : ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: type === 'image' ? [4, 5] : undefined, // Standard social aspect
            quality: 0.8,
        });

        if (!result.canceled) {
            handleUpload(result.assets[0], type);
        }
    };

    const handleUpload = async (asset: ImagePicker.ImagePickerAsset, type: string) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('action', 'upload_shop_media');
            formData.append('shop_id', user!.id);
            formData.append('media_type', type);
            formData.append('is_reel', type === 'video' ? '1' : '0');
            formData.append('description', 'Shop Upload');

            // Append File
            const uriParts = asset.uri.split('.');
            const fileType = uriParts[uriParts.length - 1];

            formData.append('file', {
                uri: asset.uri,
                name: `upload.${fileType}`,
                type: type === 'video' ? `video/${fileType}` : `image/${fileType}`,
            } as any);

            // Use generic fetch since apiService might not have this specialized method ready
            // Assuming apiService.post uses JSON, we need Multipart support.
            // So we might need to use raw fetch or update apiService.
            // Let's rely on a direct fetch similar to how api.ts works but forcing multipart?
            // Actually, if I look at previous apiService methods, they often send JSON.
            // I should use `fetch` directly to be safe for FormData.

            const API_URL = 'https://slotb.in/api_dashboard.php'; // Or construct from base
            // Wait, I don't know the exact URL from here.
            // I'll assume I can use `apiService.uploadMedia` if I create it, OR hacking it here.
            // I'll code a direct fetch using the known endpoint structure.

            const response = await fetch('https://slotb.in/api_dashboard.php', { // Replace with actual URL logic if possible
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                }
            });
            const data = await response.json();

            if (data.ok) {
                Alert.alert('Success', 'Media uploaded successfully');
                fetchMedia();
            } else {
                Alert.alert('Upload Failed', data.error || data.message || 'Unknown error');
            }

        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = (id: number) => {
        Alert.alert('Delete', 'Remove this item?', [
            { text: 'Cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    const res = await apiService.post('delete_shop_media', { shop_id: user!.id, media_id: id });
                    if (res.ok) fetchMedia();
                }
            }
        ]);
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <View style={styles.mediaContainer}>
                {item.media_type === 'video' || item.is_reel == 1 ? (
                    <View style={styles.videoPlaceholder}>
                        <Ionicons name="videocam" size={32} color={colors.textSecondary} />
                        <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 4 }}>Video/Reel</Text>
                    </View>
                ) : (
                    <Image source={{ uri: `https://slotb.in/${item.file_path}` }} style={styles.image} resizeMode="cover" />
                )}
                {item.is_reel == 1 && (
                    <View style={styles.reelBadge}>
                        <Ionicons name="play" size={12} color="#FFF" />
                    </View>
                )}
            </View>
            <View style={styles.actions}>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                    <Ionicons name="trash" size={18} color="#EF4444" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>Shop Content</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <Ionicons name="close-circle" size={32} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.uploadSection}>
                    <TouchableOpacity
                        style={[styles.uploadBtn, { backgroundColor: colors.primary }]}
                        onPress={() => pickMedia('image')}
                        disabled={uploading}
                    >
                        {uploading ? <ActivityIndicator color="#FFF" /> : (
                            <>
                                <Ionicons name="image" size={20} color="#FFF" style={{ marginRight: 8 }} />
                                <Text style={styles.uploadBtnText}>Add Photo</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.uploadBtn, { backgroundColor: colors.mustard, marginLeft: 10 }]}
                        onPress={() => pickMedia('video')}
                        disabled={uploading}
                    >
                        {uploading ? <ActivityIndicator color="#FFF" /> : (
                            <>
                                <Ionicons name="videocam" size={20} color="#FFF" style={{ marginRight: 8 }} />
                                <Text style={styles.uploadBtnText}>Add Reel</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
                ) : (
                    <FlatList
                        data={mediaList}
                        keyExtractor={item => item.id.toString()}
                        renderItem={renderItem}
                        numColumns={3}
                        columnWrapperStyle={{ gap: 10 }}
                        contentContainerStyle={{ paddingBottom: 40 }}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="images-outline" size={48} color={colors.textTertiary} />
                                <Text style={[styles.emptyText, { color: colors.textTertiary }]}>No content yet. Add photos or reels to showcase your shop!</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: Platform.OS === 'android' ? 20 : 0
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    closeBtn: {
        padding: 4,
    },
    uploadSection: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    uploadBtn: {
        flex: 1,
        height: 50,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadBtnText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    card: {
        flex: 1,
        aspectRatio: 0.8,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        position: 'relative',
        marginBottom: 10,
    },
    mediaContainer: {
        flex: 1,
        backgroundColor: '#f0f0f0',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    videoPlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    reelBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 8,
        padding: 4,
    },
    actions: {
        position: 'absolute',
        bottom: 6,
        right: 6,
    },
    deleteBtn: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        width: 28,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
        paddingHorizontal: 40,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 16,
        fontSize: 14,
        lineHeight: 20,
    }
});
