// src/data/DataContext.js
import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from 'react';
import {
  INITIAL_BOXES,
  INITIAL_HISTORY,
  INITIAL_USERS,
} from '../constants/initialData';

const DataContext = createContext(null);

// 把日期轉成「今天 / 昨天 / 更早」
function buildDateLabel(dateInput) {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(d.getTime())) return '其他日期';

  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const target = new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
  );
  const diffMs = startOfToday - target;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  return '更早';
}

// 把初始的歷史紀錄洗成統一格式
function normalizeInitialHistory(
  initialHistory = [],
  users = [],
  boxes = [],
) {
  return initialHistory.map((item, index) => {
    const timestamp = item.timestamp || new Date().toISOString();
    const box = boxes.find((b) => b.id === item.boxId);
    const user = users.find((u) => u.id === item.userId);

    return {
      id: item.id || `hist-${index}-${Date.now()}`,
      boxId: item.boxId,
      boxName: item.boxName || box?.name || '',
      userId: item.userId || user?.id || null,
      userName: item.userName || user?.name || '',
      type: item.type || 'DELIVERY',
      note: item.note || '',
      timestamp,
      dateLabel: item.dateLabel || buildDateLabel(timestamp),
    };
  });
}

export function DataProvider({ children }) {
  const [boxes, setBoxes] = useState(INITIAL_BOXES || []);
  const [users] = useState(INITIAL_USERS || []);

  const [history, setHistory] = useState(() =>
    normalizeInitialHistory(
      INITIAL_HISTORY || [],
      INITIAL_USERS || [],
      INITIAL_BOXES || [],
    ),
  );

  const [currentUserId, setCurrentUserId] = useState(
    (INITIAL_USERS && INITIAL_USERS[0]?.id) || 'user-001',
  );

  const [abnormalAlertEnabled, setAbnormalAlertEnabled] =
    useState(true);
  const [lastAlertBoxId, setLastAlertBoxId] = useState(null);

  // 目前登入的住戶
  const currentUser = useMemo(
    () =>
      users.find((u) => u.id === currentUserId) ||
      null,
    [users, currentUserId],
  );

  // 是否顯示首頁異常 Banner
  const showAlertBanner = useMemo(
    () => abnormalAlertEnabled && !!lastAlertBoxId,
    [abnormalAlertEnabled, lastAlertBoxId],
  );

  const clearLastAlert = useCallback(() => {
    setLastAlertBoxId(null);
  }, []);

  // 核心事件：放入 / 領取 / 標記異常
  const logEvent = useCallback(
    ({ boxId, type, note }) => {
      if (!boxId || !type) return;

      // 先把對應的箱子找出來，拿名字
      const targetBox = boxes.find((b) => b.id === boxId);

      // 更新箱子狀態
      setBoxes((prev) =>
        prev.map((b) => {
          if (b.id !== boxId) return b;
          let nextStatus = b.status;
          if (type === 'DELIVERY') nextStatus = 'IN_USE';
          else if (type === 'PICKUP') nextStatus = 'AVAILABLE';
          else if (type === 'ALERT') nextStatus = 'ALERT';

          return {
            ...b,
            status: nextStatus,
            lastUpdated: new Date().toISOString(),
            lastEventType: type,
          };
        }),
      );

      // 新增一筆歷史紀錄
      setHistory((prev) => {
        const nowIso = new Date().toISOString();
        const entry = {
          id: `hist-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 6)}`,
          boxId,
          boxName: targetBox?.name || boxId,
          userId: currentUser?.id || null,
          userName: currentUser?.name || '未知使用者',
          type,
          note: note || '',
          timestamp: nowIso,
          dateLabel: buildDateLabel(nowIso),
        };

        const nextHistory = [entry, ...prev];

        if (type === 'ALERT') {
          setLastAlertBoxId(boxId);
        }

        return nextHistory;
      });
    },
    [boxes, currentUser],
  );

  const value = useMemo(
    () => ({
      // 基本資料
      boxes,
      history,
      users,

      // 目前使用者
      currentUserId,
      setCurrentUserId,
      currentUser,

      // 異常 Banner 設定
      abnormalAlertEnabled,
      setAbnormalAlertEnabled,
      lastAlertBoxId,
      showAlertBanner,
      clearLastAlert,

      // 事件紀錄
      logEvent,
    }),
    [
      boxes,
      history,
      users,
      currentUserId,
      currentUser,
      abnormalAlertEnabled,
      lastAlertBoxId,
      showAlertBanner,
      clearLastAlert,
      logEvent,
    ],
  );

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useAppData 必須在 DataProvider 裡使用');
  }
  return ctx;
}
