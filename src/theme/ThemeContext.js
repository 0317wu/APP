// src/theme/ThemeContext.js
import React, {
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';

const ThemeContext = createContext(null);

// 建立淺色 / 深色配色
function makePalette(theme) {
  const isDark = theme === 'dark';

  if (!isDark) {
    // 淺色主題
    return {
      background: '#F5F7FB',
      card: '#FFFFFF',
      cardBorder: '#E5E7EB',
      text: '#111827',
      subtleText: '#6B7280',
      primary: '#2563EB',
      primarySoft: 'rgba(37,99,235,0.08)',
      danger: '#DC2626',
      dangerSoft: 'rgba(220,38,38,0.08)',
    };
  }

  // 深色主題
  return {
    background: '#020617',
    card: '#020617',
    cardBorder: '#1F2937',
    text: '#F9FAFB',
    subtleText: '#9CA3AF',
    primary: '#60A5FA',
    primarySoft: 'rgba(96,165,250,0.20)',
    danger: '#FCA5A5',
    dangerSoft: 'rgba(248,113,113,0.20)',
  };
}

export function ThemeProvider({ children }) {
  // theme: 'light' | 'dark'
  const [theme, setTheme] = useState('light');
  // role: 'resident' | 'admin'
  const [role, setRole] = useState('resident');

  const palette = useMemo(() => makePalette(theme), [theme]);

  // 深色 / 淺色切換
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  /**
   * 切換 / 設定角色
   * - 傳入 'admin' 或 'resident' → 直接設為該角色
   * - 不傳參數 → 在 resident / admin 之間切換
   */
  const toggleRole = (nextRole) => {
    if (typeof nextRole === 'string') {
      setRole(nextRole);
    } else {
      setRole((prev) => (prev === 'resident' ? 'admin' : 'resident'));
    }
  };

  const value = useMemo(
    () => ({
      theme,
      role,
      palette,
      toggleTheme,
      toggleRole,
    }),
    [theme, role, palette],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useThemeColors() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemeColors 必須在 ThemeProvider 裡使用');
  }
  return ctx;
}
