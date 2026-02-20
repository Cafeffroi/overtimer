// utils/theme.ts — Design tokens for consistent styling

export const colors = {
  // Base
  bg: '#0A0A0F',
  bgCard: '#14141F',
  bgCardHover: '#1A1A2A',
  bgInput: '#1E1E2E',
  surface: '#22223A',

  // Accent — warm orange/amber for energy/workout vibe
  accent: '#FF6B35',
  accentDim: '#FF6B3540',
  accentGlow: '#FF6B3520',

  // Secondary
  secondary: '#6C63FF',
  secondaryDim: '#6C63FF40',

  // Text
  textPrimary: '#F0F0F5',
  textSecondary: '#8888AA',
  textDim: '#55556A',

  // Semantic
  success: '#4ADE80',
  warning: '#FBBF24',
  danger: '#EF4444',

  // Timer ring
  ringBg: '#1E1E2E',
  ringActive: '#FF6B35',
  ringComplete: '#4ADE80',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const fonts = {
  // Using system fonts initially — swap to custom via expo-font later
  mono: 'monospace',       // For timer digits
  body: 'System',
  bold: 'System',
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  glow: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
};
