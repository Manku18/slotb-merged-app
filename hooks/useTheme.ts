import { SlotBColorsDark, SlotBColorsLight } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';

export function useTheme() {
    const isDarkMode = useAppStore((state) => state.isDarkMode);

    const colors = isDarkMode ? SlotBColorsDark : SlotBColorsLight;

    return {
        colors,
        isDarkMode,
    };
}
