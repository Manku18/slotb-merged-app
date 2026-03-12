import axios from 'axios';
import * as WebBrowser from 'expo-web-browser';
import { Linking } from 'react-native';
import { Token } from '@/components/tokens/token.types';
import { DashboardStats, EarningsEntry, Partner } from '@/store/useAppStore';

const API_BASE_URL = 'https://slotb.in/shop_api.php';

console.log("API URL Configured:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  },
});

// Interceptor for logging
api.interceptors.request.use(request => {
  // console.log('Starting Request', request.method, request.url, request.data);
  return request;
});

api.interceptors.response.use(response => {
  // console.log('Response:', response.data);
  return response;
}, error => {
  console.error('API Error:', error.response ? error.response.data : error.message);
  return Promise.reject(error);
});

export const authService = {
  async login(identifier: string, password: string) {
    try {
      const response = await api.post('', {
        action: 'login',
        identifier,
        password
      });
      return response.data;
    } catch (error) {
      console.error("Login Service Error:", error);
      throw error;
    }
  },

  async signup(data: any) {
    try {
      // Ensure action is set
      const payload = { ...data, action: 'signup' };
      console.log("Sending Signup Payload:", payload); // Debugging

      const response = await api.post('', payload);
      console.log("Signup Response:", response.data); // Debugging
      return response.data;
    } catch (error) {
      console.error("Signup Service Error:", error);
      throw error;
    }
  },

  async sendSignupOTP(email: string) {
    try {
      const response = await api.post('', {
        action: 'send_signup_otp',
        email
      });
      return response.data;
    } catch (error) {
      console.error("Send OTP Error:", error);
      throw error;
    }
  },

  async verifyOtpAndSignup(data: any) {
    try {
      const response = await api.post('', {
        action: 'verify_otp_and_signup',
        ...data
      });
      return response.data;
    } catch (error) {
      console.error("Verify OTP Signup Error:", error);
      throw error;
    }
  },

  async sendForgotPasswordOTP(email: string) {
    try {
      const response = await api.post('', {
        action: 'send_forgot_password_otp',
        email
      });
      return response.data;
    } catch (error) {
      console.error("Send Reset OTP Error:", error);
      throw error;
    }
  },

  async resetPassword(data: any) {
    try {
      const response = await api.post('', {
        action: 'verify_otp_reset_password',
        ...data
      });
      return response.data;
    } catch (error) {
      console.error("Reset Password Error:", error);
      throw error;
    }
  },

  async sendDeleteAccountOTP(email: string) {
    try {
      const response = await api.post('', {
        action: 'send_delete_account_otp',
        email
      });
      return response.data;
    } catch (error) {
      console.error("Send Delete OTP Error:", error);
      throw error;
    }
  },

  async verifyDeleteAccount(email: string, otp: string) {
    try {
      const response = await api.post('', {
        action: 'verify_delete_account_otp',
        email,
        otp
      });
      return response.data;
    } catch (error) {
      console.error("Verify Delete Error:", error);
      throw error;
    }
  }
};

