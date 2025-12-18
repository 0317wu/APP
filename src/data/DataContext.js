// src/data/DataContext.js
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { INITIAL_BOXES, INITIAL_HISTORY, INITIAL_USERS } from '../constants/initialData';
import { formatDateLabel } from '../utils/timeUtils';

const DataContext = createContext(null);

const STORAGE_KEYS = {
  currentUserId: '@app/current_user_id',
  showAlertBanner: '@app/show_alert_banner',
  adminPin: '@app/admin_pin',
  isAdminMode: '@app/is_admin_mode',
};

function safeBool(value, fallback) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (typeof value === 'boolean') return value;
  return fallback;
}

function makeId(prefix = 'evt') {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function DataProvider({ children }) {
  const [users] = useState(INITIAL_USERS);
  const [boxes, setBoxes] = useState(INITIAL_BOXES);
  const [history, setHistory] = useState(INITIAL_HISTORY);

  const [currentUserId, setCurrentUserId] = useState(users?.[0]?.id ?? 'user-001');

  const [showAlertBanner, setShowAlertBanner] = useState(true);
  const [lastAlertBoxId, setLastAlertBoxId] = useState(null);

  const [adminPin, setAdminPinState] = useState(null);
  const [isAdminMode, setIsAdminMode] = useState(false);

  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [savedUserId, savedBanner, savedPin, savedAdminMode] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.currentUserId),
          AsyncStorage.getItem(STORAGE_KEYS.showAlertBanner),
          AsyncStorage.getItem(STORAGE_KEYS.adminPin),
          AsyncStorage.getItem(STORAGE_KEYS.isAdminMode),
        ]);

        if (!mounted) return;

        if (savedUserId) setCurrentUserId(savedUserId);
        setShowAlertBanner(safeBool(savedBanner, true));

        if (savedPin && savedPin.trim().length > 0) setAdminPinState(savedPin);
        else setAdminPinState(null);

        const rememberedAdmin = safeBool(savedAdminMode, false);
        setIsAdminMode(Boolean(rememberedAdmin && savedPin && savedPin.trim().length > 0));
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setBootstrapped(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!bootstrapped) return;
    AsyncStorage.setItem(STORAGE_KEYS.currentUserId, String(currentUserId)).catch(() => {});
  }, [bootstrapped, currentUserId]);

  useEffect(() => {
    if (!bootstrapped) return;
    AsyncStorage.setItem(STORAGE_KEYS.showAlertBanner, String(showAlertBanner)).catch(() => {});
  }, [bootstrapped, showAlertBanner]);

  useEffect(() => {
    if (!bootstrapped) return;
    AsyncStorage.setItem(STORAGE_KEYS.adminPin, adminPin ? String(adminPin) : '').catch(() => {});
  }, [bootstrapped, adminPin]);

  useEffect(() => {
    if (!bootstrapped) return;
    const toSave = isAdminMode && !!adminPin;
    AsyncStorage.setItem(STORAGE_KEYS.isAdminMode, String(toSave)).catch(() => {});
  }, [bootstrapped, isAdminMode, adminPin]);

  const currentUser = useMemo(() => {
    return users.find((u) => u.id === currentUserId) ?? users[0] ?? { id: 'user-001', name: '住戶 A' };
  }, [users, currentUserId]);

  const clearLastAlert = useCallback(() => setLastAlertBoxId(null), []);

  const logEvent = useCallback(
    ({ boxId, type, note = '' }) => {
      if (!boxId || !type) return;

      const now = new Date().toISOString();
      const box = boxes.find((b) => b.id === boxId);
      const boxName = box?.name ?? boxId;

      const event = {
        id: makeId('h'),
        boxId,
        boxName,
        type,
        note,
        timestamp: now,
        dateLabel: formatDateLabel(now),
        userId: currentUserId,
        userName: currentUser?.name ?? '未知使用者',
      };

      setHistory((prev) => [event, ...(Array.isArray(prev) ? prev : [])]);

      setBoxes((prevBoxes) => {
        const next = (Array.isArray(prevBoxes) ? prevBoxes : []).map((b) => {
          if (b.id !== boxId) return b;

          let status = b.status;
          if (type === 'DELIVERY') status = 'IN_USE';
          else if (type === 'PICKUP') status = 'AVAILABLE';
          else status = 'ALERT';

          return { ...b, status, lastUpdated: now };
        });

        return next;
      });

      if (type === 'ALERT') setLastAlertBoxId(boxId);
    },
    [boxes, currentUserId, currentUser]
  );

  const setAdminPin = useCallback(async (pin) => {
    const normalized = pin?.trim() ?? '';
    if (normalized.length === 0) {
      setAdminPinState(null);
      setIsAdminMode(false);
      await AsyncStorage.setItem(STORAGE_KEYS.adminPin, '');
      await AsyncStorage.setItem(STORAGE_KEYS.isAdminMode, 'false');
      return;
    }
    setAdminPinState(normalized);
    await AsyncStorage.setItem(STORAGE_KEYS.adminPin, normalized);
  }, []);

  const verifyAdminPin = useCallback(
    (pin) => {
      const normalized = pin?.trim() ?? '';
      return !!adminPin && normalized === adminPin;
    },
    [adminPin]
  );

  const enableAdminMode = useCallback(
    (pin) => {
      if (!adminPin) return false;
      const ok = verifyAdminPin(pin);
      if (ok) setIsAdminMode(true);
      return ok;
    },
    [adminPin, verifyAdminPin]
  );

  const disableAdminMode = useCallback(() => {
    setIsAdminMode(false);
  }, []);

  const value = useMemo(
    () => ({
      boxes,
      history: Array.isArray(history) ? history : [],
      users,

      currentUserId,
      currentUser,
      setCurrentUserId,

      showAlertBanner,
      setShowAlertBanner,

      abnormalAlertEnabled: showAlertBanner,
      setAbnormalAlertEnabled: setShowAlertBanner,

      lastAlertBoxId,
      clearLastAlert,

      logEvent,

      isAdminMode,
      setIsAdminMode,
      adminPin,
      hasAdminPin: !!adminPin,
      setAdminPin,
      verifyAdminPin,
      enableAdminMode,
      disableAdminMode,
    }),
    [
      boxes,
      history,
      users,
      currentUserId,
      currentUser,
      showAlertBanner,
      lastAlertBoxId,
      clearLastAlert,
      logEvent,
      isAdminMode,
      adminPin,
      setAdminPin,
      verifyAdminPin,
      enableAdminMode,
      disableAdminMode,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useAppData must be used within DataProvider');
  return ctx;
}
