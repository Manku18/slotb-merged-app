import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/useAppStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function NotificationSettingsScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { settings, updateSettings } = useAppStore();

    const renderToggle = (label: string, value: boolean, onToggle: (val: boolean) => void, desc?: string) => (
        <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <View style={{ flex: 1, paddingRight: 16 }}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>{label}</Text>
                {desc && <Text style={[styles.desc, { color: colors.textTertiary }]}>{desc}</Text>}
            </View>
            <Switch
                value={value}
                onValueChange={onToggle}
                trackColor={{ false: '#767577', true: colors.primary }}
                thumbColor={'#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
            />
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={colors.background === '#000' ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Notification Settings</Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                <Text style={[styles.sectionTitle, { color: colors.primary }]}>Preferences</Text>
                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                    {renderToggle(
                        "Vibration on Booking",
                        settings.vibrateOnBooking,
                        (v) => updateSettings({ vibrateOnBooking: v }),
                        "Vibrate phone when a new booking arrives."
                    )}

                    {renderToggle(
                        "Booking Notifications",
                        settings.notifyTokens,
                        (v) => updateSettings({ notifyTokens: v }),
                        "Receive alerts for booking updates."
                    )}

                    {renderToggle(
                        "Shop Alerts & System",
                        settings.notifyAlerts,
                        (v) => updateSettings({ notifyAlerts: v }),
                        "Receive updates about shop status and system alerts."
                    )}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        paddingTop: Platform.OS === 'android' ? 40 : 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    iconBtn: {
        padding: 4,
    },
    content: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 8,
        marginTop: 8,
        textTransform: 'uppercase',
        opacity: 0.8,
    },
    section: {
        borderRadius: 16,
        paddingHorizontal: 16,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    desc: {
        fontSize: 12,
        lineHeight: 16,
    }
});
