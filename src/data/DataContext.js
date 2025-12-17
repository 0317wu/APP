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
  ADMIN_PIN: '@iot_app/adminPin',
  HAS_SEEN_ONBOARDING: '@iot_app/hasSeenOnboarding',
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

// 亂數工具
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomChoice(arr) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

// 產生 Demo 資料：覆蓋 boxes / history
function generateDemoData(baseBoxes, users, days = 7) {
  const now = new Date();

  // 重設箱子
  const boxMap = new Map();
  (baseBoxes || []).forEach((box) => {
    boxMap.set(box.id, {
      ...box,
      status: 'AVAILABLE',
      lastUpdated: now.toISOString(),
      lastEventType: null,
      lastNote: '',
      // 保留 isFavorite 設定
      isFavorite: !!box.isFavorite,
    });
  });

  const history = [];
  let lastAlertBoxId = null;

  const TYPES = ['DELIVERY', 'PICKUP', 'ALERT'];

  for (let d = 0; d < days; d += 1) {
    const eventsThisDay = randomInt(2, 6);
    for (let i = 0; i < eventsThisDay; i += 1) {
      const box = randomChoice(baseBoxes);
      const user = randomChoice(users);
      if (!box || !user) continue;

      const hours = randomInt(8, 22);
      const mins = randomInt(0, 59);
      const demoDate = new Date(now);
      demoDate.setDate(now.getDate() - d);
      demoDate.setHours(hours, mins, randomInt(0, 59), 0);

      const timestamp = demoDate.toISOString();
      const type = randomChoice(TYPES);

      // 更新箱子最後狀態
      const prevBox = boxMap.get(box.id) || box;
      let status = prevBox.status;
      if (type === 'DELIVERY') status = 'IN_USE';
      else if (type === 'PICKUP') status = 'AVAILABLE';
      else status = 'ALERT';

      boxMap.set(box.id, {
        ...prevBox,
        status,
        lastUpdated: timestamp,
        lastEventType: type,
        lastNote:
          type === 'ALERT'
            ? '偵測到異常震動 / 長時間未取'
            : '',
      });

      if (type === 'ALERT') {
        lastAlertBoxId = box.id;
      }

      history.push({
        id: `demo-${d}-${i}-${box.id}`,
        boxId: box.id,
        boxName: box.name,
        userId: user.id,
        userName: user.name,
        type,
        note:
          type === 'DELIVERY'
            ? '物流已放入包裹'
            : type === 'PICKUP'
            ? '住戶已完成領取'
            : '系統偵測異常事件',
        timestamp,
        dateLabel: buildDateLabel(timestamp),
      });
    }
  }

  history.sort((a, b) =>
    a.timestamp < b.timestamp ? 1 : -1,
  );

  const boxes = Array.from(boxMap.values());
  return { boxes, history, lastAlertBoxId };
}