export const apiService = {
  async checkMaintenance(): Promise<any> {
    const dashboardUrl = API_BASE_URL.replace('shop_api.php', 'api_dashboard.php');
    try {
      const response = await api.post(dashboardUrl, { action: 'check_maintenance' });
      return response.data;
    } catch (e) {
      return { ok: false };
    }
  },

  async getDashboard(dateFilter: 'today' | 'tomorrow' = 'today'): Promise<any> {
    const { useAppStore } = require('@/store/useAppStore');
    const shopId = useAppStore.getState().user?.id;

    if (!shopId) return { stats: {}, earnings: [], partners: [], tokens: [] };

    // Pointing to api_dashboard.php explicitly if needed, but for now we reuse the base axios which points to shop_api
    // We need a separate instance or override URL for dashboard if it's a different file
    // Let's assume API_BASE_URL is just the root, but we set it to shop_api.php.
    // We'll override the URL for this call.
    const dashboardUrl = API_BASE_URL.replace('shop_api.php', 'api_dashboard.php');

    try {
      const response = await api.post(dashboardUrl, {
        action: 'fetch_dashboard_data',
        shop_id: shopId,
        date_filter: dateFilter
      });

      const data = response.data;
      if (!data.ok) {
        // Return mocks if API fails or empty
        return { stats: {}, earnings: [], partners: [], tokens: [] };
      }

      // Map data (simplified)
      const src = data.stats || data.kpis || {}; // Handle renaming from kpis to stats

      return {
        stats: {
          totalBookings: src.totalBookings || 0,
          totalBookingsGrowth: '0%',
          offlineBookings: src.offlineBookings || 0,
          offlineBookingsGrowth: '0%',
          onlineBookings: src.onlineBookings || 0,
          onlineBookingsGrowth: '0%',
          realServedBookings: src.realServedBookings,
          realMissedBookings: src.realMissedBookings,
          realTotalEarnings: src.realTotalEarnings,
          today: src.today,
          weekly: src.weekly,
          monthly: src.monthly,
          lifetime: src.lifetime,
          history: src.history,     // Pass history
          breakdown: src.breakdown  // Pass breakdown
        },
        earnings: {
          revenue: src.monthlyEarnings || 0,
          revenueGrowth: '+0%',
          chartData: data.charts?.earnings || []
        },
        partners: (data.workers || []).map((w: any, i: number) => ({
          id: `p-${i}`,
          name: w.name,
          bookings: w.served,
          earnings: 0,
          rank: i + 1,
          rating: w.rating || 5.0,
          avatar: w.img
        })),
        tokens: (data.liveBookings || []).map((b: any) => {
          let timeStr = 'Today';
          let createdTimestamp = Date.now();

          if (b.created_at) {
            // Parse MySQL Timestamp (e.g., "2025-01-03 15:30:00")
            const t = b.created_at.replace(' ', 'T');
            const date = new Date(t);
            if (!isNaN(date.getTime())) {
              createdTimestamp = date.getTime();
              // Manual Format: hh:mm AM/PM
              const h = date.getHours();
              const m = date.getMinutes();
              const amp = h >= 12 ? 'PM' : 'AM';
              const hv = h % 12 || 12;
              const mv = m < 10 ? '0' + m : m;
              timeStr = `${hv}:${mv} ${amp}`;
            }
          }

          return {
            id: b.id?.toString() || Math.random().toString(),
            tokenNumber: b.token?.toString() || '0',
            customerName: b.userName,
            service: b.service,
            barber: 'Staff',
            status: b.status === 'served' ? 'completed' : b.status,
            time: timeStr,
            mobileNumber: b.phone,
            createdAt: createdTimestamp,
            paymentStatus: b.payment_status,
            razorpayPaymentId: b.razorpay_payment_id
          };
        }),
        shop: data.shop,
        app_carousel: data.app_carousel || [],
        app_styles: data.app_styles || [],
        app_essentials: data.app_essentials || [],
        reviews: data.reviews || [],
        notificationsCount: data.unread_notifications_count || 0,
        notificationsBreakdown: data.unread_breakdown || { bookings: 0, alerts: 0 },
        maintenance_mode: data.maintenance_mode,
        maintenance_until: data.maintenance_until,
        maintenance_description: data.maintenance_description,
        show_plans_section: data.show_plans_section
      };

    } catch (e) {
      console.error("Dashboard error", e);
      return { stats: {}, earnings: [], partners: [], tokens: [] };
    }
  },

  async addToken(data: { name: string, mobile: string, service: string, serviceId?: number, price?: number, partnerId?: number }, shopId: string): Promise<any> {
    const dashboardUrl = API_BASE_URL.replace('shop_api.php', 'api_dashboard.php');

    // Pass everything needed for backend to determine price/service details
    const response = await api.post(dashboardUrl, {
      action: 'add_token',
      shop_id: shopId,
      user_name: data.name,
      phone: data.mobile,
      service_title: data.service,
      service_id: data.serviceId || 0,
      price: data.price,
      partner_id: data.partnerId || 0
    });
    return response.data;
  },

  async addPartner(shopId: string, name: string, phone: string): Promise<any> {
    const dashboardUrl = API_BASE_URL.replace('shop_api.php', 'api_dashboard.php');
    const response = await api.post(dashboardUrl, {
      action: 'add_partner',
      shop_id: shopId,
      name,
      phone
    });
    return response.data;
  },

  async getNotifications(shopId: string): Promise<any[]> {
    const dashboardUrl = API_BASE_URL.replace('shop_api.php', 'api_dashboard.php');
    try {
      const response = await api.post(dashboardUrl, {
        action: 'fetch_notifications',
        shop_id: shopId
      });
      return response.data.notifications || [];
    } catch (e) { return []; }
  },

  async markNotificationRead(shopId: string, notificationId: string): Promise<boolean> {
    const dashboardUrl = API_BASE_URL.replace('shop_api.php', 'api_dashboard.php');
    try {
      await api.post(dashboardUrl, {
        action: 'mark_read',
        shop_id: shopId,
        notification_id: notificationId
      });
      return true;
    } catch (e) { return false; }
  },

  async markAllNotificationsRead(shopId: string): Promise<boolean> {
    const dashboardUrl = API_BASE_URL.replace('shop_api.php', 'api_dashboard.php');
    try {
      await api.post(dashboardUrl, {
        action: 'mark_all_read',
        shop_id: shopId
      });
      return true;
    } catch (e) { return false; }
  },
  async clearNotifications(shopId: string): Promise<boolean> {
    const dashboardUrl = API_BASE_URL.replace('shop_api.php', 'api_dashboard.php');
    try {
      await api.post(dashboardUrl, {
        action: 'clear_notifications',
        shop_id: shopId
      });
      return true;
    } catch (e) { return false; }
  },
  async deleteNotification(shopId: string, notificationId: string): Promise<boolean> {
    const dashboardUrl = API_BASE_URL.replace('shop_api.php', 'api_dashboard.php');
    try {
      await api.post(dashboardUrl, {
        action: 'delete_notification',
        shop_id: shopId,
        notification_id: notificationId
      });
      return true;
    } catch (e) { return false; }
  },

  async getShopStatus(shopId: string): Promise<boolean> {
    try {
      const response = await api.post('', { action: 'get_status', shop_id: shopId });
      return response.data.status === 'success' && response.data.is_open == 1;
    } catch (e) { return true; }
  },

  async toggleShopStatus(shopId: string, isOpen: boolean): Promise<boolean> {
    const response = await api.post('', {
      action: 'toggle_status',
      shop_id: shopId,
      status: isOpen ? '1' : '0'
    });
    return response.data.status === 'success';
  },

  async updateBookingStatus(bookingId: string, status: string, shopId: string): Promise<boolean> {
    const dashboardUrl = API_BASE_URL.replace('shop_api.php', 'api_dashboard.php');

    // Map 'completed' back to 'served' for backend
    const backendStatus = status === 'completed' ? 'served' : status;

    const response = await api.post(dashboardUrl, {
      action: 'update_booking_status',
      booking_id: bookingId,
      status: backendStatus,
      shop_id: shopId
    });
    return response.data.ok === true;
  },

  async updateProfile(shopId: string, data: any): Promise<any> {
    const response = await api.post('', {
      action: 'update_profile',
      shop_id: shopId,
      ...data
    });
    return response.data;
  },

  async getServices(shopId: string): Promise<any[]> {
    const dashboardUrl = API_BASE_URL.replace('shop_api.php', 'api_dashboard.php');
    try {
      const response = await api.post(dashboardUrl, {
        action: 'fetch_services',
        shop_id: shopId
      });
      return response.data.services || [];
    } catch (e) { return []; }
  },

  async addService(shopId: string, service: { title: string, price: number, share: number }): Promise<any> {
    const dashboardUrl = API_BASE_URL.replace('shop_api.php', 'api_dashboard.php');
    const response = await api.post(dashboardUrl, {
      action: 'add_service',
      shop_id: shopId,
      ...service
    });
    return response.data;
  },

  async deleteService(shopId: string, serviceId: number): Promise<any> {
    const dashboardUrl = API_BASE_URL.replace('shop_api.php', 'api_dashboard.php');
    const response = await api.post(dashboardUrl, {
      action: 'delete_service',
      id: serviceId,
      shop_id: shopId
    });
    return response.data;
  },

  async getReportData(shopId: string, type: string, year: number, month?: number): Promise<any> {
    const dashboardUrl = API_BASE_URL.replace('shop_api.php', 'api_dashboard.php');
    const response = await api.post(dashboardUrl, {
      action: 'fetch_report_data',
      shop_id: shopId,
      type,
      year,
      month
    });
    return response.data.report;
  },

  async getCustomers(shopId: string, type: string, year: number, month?: number): Promise<any[]> {
    const dashboardUrl = API_BASE_URL.replace('shop_api.php', 'api_dashboard.php');
    const response = await api.post(dashboardUrl, {
      action: 'fetch_customers',
      shop_id: shopId,
      type,
      year,
      month
    });
    return response.data.customers || [];
  },

  async getCustomerHistory(shopId: string, phone: string): Promise<any> {
    const dashboardUrl = API_BASE_URL.replace('shop_api.php', 'api_dashboard.php');
    const response = await api.post(dashboardUrl, {
      action: 'fetch_customer_history',
      shop_id: shopId,
      phone
    });
    return response.data;
  },

  async replyReview(reviewId: number, replyText: string): Promise<any> {
    const { useAppStore } = require('@/store/useAppStore');
    const shopId = useAppStore.getState().user?.id;
    if (!shopId) throw new Error("Not logged in");

    const dashboardUrl = API_BASE_URL.replace('shop_api.php', 'api_dashboard.php');
    try {
      const response = await api.post(dashboardUrl, {
        action: 'reply_review',
        review_id: reviewId,
        reply_text: replyText,
        shop_id: shopId
      });
      return response.data;
    } catch (e) {
      console.error("Reply review error", e);
      throw e;
    }
  },
  async post(action: string, data: any): Promise<any> {
    const dashboardUrl = API_BASE_URL.replace('shop_api.php', 'api_dashboard.php');
    try {
      const response = await api.post(dashboardUrl, {
        action,
        ...data
      });
      return response.data;
    } catch (e: any) {
      console.error("API POST Error:", e);
      return { ok: false, message: e.message };
    }
  },

  async getPlans(): Promise<any[]> {
    const { useAppStore } = require('@/store/useAppStore');
    const shopId = useAppStore.getState().user?.id;
    if (!shopId) return [];

    try {
      const response = await api.post('', {
        action: 'fetch_plans',
        shop_id: shopId
      });

      if (response.data.status === 'success') {
        return response.data.plans || [];
      }
      return [];
    } catch (e) {
      console.error("Fetch Plans Error", e);
      return [];
    }
  },

  async updatePlan(planId: string, shopId: string): Promise<boolean> {
    const paymentUrl = `${API_BASE_URL.replace('shop_api.php', 'partner_payment.php')}?shop_id=${shopId}&plan_id=${planId}`;
    console.log("Opening Partner Payment URL:", paymentUrl);

    try {
      // 1. Try Expo WebBrowser (In-app)
      const result = await WebBrowser.openBrowserAsync(paymentUrl);

      // If the browser was closed/cancelled, or if it failed to open, 
      // we can try a fallback to the system browser just in case.
      if (result.type === 'cancel' || !result) {
        console.log("WebBrowser cancelled or failed, trying Linking fallback...");
        await Linking.openURL(paymentUrl);
      }
      return true;
    } catch (error) {
      console.error("Failed to open payment browser", error);
      // 2. Final Fallback: System Browser
      try {
        await Linking.openURL(paymentUrl);
        return true;
      } catch (linkError) {
        console.error("Linking fallback also failed", linkError);
        return false;
      }
    }
  },

  async getRanking(shopId: string, period: string, scope: 'global' | 'state' | '15km' | '60km', userLocation?: { lat: number, lon: number, state: string }): Promise<any> {
    // Use a separate endpoint for ranking to avoid conflict with existing dashboard API
    const rankingUrl = API_BASE_URL.replace('shop_api.php', 'api_ranking.php');
    try {
      const payload: any = {
        action: 'fetch_ranking',
        shop_id: shopId,
        period: period,
        scope: scope
      };

      // We still pass frontend location if available, but backend is the source of truth
      if (userLocation?.lat) payload.latitude = userLocation.lat;
      if (userLocation?.lon) payload.longitude = userLocation.lon;
      if (userLocation?.state) payload.state = userLocation.state;

      const response = await api.post(rankingUrl, payload);
      console.log("Ranking Response:", response.data);
      return response.data;
    } catch (e) {
      console.error("Ranking Fetch Error", e);
      return { leaderboard: [], myRank: null };
    }
  },

  async savePushToken(shopId: string, pushToken: string): Promise<boolean> {
    const dashboardUrl = API_BASE_URL.replace('shop_api.php', 'api_dashboard.php');
    try {
      const response = await api.post(dashboardUrl, {
        action: 'save_push_token',
        shop_id: shopId,
        push_token: pushToken,
        platform: 'expo'
      });
      return response.data.ok === true;
    } catch (e) {
      console.error("Save Push Token Error", e);
      return false;
    }
  },
  async createRazorpayOrder(shopId: string): Promise<any> {
    try {
      const response = await api.post('', {
        action: 'razorpay_create_order',
        shop_id: shopId
      });
      return response.data;
    } catch (e) {
      console.error("Create Order Error", e);
      return { status: 'error', message: 'Connection failed' };
    }
  },
  async verifyRazorpayPayment(data: { shop_id: string, razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string }): Promise<any> {
    try {
      const response = await api.post('', {
        action: 'razorpay_verify_payment',
        ...data
      });
      return response.data;
    } catch (e) {
      console.error("Verify Payment Error", e);
      return { status: 'error', message: 'Connection failed' };
    }
  }
};

export class WebSocketService {
  private url: string;
  private socket: WebSocket | null = null;
  private messageHandler: ((data: any) => void) | null = null;
  private reconnectInterval: NodeJS.Timeout | null = null;

  constructor(url: string) {
    this.url = url;
  }

  connect() {
    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        console.log('WebSocket Connected');
        if (this.reconnectInterval) {
          clearInterval(this.reconnectInterval);
          this.reconnectInterval = null;
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (this.messageHandler) {
            this.messageHandler(data);
          }
        } catch (e) {
          console.error('WebSocket message parse error:', e);
        }
      };

      this.socket.onerror = (e) => {
        console.log('WebSocket error:', (e as any).message);
      };

      this.socket.onclose = () => {
        console.log('WebSocket closed. Reconnecting...');
        if (!this.reconnectInterval) {
          this.reconnectInterval = setInterval(() => {
            this.connect();
          }, 3000);
        }
      };
    } catch (e) {
      console.error("WebSocket init error", e);
    }
  }

  onMessage(handler: (data: any) => void) {
    this.messageHandler = handler;
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }
  }
}
