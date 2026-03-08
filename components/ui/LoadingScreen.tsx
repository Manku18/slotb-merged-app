import React from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const LOGO = require('@/src/customer-app/assets/slotblogo.png');

export default function LoadingScreen() {
    return (
        <View style={styles.container}>
            <Image
                source={LOGO}
                style={styles.logo}
                resizeMode="contain"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000',
    },
    logo: {
        width: width * 0.5,
        height: (width * 0.5) * (80 / 220),
    }
});
