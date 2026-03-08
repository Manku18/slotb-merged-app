import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Alert,
    Dimensions,
    ActivityIndicator,
    Platform,
    Animated,
    Easing
} from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { X, Zap, ZapOff, QrCode, Loader2 } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function ScanQRScreen() {
    const navigation = useNavigation<any>();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [torch, setTorch] = useState(false);

    // Animation values
    const scanLineAnim = useRef(new Animated.Value(0)).current;
    const scissorScale = useRef(new Animated.Value(1)).current;
    const scissorRotate = useRef(new Animated.Value(0)).current;

    // Reset state on focus
    useFocusEffect(
        useCallback(() => {
            setScanned(false);
            setProcessing(false);
            startScanLine();
        }, [])
    );

    const startScanLine = () => {
        scanLineAnim.setValue(0);
        Animated.loop(
            Animated.sequence([
                Animated.timing(scanLineAnim, {
                    toValue: 250,
                    duration: 2000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(scanLineAnim, {
                    toValue: 0,
                    duration: 2000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ])
        ).start();
    };

    useEffect(() => {
        if (processing) {
            Animated.loop(
                Animated.parallel([
                    Animated.sequence([
                        Animated.timing(scissorScale, { toValue: 1.2, duration: 600, useNativeDriver: true }),
                        Animated.timing(scissorScale, { toValue: 1, duration: 600, useNativeDriver: true }),
                    ]),
                    Animated.sequence([
                        Animated.timing(scissorRotate, { toValue: 1, duration: 300, useNativeDriver: true }),
                        Animated.timing(scissorRotate, { toValue: -1, duration: 600, useNativeDriver: true }),
                        Animated.timing(scissorRotate, { toValue: 0, duration: 300, useNativeDriver: true }),
                    ])
                ])
            ).start();
        }
    }, [processing]);

    if (!permission) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#E91E63" />
                <Text style={styles.statusText}>Initializing Camera...</Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.center}>
                <View style={styles.iconCircle}>
                    <QrCode size={40} color="#9CA3AF" />
                </View>
                <Text style={styles.errorTitle}>Camera Access Required</Text>
                <Text style={styles.errorSub}>To scan shop QR codes, we need permission to use your camera.</Text>
                <TouchableOpacity style={styles.btn} onPress={requestPermission}>
                    <Text style={styles.btnText}>Allow Camera</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleBarcodeScanned = (result: BarcodeScanningResult) => {
        if (scanned || processing) return;
        setProcessing(true);
        console.log('QR Code Scanned:', result.data);

        // Pattern for slotb: https://slotb.in/salon_home.php?shop_id=54
        setTimeout(() => {
            let shopId = '';
            let gymId = '';
            let groceryId = '';
            let medicalId = '';

            const shopMatch = result.data.match(/[?&]shop_id=(\d+)/);
            const gymMatch = result.data.match(/[?&]gym_id=(\d+)/);
            const groceryMatch = result.data.match(/[?&]grocery_id=(\d+)/);
            const medMatch = result.data.match(/[?&]medical_id=(\d+)/);

            if (shopMatch) shopId = shopMatch[1];
            else if (gymMatch) gymId = gymMatch[1];
            else if (groceryMatch) groceryId = groceryMatch[1];
            else if (medMatch) medicalId = medMatch[1];
            else if (/^\d+$/.test(result.data)) {
                shopId = result.data;
            }

            if (shopId) {
                setScanned(true);
                navigation.navigate('Salon', { scanShopId: shopId });
            } else if (gymId) {
                setScanned(true);
                navigation.navigate('Gym', { scanGymId: gymId });
            } else if (groceryId) {
                setScanned(true);
                navigation.navigate('Grocery', { scanShopId: groceryId });
            } else if (medicalId) {
                setScanned(true);
                navigation.navigate('DoctorHomeScreen', { scanDocId: medicalId });
            } else {
                setProcessing(false);
                Alert.alert(
                    "Invalid QR",
                    "This QR code is not recognized by SlotB.",
                    [{ text: "Scan Again" }]
                );
            }
        }, 500);
    };

    const rotation = scissorRotate.interpolate({
        inputRange: [-1, 1],
        outputRange: ['-15deg', '15deg']
    });

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFillObject}
                onBarcodeScanned={processing ? undefined : handleBarcodeScanned}
                enableTorch={torch}
                barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                }}
            >
                <View style={styles.overlay}>
                    {/* Header Controls */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.closeBtn}
                        >
                            <X color="#fff" size={24} />
                        </TouchableOpacity>

                        <Text style={styles.headerTitle}>Position QR in frame</Text>

                        <TouchableOpacity
                            onPress={() => setTorch(!torch)}
                            style={styles.torchBtn}
                        >
                            {torch ? <Zap color="#FFD700" size={24} fill="#FFD700" /> : <ZapOff color="#fff" size={24} />}
                        </TouchableOpacity>
                    </View>

                    {/* Scanning Area */}
                    <View style={styles.finderContainer}>
                        <View style={styles.finder}>
                            <View style={[styles.corner, styles.topLeft]} />
                            <View style={[styles.corner, styles.topRight]} />
                            <View style={[styles.corner, styles.bottomLeft]} />
                            <View style={[styles.corner, styles.bottomRight]} />

                            {/* Scanning Animation line */}
                            <Animated.View style={[
                                styles.scanLine,
                                { transform: [{ translateY: scanLineAnim }] }
                            ]} />
                        </View>
                        <Text style={styles.tip}>Align QR in frame</Text>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <View style={styles.logoPill}>
                            <QrCode size={16} color="#E91E63" />
                            <Text style={styles.logoText}>SLOTB SMART SCAN</Text>
                        </View>
                    </View>
                </View>

                {/* Processing Overlay */}
                {processing && (
                    <View style={styles.processingOverlay}>
                        <Animated.View style={[
                            styles.loaderContainer,
                            { transform: [{ scale: scissorScale }] }
                        ]}>
                            <View style={styles.loaderCircle}>
                                <Animated.View style={{ transform: [{ rotate: rotation }] }}>
                                    <Loader2 size={48} color="#E91E63" strokeWidth={2.5} />
                                </Animated.View>
                            </View>
                        </Animated.View>
                        <Text style={styles.processingText}>Processing...</Text>
                        <Text style={styles.openingText}>Opening booking modal</Text>
                    </View>
                )}
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F6F7FA', padding: 40 },
    statusText: { marginTop: 15, fontSize: 14, color: '#6B7280', fontWeight: '600' },
    iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    errorTitle: { fontSize: 22, fontWeight: '800', color: '#1A1D26', marginBottom: 10, textAlign: 'center' },
    errorSub: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 30 },
    btn: { backgroundColor: '#E91E63', paddingHorizontal: 30, paddingVertical: 14, borderRadius: 16 },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'space-between' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingHorizontal: 20
    },
    headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
    closeBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
    torchBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },

    finderContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    finder: {
        width: 250,
        height: 250,
        justifyContent: 'flex-start',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    corner: { position: 'absolute', width: 40, height: 40, borderColor: '#E91E63', borderWidth: 4, zIndex: 10 },
    topLeft: { left: 0, top: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 20 },
    topRight: { right: 0, top: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 20 },
    bottomLeft: { left: 0, bottom: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 20 },
    bottomRight: { right: 0, bottom: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 20 },

    scanLine: {
        width: '100%',
        height: 3,
        backgroundColor: '#E91E63',
        shadowColor: '#E91E63',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 15,
        elevation: 10,
    },

    tip: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600', marginTop: 30 },

    footer: { paddingBottom: 50, alignItems: 'center' },
    logoPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 25,
        gap: 8
    },
    logoText: { color: '#1A1D26', fontSize: 12, fontWeight: '900', letterSpacing: 1.2 },

    processingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.85)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100
    },
    loaderContainer: {
        marginBottom: 24,
    },
    loaderCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#E91E63',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 15
    },
    processingText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 8
    },
    openingText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        fontWeight: '500'
    }
});
