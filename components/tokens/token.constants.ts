import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const TOKEN_CONFIG = {
    // Time Thresholds (in minutes) for Auto-Intelligence
    WAITING_IDLE_THRESHOLD_MIN: 75, // 75 Mins
    SERVING_DURATION_THRESHOLD_MIN: 60, // 60 Mins

    // Smart Reminders
    REMINDER_LIMIT: 4,
    REMINDER_INTERVAL_MIN: 10,

    // Animation Durations
    ANIMATION_DURATION: 300,
    SWIPE_THRESHOLD: width * 0.3,

    // UI Constants
    PROFILE_MODAL_HEIGHT: 400, // Bottom sheet height
};

export const TOKEN_COLORS = {
    waiting: '#D97706', // Amber-500
    serving: '#10B981', // Emerald-500
    completed: '#6B7280', // Gray-500
    cancelled: '#DC2626', // Red-500
    noShow: '#DC2626',    // Red-500 (Same as cancelled visually but maybe diff icon)

    // Specific Actions
    CALL_BTN_BLUE: '#2563EB', // Blue-500
    REQUEUE: '#D97706', // Amber-500 (Same as waiting)
};

export const TOKEN_MESSAGES = {
    CALL_CUSTOMER: "Suggestion: Call customer?",
    MARK_DONE: "Suggestion: Mark as Done?",
    CUSTOMER_COMING_TITLE: "Is customer coming?",
};
