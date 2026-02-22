import { Platform, PlatformColor } from 'react-native';

// ─── Shadow type ──────────────────────────────────────────────────────────────

export interface ShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

// ─── Colors ───────────────────────────────────────────────────────────────────

const Colors = {
  // Brand
  primary: '#E85D3A',
  primaryLight: '#F4845F',
  primaryDark: '#C94A2A',
  primaryGlow: 'rgba(232, 93, 58, 0.12)',

  secondary: '#1A7A6D',
  secondaryLight: '#2A9D8F',
  secondaryDark: '#14605A',

  accent: '#F2A93B',
  accentLight: '#F5C06A',

  // Backgrounds
  background: '#FAFAF7',
  backgroundSecondary: '#F0ECE6',

  // Cards
  card: '#FFFFFF',
  cardBorder: '#EEEAD5',
  cardShadow: 'rgba(60, 40, 20, 0.06)',

  // Text
  text: '#191919',
  textSecondary: '#636366',
  textTertiary: '#A0A0A5',
  textInverse: '#FFFFFF',

  // Borders & dividers
  border: '#E5E0D8',
  divider: '#F2EDE5',

  // Semantic
  success: '#30D158',
  warning: '#FF9F0A',
  error: '#FF3B30',

  // UI chrome
  overlay: 'rgba(28, 28, 30, 0.5)',
  tabIconDefault: '#AEAEB2',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E8E4DC',

  // Scheme-specific (used by Expo Router / React Navigation)
  light: {
    text: '#191919',
    background: '#FAFAF7',
    tint: '#E85D3A',
    tabIconDefault: '#AEAEB2',
    tabIconSelected: '#E85D3A',
  },
  dark: {
    text: '#F2F2F7',
    background: '#1C1C1E',
    tint: '#F4845F',
    tabIconDefault: '#636366',
    tabIconSelected: '#F4845F',
  },

  // Elevation shadows
  // Using `as const` on each offset so TypeScript narrows to literal types
  // rather than widening to `number`, which keeps StyleSheet spreads happy.
  shadow: {
    small: {
      shadowColor: '#1C1C1E',
      shadowOffset: { width: 0, height: 1 } as const,
      shadowOpacity: 0.06,
      shadowRadius: 3,
      elevation: 1,
    } satisfies ShadowStyle,
    medium: {
      shadowColor: '#1C1C1E',
      shadowOffset: { width: 0, height: 4 } as const,
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    } satisfies ShadowStyle,
    large: {
      shadowColor: '#1C1C1E',
      shadowOffset: { width: 0, height: 8 } as const,
      shadowOpacity: 0.12,
      shadowRadius: 24,
      elevation: 6,
    } satisfies ShadowStyle,
  },
};

export default Colors;