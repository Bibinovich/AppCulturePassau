import { Platform } from 'react-native';

export interface ShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export type ColorTheme = {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryGlow: string;
  primarySoft: string;

  secondary: string;
  secondaryLight: string;
  secondaryDark: string;

  accent: string;
  accentLight: string;

  background: string;
  backgroundSecondary: string;

  surface: string;
  surfaceElevated: string;
  surfaceSecondary: string;

  border: string;
  borderLight: string;
  divider: string;

  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  success: string;
  warning: string;
  error: string;
  info: string;

  overlay: string;
  tabIconDefault: string;
  tabIconSelected: string;
  card: string;
  cardBorder: string;

  tabBar: string;
  tabBarBorder: string;

  tint: string;
};

const base = {
  primary: '#007AFF',
  primaryLight: '#409CFF',
  primaryDark: '#0056CC',
  primaryGlow: 'rgba(0, 122, 255, 0.12)',
  primarySoft: 'rgba(0, 122, 255, 0.06)',

  secondary: '#5856D6',
  secondaryLight: '#7A79E0',
  secondaryDark: '#3634A3',

  accent: '#FF9500',
  accentLight: '#FFBF66',

  success: '#34C759',
  warning: '#FF9F0A',
  error: '#FF3B30',
  info: '#5AC8FA',

  overlay: 'rgba(0,0,0,0.4)',
} as const;

export const light: ColorTheme = {
  ...base,

  background: '#F2F2F7',
  backgroundSecondary: '#EFEFF4',

  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceSecondary: '#F2F2F7',

  border: '#D1D1D6',
  borderLight: '#E5E5EA',
  divider: '#C6C6C8',

  text: '#000000',
  textSecondary: '#8E8E93',
  textTertiary: '#AEAEB2',
  textInverse: '#FFFFFF',

  card: '#FFFFFF',
  cardBorder: '#E5E5EA',

  tabBar: '#F9F9F9',
  tabBarBorder: '#D1D1D6',
  tabIconDefault: '#8E8E93',
  tabIconSelected: '#007AFF',

  tint: '#007AFF',
};

export const dark: ColorTheme = {
  ...base,

  background: '#000000',
  backgroundSecondary: '#1C1C1E',

  surface: '#1C1C1E',
  surfaceElevated: '#2C2C2E',
  surfaceSecondary: '#2C2C2E',

  border: '#38383A',
  borderLight: '#48484A',
  divider: '#38383A',

  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  textTertiary: '#636366',
  textInverse: '#000000',

  card: '#1C1C1E',
  cardBorder: '#38383A',

  tabBar: '#1C1C1E',
  tabBarBorder: '#38383A',
  tabIconDefault: '#636366',
  tabIconSelected: '#0A84FF',

  tint: '#0A84FF',
};

export const shadows = {
  small: {
    shadowColor: Platform.select({ ios: '#000', default: '#000' }),
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  } satisfies ShadowStyle,

  medium: {
    shadowColor: Platform.select({ ios: '#000', default: '#000' }),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  } satisfies ShadowStyle,

  large: {
    shadowColor: Platform.select({ ios: '#000', default: '#000' }),
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  } satisfies ShadowStyle,

  heavy: {
    shadowColor: Platform.select({ ios: '#000', default: '#000' }),
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 12,
  } satisfies ShadowStyle,
};

const Colors = {
  ...light,
  light,
  dark,
  shadow: shadows,
  shadows,
} as const;

export default Colors;
