/**
 * SlotB Premium Theme System
 * Supports Light ("Cream & Sage") and Dark ("Midnight Sage") modes.
 */


// --- Light Theme (Cream & Sage) ---
export const SlotBColorsLight = {
  primary: '#162E22',        // Deep Forest Green
  primaryDark: '#0D1F16',
  primaryLight: '#2C4A3B',
  background: '#F9F9F4',     // Warm Cream
  surface: '#FFFFFF',        // Pure White
  surfaceHighlight: '#FFFFFF',

  // Feature Cards
  sage: '#A8CFA0',           // Soft Sage
  mustard: '#F5D667',        // Muted Mustard

  // Text
  textPrimary: '#162E22',    // Deep Green/Black
  textSecondary: '#6B746E',  // Sage Gray
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',

  border: 'rgba(22, 46, 34, 0.05)',

  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',

  icon: '#162E22',
};

// --- Dark Theme (Midnight Sage) ---
export const SlotBColorsDark = {
  primary: '#A8CFA0',        // Sage Green (becomes primary accent)
  primaryDark: '#162E22',
  primaryLight: '#C5E3BF',

  background: '#121212',     // True Dark Background
  surface: '#1E1E1E',        // Standard Dark Surface
  surfaceHighlight: '#2C2C2C',

  // Feature Cards (Dark Mode versions)
  sage: '#2C4A3B',           // Darker Sage
  mustard: '#B49320',        // Darker Mustard

  // Text
  textPrimary: '#FFFFFF',    // Pure White for max contrast
  textSecondary: '#A1A1AA',  // Neutral Gray (Zinc-400)
  textTertiary: '#71717A',   // Darker Gray (Zinc-500)
  textInverse: '#000000',

  border: 'rgba(255, 255, 255, 0.1)',

  success: '#34D399',        // Lighter Green for dark mode
  warning: '#FBBF24',
  error: '#F87171',

  icon: '#F9F9F4',
};

// Default Export (Legacy/Static access - defaults to Light)
export const SlotBColors = SlotBColorsLight;

export const SlotBShadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
};

// Navigation Colors (Static - handled via ThemeProvider usually, but we'll use our hook)
export const Colors = {
  light: {
    text: SlotBColorsLight.textPrimary,
    background: SlotBColorsLight.background,
    tint: SlotBColorsLight.primary,
    icon: SlotBColorsLight.icon,
    tabIconDefault: SlotBColorsLight.textSecondary,
    tabIconSelected: SlotBColorsLight.primary,
  },
  dark: {
    text: SlotBColorsDark.textPrimary,
    background: SlotBColorsDark.background,
    tint: SlotBColorsDark.primary,
    icon: SlotBColorsDark.icon,
    tabIconDefault: SlotBColorsDark.textSecondary,
    tabIconSelected: SlotBColorsDark.primary,
  },
};
