// src/data/DataContext.js
import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  INITIAL_BOXES,
  INITIAL_HISTORY,
  INITIAL_USERS,
} from '../constants/initialData';

const DataContext = createContext(null);

const STORAGE_KEYS = {
  BOXES: '@iot_app/boxes',
  HISTORY: '@iot_app/history',
  CURRENT_USER_ID: '@iot_app/currentUserId',
  ABNORMAL_ALERT: '@iot_app/abnormalAlertEnabled',
  LAST_ALERT_BOX_ID: '@iot_app/lastAlertBoxId',
};

// 把日期轉成「今天 / 昨天 / 更早」
function buildDateLabel(dateInput) {
  const d =
    dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(d.getTime())) return '其他日期';

  const today = new Date();
  const strip = (x) =>
    new Date(
      x.getFullYear(),
      x.getMonth(),
      x.getDate(),
    ).getTime();
  const diffDays = Math.round(
    (strip(today) - strip(d)) / 86400000,
  );

  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  return '更早';
}

// 統一歷史紀錄格式
function normalizeHistory(
  raw = [],
  users = [],
  boxes = [],
) {
  return (raw || []).map((item, idx) => {
    const timestamp =
      item.timestamp || new Date().toISOString();
    const box =
      boxes.find((b) => b.id === item.boxId) || null;
    const user =
      users.find((u) => u.id === item.userId) || null;

    return {
      id:
        item.id ||
        `hist-${idx}-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 6)}`,
      boxId: item.boxId || box?.id || '',
      boxName: item.boxName || box?.name || '',
      userId: item.userId || user?.id || null,
      userName: item.userName || user?.name || '未知使用者',
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
    normalizeHistory(
      INITIAL_HISTORY || [],
      INITIAL_USERS || [],
      INITIAL_BOXES || [],
    ),
  );

  const [currentUserIdState, setCurrentUserIdState] =
    useState(
      (INITIAL_USERS && INITIAL_USERS[0]?.id) ||
        'user-001',
    );
  const [abnormalAlertEnabledState, setAbnormalAlertEnabledState] =
    useState(true);
  const [lastAlertBoxIdState, setLastAlertBoxIdState] =
    useState(null);

  const [hydrated, setHydrated] = useState(false);

  // 啟動時從本機載入資料
  useEffect(() => {
    (async () => {
      try {
        const entries = await AsyncStorage.multiGet(
          Object.values(STORAGE_KEYS),
        );
        const map = Object.fromEntries(entries);

        if (map[STORAGE_KEYS.BOXES]) {
          try {
            const parsed = JSON.parse(
              map[STORAGE_KEYS.BOXES],
            );
            if (Array.isArray(parsed)) {
              setBoxes(parsed);
            }
          } catch {}
        }

        if (map[STORAGE_KEYS.HISTORY]) {
          try {
            const parsed = JSON.parse(
              map[STORAGE_KEYS.HISTORY],
            );
            if (Array.isArray(parsed)) {
              setHistory(
                normalizeHistory(
                  parsed,
                  INITIAL_USERS || [],
                  INITIAL_BOXES || [],
                ),
              );
            }
          } catch {}
        }

        if (map[STORAGE_KEYS.CURRENT_USER_ID]) {
          setCurrentUserIdState(
            map[STORAGE_KEYS.CURRENT_USER_ID],
          );
        }

        if (
          typeof map[STORAGE_KEYS.ABNORMAL_ALERT] ===
          'string'
        ) {
          setAbnormalAlertEnabledState(
            map[STORAGE_KEYS.ABNORMAL_ALERT] === 'true',
          );
        }

        if (map[STORAGE_KEYS.LAST_ALERT_BOX_ID]) {
          setLastAlertBoxIdState(
            map[STORAGE_KEYS.LAST_ALERT_BOX_ID],
          );
        }
      } catch (e) {
        console.warn('載入本機資料失敗：', e);
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  // 包一層，對外還是叫 setCurrentUserId
  const setCurrentUserId = useCallback((id) => {
    setCurrentUserIdState(id);
    AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, id).catch(
      () => {},
    );
  }, []);

  const setAbnormalAlertEnabled = useCallback((value) => {
    setAbnormalAlertEnabledState(value);
    AsyncStorage.setItem(
      STORAGE_KEYS.ABNORMAL_ALERT,
      String(value),
    ).catch(() => {});
  }, []);

  const setLastAlertBoxId = useCallback((boxIdOrNull) => {
    setLastAlertBoxIdState(boxIdOrNull);
    if (boxIdOrNull) {
      AsyncStorage.setItem(
        STORAGE_KEYS.LAST_ALERT_BOX_ID,
        boxIdOrNull,
      ).catch(() => {});
    } else {
      AsyncStorage.removeItem(
        STORAGE_KEYS.LAST_ALERT_BOX_ID,
      ).catch(() => {});
    }
  }, []);

  const currentUser = useMemo(
    () =>
      users.find((u) => u.id === currentUserIdState) || null,
    [users, currentUserIdState],
  );

  const abnormalAlertEnabled = abnormalAlertEnabledState;
  const lastAlertBoxId = lastAlertBoxIdState;

  const showAlertBanner = useMemo(
    () => abnormalAlertEnabled && !!lastAlertBoxId,
    [abnormalAlertEnabled, lastAlertBoxId],
  );

  const clearLastAlert = useCallback(() => {
    setLastAlertBoxId(null);
  }, [setLastAlertBoxId]);

  // 核心事件：放入 / 領取 / 標記異常
  const logEvent = useCallback(
    ({ boxId, type, note }) => {
      if (!boxId || !type) return;

      const iso = new Date().toISOString();

      // 1) 更新箱子狀態 + 寫入本機
      let updatedBoxRef = null;
      setBoxes((prev) => {
        const next = prev.map((box) => {
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
        });

        AsyncStorage.setItem(
          STORAGE_KEYS.BOXES,
          JSON.stringify(next),
        ).catch(() => {});

        return next;
      });

      // 2) 新增歷史紀錄 + 寫入本機
      setHistory((prev) => {
        const box =
          updatedBoxRef ||
          boxes.find((b) => b.id === boxId) ||
          null;
        const user = currentUser;

        const record = {
          id: `ev-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 6)}`,
          boxId,
          boxName: box?.name || boxId,
          userId: user?.id || null,
          userName: user?.name || '未知使用者',
          type,
          note: note || '',
          timestamp: iso,
          dateLabel: buildDateLabel(iso),
        };

        const nextHistory = [record, ...prev];

        AsyncStorage.setItem(
          STORAGE_KEYS.HISTORY,
          JSON.stringify(nextHistory),
        ).catch(() => {});

        // 異常事件要更新 Banner
        if (type !== 'DELIVERY' && type !== 'PICKUP') {
          setLastAlertBoxId(boxId);
        }

        return nextHistory;
      });
    },
    [boxes, currentUser, setLastAlertBoxId],
  );

  const value = useMemo(
    () => ({
      hydrated,

      boxes,
      history,
      users,

      currentUserId: currentUserIdState,
      setCurrentUserId,
      currentUser,

      abnormalAlertEnabled,
      setAbnormalAlertEnabled,

      lastAlertBoxId,
      showAlertBanner,
      clearLastAlert,

      logEvent,
    }),
    [
      hydrated,
      boxes,
      history,
      users,
      currentUserIdState,
      currentUser,
      abnormalAlertEnabled,
      lastAlertBoxId,
      showAlertBanner,
      setCurrentUserId,
      setAbnormalAlertEnabled,
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
