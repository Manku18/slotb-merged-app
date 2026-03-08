export const Colors = {
    primary: '#6366f1',       // Indigo
    secondary: '#ff6b6b',     // Coral
    accent: '#f59e0b',        // Gold
    green: '#10b981',         // Emerald

    background: '#ffffff',    // Pure white
    surface: '#f8f9fe',       // Off-white surface
    surfaceCard: '#ffffff',   // White card
    border: '#e8eaf6',        // Very light indigo border

    text: '#1a1a2e',          // Deep navy text
    textMuted: '#8892b0',     // Muted blue-grey
    textLight: '#c0c8e8',     // Light text

    white: '#ffffff',
    black: '#000000',

    shadow: 'rgba(99, 102, 241, 0.10)',
    shadowCard: 'rgba(0, 0, 0, 0.07)',
} as const;

export type ColorTheme = typeof Colors;
