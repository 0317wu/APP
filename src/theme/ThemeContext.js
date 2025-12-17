// src/theme/ThemeContext.js
import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext(null);

const STORAGE_THEME_KEY = '@iot_app/theme';
const STORAGE_ROLE_KEY = '@iot_app/role';

const lightPalette = {
  background: '#F3F4F6',
  card: '#FFFFFF',
  cardBorder: '#E5E7EB',
  text: '#111827',
  mutedText: '#6B7280',
  subtleText: '#9CA3AF',

  primary: '#2563EB',
  accent: '#2563EB',
  accentSoft: 'rgba(37,99,235,0.08)',

  danger: '#DC2626',
  dangerSoft: 'rgba(220,38,38,0.08)',

  success: '#16A34A',
  successSoft: 'rgba(22,163,74,0.08)',

  chipBg: '#F3F4F6',
  chipBorder: '#E5E7EB',
  chipText: '#4B5563',

  bannerBg: '#FEE2E2',
  bannerText: '#B91C1C',

  divider: '#E5E7EB',

  tabBarBg: '#FFFFFF',
  tabBarActive: '#111827',
  tabBarInactive: '#9CA3AF',

  headerBg: 'transparent',
  headerText: '#111827',
};

const darkPalette = {
  background: '#020617',
  card: '#0F172A',
  cardBorder: '#1E293B',
  text: '#E5E7EB',
  mutedText: '#9CA3AF',
  subtleText: '#6B7280',

  primary: '#60A5FA',
  accent: '#60A5FA',
  accentSoft: 'rgba(96,165,250,0.16)',

  danger: '#FCA5A5',
  dangerSoft: 'rgba(248,113,113,0.16)',

  success: '#4ADE80',
  successSoft: 'rgba(74,222,128,0.16)',

  chipBg: '#020617',
  chipBorder: '#1E293B',
  chipText: '#E5E7EB',

  bannerBg: 'rgba(248,113,113,0.18)',
  bannerText: '#FCA5A5',

  divider: '#1E293B',

  tabBarBg: '#020617',
  tabBarActive: '#E5E7EB',
  tabBarInactive: '#6B7280',

  headerBg: 'transparent',
  headerText: '#E5E7EB',
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light'); // 'light' | 'dark'
  const [role, setRole] = useState('resident'); // 'resident' | 'admin'

  // 啟動時從本機載入 theme / role
  useEffect(() => {
    (async () => {
      try {
        const [[, storedTheme], [, storedRole]] =
          await AsyncStorage.multiGet([
            STORAGE_THEME_KEY,
            STORAGE_ROLE_KEY,
          ]);

        if (storedTheme === 'light' || storedTheme === 'dark') {
          setTheme(storedTheme);
        }
        if (storedRole === 'resident' || storedRole === 'admin') {
          setRole(storedRole);
        }
      } catch (e) {
        console.warn('載入主題 / 角色失敗：', e);
      }
    })();
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      AsyncStorage.setItem(STORAGE_THEME_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  // SettingsScreen 會傳 'admin' / 'resident' 進來
  const toggleRole = useCallback((nextRole) => {
    setRole((prev) => {
      const finalRole =
        nextRole === 'admin' || nextRole === 'resident'
          ? nextRole
          : prev === 'resident'
          ? 'admin'
          : 'resident';

      AsyncStorage.setItem(STORAGE_ROLE_KEY, finalRole).catch(
        () => {},
      );
      return finalRole;
    });
  }, []);

  const palette = theme === 'dark' ? darkPalette : lightPalette;

  const value = useMemo(
    () => ({
      theme,
      role,
      toggleTheme,
      toggleRole,
      palette,
      // 讓 useThemeColors() 直接拿 palette key
      ...palette,
    }),
    [theme, role, palette],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeColors() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemeColors 必須在 ThemeProvider 中使用');
  }
  return ctx;
}
