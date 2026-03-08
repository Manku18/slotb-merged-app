import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import {
    RankingConfig,
    RankingData,
    RankingPeriod,
    DEFAULT_RANKING_CONFIG,
    PartnerPerformance
} from './rankingTypes';
import { calculateRankingScore } from './rankingUtils';

export const useRanking = (scope: 'global' | 'state' | '15km' | '60km' = '15km') => {
    const { user, stats } = useAppStore();
    const [period, setPeriod] = useState<RankingPeriod>('month');
    const [config, setConfig] = useState<RankingConfig>(DEFAULT_RANKING_CONFIG);
    const [rankingData, setRankingData] = useState<{ leaderboard: RankingData[], myRank: RankingData | null }>({ leaderboard: [], myRank: null });
    const [isLoading, setIsLoading] = useState(false);

    const fetchRanking = async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            // Dynamic require to avoid cycle if any, though likely safe
            const { apiService } = require('@/services/api');
            const data = await apiService.getRanking(user.id, period, scope, {
                // Backend now fetches safe location from DB based on shop_id
                lat: user.latitude || 0,
                lon: user.longitude || 0,
                state: user.state || ''
            });

            if (data) {
                setRankingData({
                    leaderboard: data.leaderboard || [],
                    myRank: data.my_rank || null
                });
            }
        } catch (e) {
            console.error("Failed to load ranking", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRanking();

        const interval = setInterval(fetchRanking, 15000); // 15s polling
        return () => clearInterval(interval);
    }, [user?.id, period, scope]);

    return {
        period,
        setPeriod,
        config,
        setConfig,
        isEligible: true, // Create a logic for logic later if needed
        currentPerformance: rankingData.myRank?.performance || {
            onlineBookings: 0, completedBookings: 0, averageRating: 0, reviewCount: 0, cancellations: 0, noShows: 0
        },
        myRanking: rankingData.myRank,
        leaderboard: rankingData.leaderboard,
        isLoading,
        refetch: fetchRanking
    };
};
