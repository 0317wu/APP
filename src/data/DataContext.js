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
  BOX_STATUS,
  EVENT_TYPES,
} from '../constants/initialData';
import { buildHistoryItem, isAbnormalEventType } from '../utils/boxUtils';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [boxes, setBoxes] = useState(INITIAL_BOXES);
  const [history, setHistory] = useState(INITIAL_HISTORY);
  const [users] = useState(INITIAL_USERS);

  // 目前登入的住戶
  const [currentUserId, setCurrentUserId] = useState(
    INITIAL_USERS[0]?.id ?? null,
  );

  // 管理員模式（控制統計顯示範圍）
  const [isAdminMode, setIsAdminMode] = useState(false);

  // 首頁是否顯示異常 banner
  const [showAlertBanner, setShowAlertBanner] = useState(true);
  const [lastAlertBoxId, setLastAlertBoxId] = useState(null);

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId) ?? null,
    [users, currentUserId],
  );

  const toggleAdminMode = useCallback(
    () => setIsAdminMode((prev) => !prev),
    [],
  );

  const clearLastAlert = useCallback(() => {
    setLastAlertBoxId(null);
    setShowAlertBanner(false);
  }, []);

  // ✅ 這就是 BoxDetailScreen 在呼叫的 logEvent
  const logEvent = useCallback(
    ({ boxId, type, note }) => {
      const nowIso = new Date().toISOString();

      // 更新箱子狀態
      setBoxes((prev) =>
        prev.map((box) => {
          if (box.id !== boxId) return box;

          let status = box.status;
          if (type === EVENT_TYPES.DELIVERY) {
            status = BOX_STATUS.IN_USE;
          } else if (type === EVENT_TYPES.PICKUP) {
            status = BOX_STATUS.AVAILABLE;
          } else if (isAbnormalEventType(type) || type === EVENT_TYPES.ALERT) {
            status = BOX_STATUS.ALERT;
          }

          return {
            ...box,
            status,
            lastUpdated: nowIso,
            lastEventType: type,
            currentUserId,
          };
        }),
      );

      // 新增一筆歷史紀錄
      setHistory((prev) => {
        const box =
          boxes.find((b) => b.id === boxId) ?? { id: boxId, name: boxId };
        const item = buildHistoryItem({
          box,
          user: currentUser,
          type,
          note,
          timestamp: nowIso,
        });
        return [item, ...prev];
      });

      // 如果是異常事件，開啟首頁 banner
      if (isAbnormalEventType(type) || type === EVENT_TYPES.ALERT) {
        setLastAlertBoxId(boxId);
        setShowAlertBanner(true);
      }
    },
    [boxes, currentUser, currentUserId],
  );

  const value = useMemo(
    () => ({
      boxes,
      history,
      users,
      currentUser,
      currentUserId,
      isAdminMode,
      showAlertBanner,
      lastAlertBoxId,
      // actions
      logEvent,
      setCurrentUserId,
      toggleAdminMode,
      setShowAlertBanner,
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
      logEvent,
      toggleAdminMode,
      clearLastAlert,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useAppData 必須在 DataProvider 裡使用');
  }
  return ctx;
}
