import { User } from '@/store/useAppStore';

export type RankingPeriod = 'today' | 'week' | 'month' | 'year';

export interface RankingConfig {
    bookingWeight: number;    // Points per completed online booking
    ratingWeight: number;     // Points per star in average rating
    cancellationPenalty: number; // Points deducted per cancellation
    noShowPenalty: number;    // Points deducted per no-show
    reviewsWeight: number; // Point per review count
    minBookingsForRank: number; // Minimum bookings required to be ranked
}

export interface PartnerPerformance {
    onlineBookings: number;
    completedBookings: number;
    averageRating: number;
    reviewCount: number;
    cancellations: number;
    noShows: number;
}

export interface RankingData {
    partnerId: string;
    score: number;
    rank: number;
    percentile: number; // e.g., Top 10%
    breakdown: {
        bookingScore: number;
        ratingScore: number;
        penaltyScore: number;
    };
    performance: PartnerPerformance;
}

export interface RankingState {
    isEnabled: boolean;
    userPlanEligible: boolean;
    currentPeriod: RankingPeriod;
    config: RankingConfig;
    myRanking: RankingData | null;
    leaderboard: RankingData[]; // Top 5 or 10 for preview
}

export const DEFAULT_RANKING_CONFIG: RankingConfig = {
    bookingWeight: 10,
    ratingWeight: 1, // 1 point per star total
    cancellationPenalty: 5,
    noShowPenalty: 5, // Renamed to "Left Tokens" in UI, value -5
    reviewsWeight: 0, // Deprecated
    minBookingsForRank: 5
};
