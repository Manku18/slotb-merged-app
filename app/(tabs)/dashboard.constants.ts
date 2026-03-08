export const DASHBOARD_TEXT = {
    today: {
        title: "Aaj ka Overview",
        bookings: "Completed Bookings",
        missed: "Missed Opportunities",
        earnings: "Aaj ki Kamai",
        suggestionsTitle: "Aaj ke liye Tips",
    },
    bookingAnalysis: {
        title: "Booking Analysis",
        microTextUp: "Pichhle se zyada",
        microTextDown: "Thoda kam",
    },
    earningAnalysis: {
        title: "Earning Analysis",
        subtitlePrefix: "Is time ki earning",
        compareUp: "Pichhle time se zyada",
        compareDown: "Pichhle time se kam",
    },
    lifetime: {
        title: "Lifetime Journey",
        since: "Partner since",
        customers: "Total Customers",
        earnings: "Total Earnings",
        missed: "Missed / Cancelled",
        modalTitle: "Lifetime Performance Report",
        motivation: "Aapne bahut logon ka bharosa jeeta hai! 🌟",
        warningTitle: "Missed Opportunities Analysis",
        warningSuggestion: "Cancellations kam karne ke liye customers ko time par attend karein.",
    },
    leaderboard: {
        employeeTitle: "Employee Ranking",
        shopTitle: "Shop Ranking",
        loyalTitle: "Loyal Customers",
        motivationText: "Top 3 me aane ke liye 4 aur customers",
        showRank: "Show Rank",
    },
    reviews: {
        title: "Reviews Summary",
        reply: "Reply",
    },
    reports: {
        title: "Download Reports",
        monthly: "Monthly Report",
        yearly: "Yearly Report",
    }
};

export const SUGGESTION_COLORS = {
    Good: '#0F172A',
    Success: '#10B981',
    Average: '#F59E0B',
    Attention: '#EF4444',
};


export enum TimeRange {
    Today = 'Today',
    Weekly = 'Weekly',
    Monthly = 'Monthly',
    Yearly = 'Yearly',
}

export const TIME_TABS = [
    { label: 'Today', value: TimeRange.Today },
    { label: 'Weekly', value: TimeRange.Weekly },
    { label: 'Monthly', value: TimeRange.Monthly },
];
