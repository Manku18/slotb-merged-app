// Shared bottom tab bar design tokens — used by both tab navigators
// so they look identical; only icons/tabs differ.

export const ACTIVE_COLOR = '#E91E63'; // rose pink
export const INACTIVE_COLOR = '#9CA3AF'; // muted grey

export const TAB_BAR_STYLE = {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingBottom: 4,
    paddingTop: 4,
    height: 56,
    elevation: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
} as const;

export const SALON_ACTIVE_WRAP = {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: ACTIVE_COLOR,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: ACTIVE_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
};

export const SALON_IDLE_WRAP = {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
};
