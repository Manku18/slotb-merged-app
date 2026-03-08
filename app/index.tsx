import { useRouter, useRootNavigationState } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { useAuth } from '@/src/customer-app/src/context/AuthContext';
import React, { useEffect } from 'react';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function Index() {
    const partnerAuthKey = useAppStore((state) => state.authKey);
    const isHydrated = useAppStore((state) => state.isHydrated);
    const { user: customerUser, isLoading: customerLoading } = useAuth();
    const router = useRouter();
    const rootNavigationState = useRootNavigationState();

    useEffect(() => {
        // Wait for hydration and navigation state
        if (!isHydrated || customerLoading || !rootNavigationState?.key) return;

        const performNavigation = () => {
            if (partnerAuthKey) {
                router.replace('/(tabs)'); // Partner workflow
            } else if (customerUser) {
                router.replace('/(customer-tabs)'); // Customer workflow
            } else {
                router.replace('/login');
            }
        };

        const timer = setTimeout(performNavigation, 0);
        return () => clearTimeout(timer);

    }, [partnerAuthKey, customerUser, isHydrated, customerLoading, rootNavigationState?.key]);

    return <LoadingScreen />;
}
