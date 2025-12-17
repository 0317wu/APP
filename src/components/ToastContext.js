// src/components/ToastContext.js
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { useThemeColors } from '../theme/ThemeContext';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const theme = useThemeColors();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const translateY = useRef(new Animated.Value(40)).current;
  const hideTimerRef = useRef(null);

  const hide = useCallback(() => {
    Animated.timing(translateY, {
      toValue: 40,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      setMessage('');
    });
  }, [translateY]);

  const showToast = useCallback(
    (msg) => {
      if (!msg) return;

      // 清掉舊的 timer
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }

      setMessage(msg);
      setVisible(true);

      // 往上滑進來
      Animated.timing(translateY, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start();

      // 2 秒後自動收回
      hideTimerRef.current = setTimeout(() => {
        hide();
      }, 2000);
    },
    [hide, translateY],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {visible && (
        <View
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
        >
          <Animated.View
            style={[
              styles.toastContainer,
              {
                backgroundColor: theme.card,
                borderColor: theme.cardBorder,
                transform: [{ translateY }],
              },
            ]}
          >
            <Text
              style={[
                styles.toastText,
                { color: theme.text },
              ]}
            >
              {message}
            </Text>
          </Animated.View>
        </View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast 必須在 ToastProvider 中使用');
  }
  return ctx;
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
