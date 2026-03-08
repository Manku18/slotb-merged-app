import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DashboardCard } from './DashboardCard';
import { ComingSoonModal } from '../ui/ComingSoonModal';

export function SalonManagementTools() {
    const { colors } = useTheme();
    const [modalVisible, setModalVisible] = React.useState(false);
    const [modalContent, setModalContent] = React.useState({ title: '', message: '', icon: '', color: '' });

    const handlePress = (item: any) => {
        setModalContent({
            title: item.title,
            message: `${item.title} feature is currently under development. Stay tuned!`,
            icon: item.icon,
            color: item.color
        });
        setModalVisible(true);
    };

    const tools = [
        {
            id: 'staff',
            title: 'Manage Team',
            subtitle: 'Attendance, shifts & performance',
            icon: 'people-circle-outline',
            color: '#8B5CF6',
            action: () => handlePress({ title: 'Manage Team', icon: 'people', color: '#8B5CF6' })
        },
        {
            id: 'timings',
            title: 'Shop Schedule',
            subtitle: 'Set opening hours & holidays',
            icon: 'time-outline',
            color: '#EC4899',
            action: () => handlePress({ title: 'Shop Schedule', icon: 'time', color: '#EC4899' })
        },
        {
            id: 'customers',
            title: 'Customer List',
            subtitle: 'View history & send offers',
            icon: 'happy-outline',
            color: '#06B6D4',
            action: () => handlePress({ title: 'Customer List', icon: 'people-circle', color: '#06B6D4' })
        }
    ];

    return (
        <>
            <DashboardCard
                title="Salon Management"
                icon="briefcase-outline"
            >
                <View style={styles.container}>
                    {tools.map((item, index) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.item, index !== tools.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}
                            onPress={item.action}
                        >
                            <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
                                <Ionicons name={item.icon as any} size={22} color={item.color} />
                            </View>
                            <View style={styles.content}>
                                <Text style={[styles.title, { color: colors.textPrimary }]}>{item.title}</Text>
                                <Text style={[styles.subtitle, { color: colors.textTertiary }]}>{item.subtitle}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                        </TouchableOpacity>
                    ))}
                </View>
            </DashboardCard>

            <ComingSoonModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                title={modalContent.title}
                message={modalContent.message}
                icon={modalContent.icon as any}
                gradient={['#4F46E5', '#818CF8']} // Default or passed gradient
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 4,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
    },
    iconBox: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    content: {
        flex: 1,
        marginRight: 12,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 12,
    }
});
