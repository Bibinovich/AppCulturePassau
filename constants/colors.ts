import { Platform, PlatformColor } from 'react-native';

export interface ShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

const Colors = {
  primary: '#D4552A',
  primaryLight: '#E8724E',
  primaryDark: '#B5431F',
  primaryGlow: 'rgba(212, 85, 42, 0.10)',
  primarySoft: 'rgba(212, 85, 42, 0.06)',

  secondary: '#1B7F6F',
  secondaryLight: '#27A594',
  secondaryDark: '#145E55',

  accent: '#E49B2A',
  accentLight: '#F0B85A',

  background: '#F8F6F2',
  backgroundSecondary: '#EFEBE4',

  card: '#FFFFFF',
  cardBorder: '#E8E3DA',
  cardShadow: 'rgba(45, 30, 15, 0.07)',

  text: '#1A1A1A',
  textSecondary: '#5C5C62',
  textTertiary: '#9A9A9F',
  textInverse: '#FFFFFF',

  border: '#DDD8CF',
  divider: '#F0EBE3',

  success: '#2BAA5E',
  warning: '#E89C1A',
  error: '#D93B30',

  overlay: 'rgba(20, 20, 22, 0.55)',
  tabIconDefault: '#A8A8AD',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E5E0D8',

  light: {
    text: '#1A1A1A',
    background: '#F8F6F2',
    tint: '#D4552A',
    tabIconDefault: '#A8A8AD',
    tabIconSelected: '#D4552A',
  },
  dark: {
    text: '#F0F0F5',
    background: '#1A1A1E',
    tint: '#E8724E',
    tabIconDefault: '#5C5C62',
    tabIconSelected: '#E8724E',
  },

  shadow: {
    small: {
      shadowColor: '#2D1E0F',
      shadowOffset: { width: 0, height: 1 } as const,
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 1,
    } satisfies ShadowStyle,
    medium: {
      shadowColor: '#2D1E0F',
      shadowOffset: { width: 0, height: 3 } as const,
      shadowOpacity: 0.07,
      shadowRadius: 10,
      elevation: 3,
    } satisfies ShadowStyle,
    large: {
      shadowColor: '#2D1E0F',
      shadowOffset: { width: 0, height: 6 } as const,
      shadowOpacity: 0.10,
      shadowRadius: 20,
      elevation: 6,
    } satisfies ShadowStyle,
  },
};

export default Colors;
