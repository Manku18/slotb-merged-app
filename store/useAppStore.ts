import { Token, TokenStatus } from '@/components/tokens/token.types';
import { generateMockTokens } from '@/components/tokens/token.utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Mock Data Interfaces
export interface RangeStats {
  served: number;
  missed: number;
  earnings: number;
  bookings: number;
}

export interface DashboardStats {
  totalBookings?: number;
  totalBookingsGrowth?: string;
  onlineBookings?: number;
  onlineBookingsGrowth?: string;
  offlineBookings?: number;
  offlineBookingsGrowth?: string;
  realServedBookings?: number;
  realMissedBookings?: number;
  realTotalEarnings?: number;
  today?: RangeStats;
  weekly?: RangeStats;
  monthly?: RangeStats;
  lifetime?: RangeStats;
  history?: any;
  breakdown?: any;
}

export interface EarningsEntry {
  date: string;
  amount: number;
}

export interface EarningsData {
  revenue: number;
  revenueGrowth: string;
  chartData: number[];
}

export interface Partner {
  id: string;
  name: string;
  bookings: number;
  earnings: number;
  rank: number;
  rating?: number;
}

export interface User {
  id: string;
  name: string;
  shopName: string;
  email?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  qrCode?: string;
  upiId?: string;
  image?: string;
  paymentQr?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
}



// ... (Other Interfaces kept same, checking imports)

// Add Settings Interface
export interface AppSettings {
  vibrateOnBooking: boolean;
  notifyTokens: boolean;
  notifyAlerts: boolean;
}

interface AppState {
  // Auth
  authKey: string | null;
  user: User | null;
  login: (user: User, authKey: string) => void;
  logout: () => void;

  // Hydration
  isHydrated: boolean;
  setHydrated: (state: boolean) => void;

  // Theme
  isDarkMode: boolean;
  toggleTheme: () => void;

  // Settings
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  showPlans: boolean;
  setShowPlans: (show: boolean) => void;

  // Dashboard Data
  stats: DashboardStats | null;
  earnings: EarningsData | null;
  partners: Partner[];
  setStats: (stats: DashboardStats) => void;
  setEarnings: (earnings: EarningsData) => void;
  setPartners: (partners: Partner[]) => void;

  // Notifications
  notifications: number;
  notificationsBreakdown: { bookings: number; alerts: number };
  setNotifications: (count: number, breakdown?: { bookings: number; alerts: number }) => void;

  // Maintenance
  maintenance: {
    isActive: boolean;
    until: string;
    description: string;
  };
  setMaintenance: (maintenance: { isActive: boolean; until: string; description: string }) => void;

  // Tokens
  tokens: Token[];
  filteredTokens: Token[];
  tokenFilter: 'all' | TokenStatus;
  setTokens: (tokens: Token[]) => void;
  setTokenFilter: (filter: 'all' | TokenStatus) => void;
  addToken: (token: Token) => void;
  updateTokenStatus: (id: string, status: TokenStatus) => void;
  // Reviews
  reviews_data: any[];
  setReviews: (reviews: any[]) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Auth
      authKey: null,
      user: null,
      login: (user, authKey) => set({ authKey, user }),
      logout: () => set({ authKey: null, user: null }),

      // Theme
      isDarkMode: false,
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

      // Settings
      settings: {
        vibrateOnBooking: true,
        notifyTokens: true,
        notifyAlerts: true,
      },
      updateSettings: (newSettings) => set((state) => ({ settings: { ...state.settings, ...newSettings } })),

      // Maintenance State
      maintenance: {
        isActive: false,
        until: '',
        description: 'System maintenance in progress.',
      },
      setMaintenance: (maintenance) => set({ maintenance }),

      showPlans: true,
      setShowPlans: (show) => set({ showPlans: show }),

      // Dashboard Data
      stats: null,
      earnings: null,
      partners: [],
      setStats: (stats) => set({ stats }),
      setEarnings: (earnings) => set({ earnings }),
      setPartners: (partners) => set({ partners }),
      reviews_data: [],
      setReviews: (reviews_data) => set({ reviews_data }),

      // Hydration
      isHydrated: false,
      setHydrated: (state) => set({ isHydrated: state }),

      // Notifications
      notifications: 0,
      notificationsBreakdown: { bookings: 0, alerts: 0 },
      setNotifications: (count, breakdown) => set({
        notifications: count,
        notificationsBreakdown: breakdown || { bookings: 0, alerts: 0 }
      }),

      // Tokens
      tokens: [],
      filteredTokens: [],
      tokenFilter: 'all',

      setTokens: (tokens) => set({ tokens, filteredTokens: tokens }),

      setTokenFilter: (filter) => set((state) => {
        if (filter === 'all') {
          return { tokenFilter: filter, filteredTokens: state.tokens };
        }
        return {
          tokenFilter: filter,
          filteredTokens: state.tokens.filter(t => t.status === filter)
        };
      }),

      addToken: (token) => set((state) => {
        const newTokens = [token, ...state.tokens];
        return {
          tokens: newTokens,
          filteredTokens: state.tokenFilter === 'all' ? newTokens : newTokens.filter(t => t.status === state.tokenFilter)
        };
      }),

      updateTokenStatus: (id, status) => set((state) => {
        const newTokens = state.tokens.map(t => t.id === id ? { ...t, status } : t);
        return {
          tokens: newTokens,
          filteredTokens: state.tokenFilter === 'all' ? newTokens : newTokens.filter(t => t.status === state.tokenFilter)
        };
      }),
    }),
    {
      name: 'slotb-partner-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
      partialize: (state) => ({
        authKey: state.authKey,
        user: state.user,
        settings: state.settings,
        isDarkMode: state.isDarkMode,
        reviews_data: state.reviews_data,
        showPlans: state.showPlans,
      }),
    }
  )
);
