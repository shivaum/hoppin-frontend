export const colors = {
  primary: {
    purple: '#8B5CF6',
    darkPurple: '#7C3AED',
    lightPurple: '#A78BFA',
  },
  secondary: {
    yellow: '#F59E0B',
    lightYellow: '#FCD34D',
    darkYellow: '#D97706',
  },
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    gray900: '#111827',
    gray800: '#1F2937',
    gray700: '#374151',
    gray600: '#4B5563',
    gray500: '#6B7280',
    gray400: '#9CA3AF',
    gray300: '#D1D5DB',
    gray200: '#E5E7EB',
    gray100: '#F3F4F6',
    gray50: '#F9FAFB',
  },
  background: {
    primary: '#1F2937', // Dark gray background like in the designs
    card: '#374151',
    overlay: 'rgba(0, 0, 0, 0.6)',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#D1D5DB',
    muted: '#9CA3AF',
  },
  border: {
    light: '#E5E7EB',
    medium: '#D1D5DB',
    dark: '#4B5563',
  },
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
} as const;

export type ColorScheme = typeof colors;