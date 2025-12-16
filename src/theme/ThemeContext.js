// src/theme/ThemeContext.js
import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { DefaultTheme, DarkTheme } from '@react-navigation/native';

const ThemeContext = createContext(null);

// 淺色主題配色
const lightPalette = {
  background: '#F3F4F6',
  card: '#FFFFFF',
  cardBorder: '#E5E7EB',
  text: '#111827',
  mutedText: '#6B7280',
  subtleText: '#9CA3AF',

  primary: '#2563EB',
  primarySoft: 'rgba(37,99,235,0.08)',
  accent: '#2563EB',
  accentSoft: 'rgba(37,99,235,0.08)',

  danger: '#DC2626',
  dangerSoft: 'rgba(220,38,38,0.08)',
  success: '#16A34A',

  warning: '#D97706',
  warningSoft: 'rgba(245,158,11,0.12)',

  divider: '#E5E7EB',
  chipBg: '#EFF6FF',
  chipBorder: '#DBEAFE',
  chipText: '#1D4ED8',
  bannerBg: '#FEF3C7',
  bannerText: '#92400E',

  tabBar: '#FFFFFF',
  tabBarBorder: '#E5E7EB',
  tabBarInactive: '#9CA3AF',
};

// 深色主題配色
const darkPalette = {
  ...lightPalette,
  background: '#020617',
  card: '#020617',
  cardBorder: '#1F2937',
  text: '#F9FAFB',
  mutedText: '#9CA3AF',
  subtleText: '#6B7280',
  divider: '#1F2937',

  chipBg: 'rgba(37,99,235,0.18)',
  chipBorder: 'rgba(37,99,235,0.35)',
  chipText: '#BFDBFE',
  bannerBg: 'rgba(251,191,36,0.18)',
  bannerText: '#FACC15',

  tabBar: '#020617',
  tabBarBorder: '#1F2937',
  tabBarInactive: '#4B5563',

  warning: '#FBBF24',
  warningSoft: 'rgba(250,204,21,0.18)',
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light'); // 'light' | 'dark'
  const [role, setRole] = useState('resident'); // 'resident' | 'admin'

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  /**
   * nextRole: 'resident' | 'admin'
   * 不傳參數則在 resident / admin 之間切換
   */
  const toggleRole = useCallback((nextRole) => {
    if (nextRole) {
      setRole(nextRole);
    } else {
      setRole((prev) => (prev === 'resident' ? 'admin' : 'resident'));
    }
  }, []);

  const value = useMemo(() => {
    const isDark = theme === 'dark';
    const palette = isDark ? darkPalette : lightPalette;

    // React Navigation 用的 theme
    const baseNav = isDark ? DarkTheme : DefaultTheme;
    const navigationTheme = {
      ...baseNav,
      dark: isDark,
      colors: {
        ...baseNav.colors,
        background: palette.background,
        card: palette.card,
        border: palette.cardBorder,
        text: palette.text,
        primary: palette.accent,
        notification: palette.accent,
      },
    };

    return {
      theme,
      role,
      isDark,
      palette,
      navigationTheme,
      toggleTheme,
      toggleRole,
      // 攤平成單獨顏色 key，方便其他地方直接 theme.xxx
      ...palette,
    };
  }, [theme, role]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeColors() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemeColors must be used within ThemeProvider');
  }
  return ctx;
}
