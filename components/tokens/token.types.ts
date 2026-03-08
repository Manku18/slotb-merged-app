export type TokenStatus = 'serving' | 'waiting' | 'completed' | 'cancelled' | 'no-show';

export interface Token {
    id: string;
    tokenNumber: string;
    customerName: string;
    service: string;
    barber: string; // "Staff assigned"
    status: TokenStatus;
    time: string; // Booking Time "10:40 AM"
    mobileNumber?: string; // Optional for call

    // Internal tracking
    createdAt: number; // Timestamp for "Auto-Intelligence" time diffs
    startedAt?: number; // Timestamp when status changed to 'serving'
    duration?: number;

    // Smart Reminders
    reminderCount?: number;
    lastReminderAt?: number;
    lastDoneSuggestionAt?: number;
}

export type TokenFilter = 'all' | TokenStatus;

export interface TokenStats {
    completed: number;
    waiting: number;
    cancelled: number;
}
