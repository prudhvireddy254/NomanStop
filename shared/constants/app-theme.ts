/**
 * NomanStop design tokens — single source of truth for the mobile UI.
 * Auth, Home, Onboarding, Explore, and the tab bar all use these values.
 */
export const AppTheme = {
  background: '#0B0F19',
  surface: '#161D30',
  surfaceBorder: '#232D45',
  input: '#1F2942',
  inputBorder: '#2E3D5E',
  inputFocused: '#232F4D',
  primary: '#3B82F6',
  primaryMuted: 'rgba(59, 130, 246, 0.15)',
  secondaryMuted: 'rgba(99, 102, 241, 0.12)',
  indigo: '#6366F1',
  text: '#FFFFFF',
  textMuted: '#94A3B8',
  textPlaceholder: '#64748B',
  error: '#F87171',
  errorBg: 'rgba(239, 68, 68, 0.1)',
  errorBorder: 'rgba(239, 68, 68, 0.2)',
  danger: '#EF4444',
  tabBar: '#0F1524',
  tabBarBorder: '#232D45',
  tabInactive: '#64748B',
} as const;