export function DataProvider({ children }) {
  const [boxes, setBoxes] = useState(
    (INITIAL_BOXES || []).map((b) => ({
      ...b,
      isFavorite: !!b.isFavorite,
    })),
  );
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
  const [
    abnormalAlertEnabledState,
    setAbnormalAlertEnabledState,
  ] = useState(true);
  const [lastAlertBoxIdState, setLastAlertBoxIdState] =
    useState(null);

  const [hydrated, setHydrated] = useState(false);

  const [adminPinState, setAdminPinState] = useState(null);
  const [
    hasSeenOnboardingState,
    setHasSeenOnboardingState,
  ] = useState(false);

  // 啟動時載入本機資料
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
              setBoxes(
                parsed.map((b) => ({
                  ...b,
                  isFavorite: !!b.isFavorite,
                })),
              );
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

        if (map[STORAGE_KEYS.ADMIN_PIN]) {
          setAdminPinState(map[STORAGE_KEYS.ADMIN_PIN]);
        }

        if (
          typeof map[STORAGE_KEYS.HAS_SEEN_ONBOARDING] ===
          'string'
        ) {
          setHasSeenOnboardingState(
            map[STORAGE_KEYS.HAS_SEEN_ONBOARDING] ===
              'true',
          );
        }
      } catch (e) {
        console.warn('載入本機資料失敗：', e);
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

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

  const setAdminPin = useCallback((pinOrNull) => {
    setAdminPinState(pinOrNull || null);
    if (pinOrNull) {
      AsyncStorage.setItem(
        STORAGE_KEYS.ADMIN_PIN,
        pinOrNull,
      ).catch(() => {});
    } else {
      AsyncStorage.removeItem(STORAGE_KEYS.ADMIN_PIN).catch(
        () => {},
      );
    }
  }, []);

  const setHasSeenOnboarding = useCallback((value) => {
    setHasSeenOnboardingState(!!value);
    AsyncStorage.setItem(
      STORAGE_KEYS.HAS_SEEN_ONBOARDING,
      String(!!value),
    ).catch(() => {});
  }, []);

  const currentUser = useMemo(
    () =>
      users.find((u) => u.id === currentUserIdState) || null,
    [users, currentUserIdState],
  );

  const abnormalAlertEnabled = abnormalAlertEnabledState;
  const lastAlertBoxId = lastAlertBoxIdState;
  const adminPin = adminPinState;
  const hasSeenOnboarding = hasSeenOnboardingState;

  const showAlertBanner = useMemo(
    () => abnormalAlertEnabled && !!lastAlertBoxId,
    [abnormalAlertEnabled, lastAlertBoxId],
  );

  const clearLastAlert = useCallback(() => {
    setLastAlertBoxId(null);
  }, [setLastAlertBoxId]);

  // 收藏 / 取消收藏箱子
  const toggleFavoriteBox = useCallback((boxId) => {
    if (!boxId) return;
    setBoxes((prev) => {
      const next = prev.map((box) =>
        box.id === boxId
          ? {
              ...box,
              isFavorite: !box.isFavorite,
            }
          : box,
      );
      AsyncStorage.setItem(
        STORAGE_KEYS.BOXES,
        JSON.stringify(next),
      ).catch(() => {});
      return next;
    });
  }, []);

  // 一般事件（放入 / 領取 / 異常）
  const logEvent = useCallback(
    ({ boxId, type, note }) => {
      if (!boxId || !type) return;

      const iso = new Date().toISOString();
      let updatedBoxRef = null;

      setBoxes((prev) => {
        const next = prev.map((box) => {
          if (box.id !== boxId) return box;

          let status = box.status;
          if (type === 'DELIVERY') status = 'IN_USE';
          else if (type === 'PICKUP') status = 'AVAILABLE';
          else status = 'ALERT';

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

      setHistory((prev) => {
        const box = updatedBoxRef;
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

        if (type !== 'DELIVERY' && type !== 'PICKUP') {
          setLastAlertBoxId(boxId);
        }

        return nextHistory;
      });
    },
    [currentUser, setLastAlertBoxId],
  );

  // Demo 模式：產生模擬資料
  const seedDemoData = useCallback(() => {
    const baseBoxes =
      (INITIAL_BOXES && INITIAL_BOXES.length
        ? INITIAL_BOXES
        : boxes) || [];
    if (!baseBoxes.length || !users.length) return;

    const {
      boxes: demoBoxes,
      history: demoHistory,
      lastAlertBoxId,
    } = generateDemoData(baseBoxes, users, 7);

    const firstUserId =
      users[0]?.id || currentUserIdState || 'user-001';

    setBoxes(
      demoBoxes.map((b) => ({
        ...b,
        isFavorite: !!b.isFavorite,
      })),
    );
    setHistory(demoHistory);
    setCurrentUserId(firstUserId);
    setAbnormalAlertEnabled(true);
    setLastAlertBoxId(lastAlertBoxId || null);

    const items = [
      [
        STORAGE_KEYS.BOXES,
        JSON.stringify(
          demoBoxes.map((b) => ({
            ...b,
            isFavorite: !!b.isFavorite,
          })),
        ),
      ],
      [
        STORAGE_KEYS.HISTORY,
        JSON.stringify(demoHistory),
      ],
      [STORAGE_KEYS.CURRENT_USER_ID, firstUserId],
      [STORAGE_KEYS.ABNORMAL_ALERT, 'true'],
    ];
    if (lastAlertBoxId) {
      items.push([
        STORAGE_KEYS.LAST_ALERT_BOX_ID,
        lastAlertBoxId,
      ]);
    } else {
      AsyncStorage.removeItem(
        STORAGE_KEYS.LAST_ALERT_BOX_ID,
      ).catch(() => {});
    }

    AsyncStorage.multiSet(items).catch(() => {});
  }, [
    boxes,
    users,
    currentUserIdState,
    setCurrentUserId,
    setAbnormalAlertEnabled,
    setLastAlertBoxId,
  ]);

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
      seedDemoData,

      toggleFavoriteBox,

      adminPin,
      setAdminPin,

      hasSeenOnboarding,
      setHasSeenOnboarding,
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
      seedDemoData,
      toggleFavoriteBox,
      adminPin,
      setAdminPin,
      hasSeenOnboarding,
      setHasSeenOnboarding,
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
