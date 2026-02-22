// colors.ts  (or constants/Colors.ts, theme/index.ts, etc.)
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

  overlay: string;
  tabIconDefault: string;
  tabIconSelected: string;
  tabBar: string;
  tabBarBorder: string;

  tint: string;
};

// ────────────────────────────────────────────────
//                SHARED / BASE VALUES
// ────────────────────────────────────────────────
const base = {
  primary: '#D4552A',          // rich terracotta
  primaryLight: '#E67A5B',
  primaryDark: '#A93E22',
  primaryGlow: 'rgba(212, 85, 42, 0.14)',
  primarySoft: 'rgba(212, 85, 42, 0.07)',

  secondary: '#1B7F6F',        // deep refined teal
  secondaryLight: '#2E9C8A',
  secondaryDark: '#146257',

  accent: '#C9971A',           // celebration gold
  accentLight: '#E6BE4C',

  success: '#2E7D32',
  warning: '#F09000',
  error: '#D32F2F',

  overlay: 'rgba(0,0,0,0.44)',
} as const;

// ────────────────────────────────────────────────
//                   LIGHT THEME
// ────────────────────────────────────────────────
export const light: ColorTheme = {
  ...base,

  background: '#F8F6F3',
  backgroundSecondary: '#F2EFEA',

  surface: '#FFFFFF',
  surfaceElevated: '#F9F7F4',
  surfaceSecondary: '#F2EFEA',

  border: '#E4DED8',
  borderLight: '#ECE7E1',
  divider: '#EDE8E2',

  text: '#1E1E1F',
  textSecondary: '#57565B',
  textTertiary: '#8C8C92',
  textInverse: '#FFFFFF',

  tabBar: '#FFFFFF',
  tabBarBorder: '#E4DED8',
  tabIconDefault: '#8C8C92',
  tabIconSelected: '#D4552A',

  tint: '#D4552A',
};

// ────────────────────────────────────────────────
//                   DARK THEME
// ────────────────────────────────────────────────
export const dark: ColorTheme = {
  ...base,

  // Darker but not pitch black – better eye comfort
  background: '#121215',
  backgroundSecondary: '#1A1A1F',

  surface: '#1E1E22',
  surfaceElevated: '#26262B',
  surfaceSecondary: '#222226',

  border: '#34343A',
  borderLight: '#3A3A40',
  divider: '#2F2F35',

  text: '#F3F3F6',
  textSecondary: '#B8B8C0',
  textTertiary: '#82828A',
  textInverse: '#0F0F11',

  tabBar: '#1E1E22',
  tabBarBorder: '#34343A',
  tabIconDefault: '#82828A',
  tabIconSelected: '#F4A58A',   // warmer/lighter primary variant

  tint: '#F4A58A',              // better visibility on dark background
};

// ────────────────────────────────────────────────
//                   SHADOWS
// ────────────────────────────────────────────────
export const shadows = {
  small: {
    shadowColor: Platform.select({ ios: '#3E2C24', default: '#000' }),
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.09,
    shadowRadius: 3.5,
    elevation: 2.5,
  } satisfies ShadowStyle,

  medium: {
    shadowColor: Platform.select({ ios: '#3E2C24', default: '#000' }),
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.11,
    shadowRadius: 8,
    elevation: 5,
  } satisfies ShadowStyle,

  large: {
    shadowColor: Platform.select({ ios: '#3E2C24', default: '#000' }),
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 10,
  } satisfies ShadowStyle,

  heavy: {
    shadowColor: Platform.select({ ios: '#3E2C24', default: '#000' }),
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.24,
    shadowRadius: 32,
    elevation: 16,
  } satisfies ShadowStyle,
};

// ────────────────────────────────────────────────
//                   MAIN EXPORT
// ────────────────────────────────────────────────
const Colors = {
  ...light,
  light,
  dark,
  shadow: shadows,
  shadows,
} as const;

export default Colors;