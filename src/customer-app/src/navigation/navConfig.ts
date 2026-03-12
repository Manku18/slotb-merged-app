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
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: ACTIVE_COLOR,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: ACTIVE_COLOR,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 12,
    borderWidth: 2,
    borderColor: '#fff',
};

export const SALON_IDLE_WRAP = {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: '#fff',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    borderWidth: 2,
    borderColor: '#F3F4F6',
};
