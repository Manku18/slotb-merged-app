import { Token } from './token.types';

const SERVICES = [
    'Haircut', 'Beard Trim', 'Hair Color', 'Facial', 'Head Massage',
    'Shave', 'Hair Spa', 'Bleach', 'Manicure', 'Pedicure'
];

const NAMES = [
    'Rahul', 'Vikram', 'Amit', 'Sameer', 'Arjun', 'Kabir', 'Rohan', 'Karan',
    'Deepak', 'Sanjay', 'Manish', 'Priya', 'Anjali', 'Sneha', 'Pooja',
    'Neha', 'Ria', 'Aisha', 'Simran', 'Ishaan', 'Vihaan', 'Aditya',
    'Sai', 'Reyansh', 'Vivaan', 'Aarav', 'Kiara', 'Diya', 'Myra', 'Ananya'
];

const BARBERS = ['Amit', 'Vikram', 'Suresh', 'Raju', 'Not Assigned'];

// Mock Data Generator
export const generateMockTokens = (): Token[] => {
    const tokens: Token[] = [];
    const now = Date.now();

    // Specific scenarios for demo:
    // 1. Serving (Active)
    tokens.push({
        id: '1', tokenNumber: '10', customerName: 'Rahul V.', service: 'Haircut + Beard',
        barber: 'Amit', status: 'serving', time: '10:40 AM',
        createdAt: now - 1000 * 60 * 45, startedAt: now - 1000 * 60 * 15, mobileNumber: '9876543210'
    });

    tokens.push({
        id: '2', tokenNumber: '11', customerName: 'Vikram S.', service: 'Hair Color',
        barber: 'Suresh', status: 'serving', time: '10:50 AM',
        createdAt: now - 1000 * 60 * 40, startedAt: now - 1000 * 60 * 105, // Long serving (trigger suggestions)
        mobileNumber: '9876543210'
    });

    // 2. Waiting (Next)
    for (let i = 0; i < 15; i++) {
        const id = (i + 12).toString();
        const isLongWait = i === 0; // First waiting is critical
        tokens.push({
            id: `w-${i}`,
            tokenNumber: (12 + i).toString(),
            customerName: NAMES[i % NAMES.length],
            service: SERVICES[i % SERVICES.length],
            barber: BARBERS[i % BARBERS.length],
            status: 'waiting',
            time: `${11 + Math.floor(i / 2)}:${(i % 2) * 30}0 AM`,
            createdAt: isLongWait ? now - 1000 * 60 * 115 : now - 1000 * 60 * (10 + i), // Trigger long wait suggestion for first
            mobileNumber: '9876543210'
        });
    }

    // 3. Completed
    for (let i = 0; i < 8; i++) {
        tokens.push({
            id: `c-${i}`,
            tokenNumber: `0${i + 1}`,
            customerName: NAMES[(i + 15) % NAMES.length],
            service: SERVICES[(i + 2) % SERVICES.length],
            barber: BARBERS[i % (BARBERS.length - 1)],
            status: 'completed',
            time: `09:${(i) * 15} AM`,
            createdAt: now - 1000 * 60 * 200,
            startedAt: now - 1000 * 60 * 180,
        });
    }

    // 4. Cancelled / No Show
    for (let i = 0; i < 5; i++) {
        tokens.push({
            id: `x-${i}`,
            tokenNumber: `C-${i + 1}`,
            customerName: NAMES[(i + 20) % NAMES.length],
            service: SERVICES[(i + 5) % SERVICES.length],
            barber: 'Not Assigned',
            status: i % 2 === 0 ? 'cancelled' : 'no-show',
            time: `08:${30 + i * 10} AM`,
            createdAt: now - 1000 * 60 * 300,
        });
    }

    return tokens;
};

export const sortTokens = (tokens: Token[]): Token[] => {
    // Priority: Serving > Waiting > Completed > Cancelled/No-Show
    const serving = tokens.filter(t => t.status === 'serving').sort((a, b) => a.tokenNumber.localeCompare(b.tokenNumber));

    // Waiting: Sort by createdAt (Oldest first)
    const waiting = tokens.filter(t => t.status === 'waiting').sort((a, b) => {
        // Logic: Earlier createdAt first.
        return (a.createdAt || 0) - (b.createdAt || 0);
    });

    const completed = tokens.filter(t => t.status === 'completed').sort((a, b) => b.tokenNumber.localeCompare(a.tokenNumber)); // Newest finished first
    const cancelled = tokens.filter(t => t.status === 'cancelled' || t.status === 'no-show');

    return [...serving, ...waiting, ...completed, ...cancelled];
};

import { TOKEN_CONFIG } from './token.constants';

export const shouldSuggestAction = (token: Token): string | null => {
    const now = Date.now();
    const diffMinutes = (now - token.createdAt) / (1000 * 60);

    if (token.status === 'waiting' && diffMinutes >= TOKEN_CONFIG.WAITING_IDLE_THRESHOLD_MIN) {
        return 'call';
    }

    if (token.status === 'serving' && token.startedAt) {
        const serveDiff = (now - token.startedAt) / (1000 * 60);
        if (serveDiff >= TOKEN_CONFIG.SERVING_DURATION_THRESHOLD_MIN) {
            return 'done';
        }
    }

    return null;
};
