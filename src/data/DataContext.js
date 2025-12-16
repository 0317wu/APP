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
function buildDateLabel(date) {
  const today = new Date();
  const strip = (d) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((strip(today) - strip(date)) / 86400000);

  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  return '更早';
}

export function DataProvider({ children }) {
  // 共享箱基本資料
  const [boxes, setBoxes] = useState(INITIAL_BOXES);
  // 使用紀錄
  const [history, setHistory] = useState(INITIAL_HISTORY);
  // 三個使用者
  const [users] = useState(INITIAL_USERS);

  // 目前登入的是誰（住戶 A / B / C）
  const [currentUserId, setCurrentUserId] = useState(
    INITIAL_USERS?.[0]?.id ?? null
  );

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId) ?? null,
    [users, currentUserId]
  );

  // 管理員模式（給統計頁 & 之後的權限控制）
  const [isAdminMode, setIsAdminMode] = useState(false);
  const toggleAdminMode = useCallback(
    () => setIsAdminMode((prev) => !prev),
    []
  );

  // 首頁異常 Banner 顯示控制
  const [abnormalAlertEnabled, setAbnormalAlertEnabled] = useState(true);
  const [lastAlertBoxId, setLastAlertBoxId] = useState(null);
  const [showAlertBanner, setShowAlertBanner] = useState(true);

  const clearLastAlert = useCallback(() => {
    setLastAlertBoxId(null);
    setShowAlertBanner(false);
  }, []);

  /**
   * logEvent
   * - 被 BoxDetailScreen 的「放入包裹 / 領取完成 / 標記異常」呼叫
   * - 同時：
   *   1) 更新該箱子的狀態（AVAILABLE / IN_USE / ALERT）
   *   2) 新增一筆 history 給 Home / History / Analytics 用
   *   3) 如果是異常事件，順便觸發首頁的警示 Banner
   */
  const logEvent = useCallback(
    ({ boxId, type, note }) => {
      if (!boxId) return;

      const now = new Date();
      const iso = now.toISOString();
      const dateLabel = buildDateLabel(now);

      let updatedBoxRef = null;

      // 1) 更新箱子狀態
      setBoxes((prev) =>
        prev.map((box) => {
          if (box.id !== boxId) return box;

          let status = box.status;
          if (type === 'DELIVERY') status = 'IN_USE';
          else if (type === 'PICKUP') status = 'AVAILABLE';
          else status = 'ALERT'; // 其他一律視為異常

          const updated = {
            ...box,
            status,
            lastUpdated: iso,
            lastEventType: type,
            lastNote: note ?? '',
          };
          updatedBoxRef = updated;
          return updated;
        })
      );

      // 2) 新增歷史紀錄
      setHistory((prev) => {
        const box =
          updatedBoxRef || boxes.find((b) => b.id === boxId) || null;
        const user = currentUser;

        const record = {
          id: `ev-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 6)}`,
          boxId,
          boxName: box?.name || boxId,
          userId: user?.id ?? null,
          userName: user?.name || '未知住戶',
          type,
          note: note ?? '',
          timestamp: iso,
          dateLabel,
        };

        return [record, ...prev];
      });

      // 3) 異常事件 → 觸發警示 Banner
      const isAbnormal = type !== 'DELIVERY' && type !== 'PICKUP';
      if (isAbnormal && abnormalAlertEnabled) {
        setLastAlertBoxId(boxId);
        setShowAlertBanner(true);
      }
    },
    [boxes, currentUser, abnormalAlertEnabled]
  );

  const value = useMemo(
    () => ({
      // 狀態
      boxes,
      history,
      users,
      currentUser,
      currentUserId,
      isAdminMode,
      showAlertBanner,
      lastAlertBoxId,
      abnormalAlertEnabled,
      // 動作
      logEvent,
      setCurrentUserId,
      setAbnormalAlertEnabled,
      toggleAdminMode,
      clearLastAlert,
    }),
    [
      boxes,
      history,
      users,
      currentUser,
      currentUserId,
      isAdminMode,
      showAlertBanner,
      lastAlertBoxId,
      abnormalAlertEnabled,
      logEvent,
      toggleAdminMode,
      clearLastAlert,
    ]
  );

  return (
    <DataContext.Provider value={value}>{children}</DataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useAppData 必須在 DataProvider 裡使用');
  }
  return ctx;
}
