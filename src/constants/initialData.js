// src/constants/initialData.js

export const BOX_STATUS = {
  AVAILABLE: 'AVAILABLE',
  IN_USE: 'IN_USE',
  ALERT: 'ALERT',
};

export const EVENT_TYPES = {
  DELIVERY: 'DELIVERY', // 放入包裹
  PICKUP: 'PICKUP',     // 領取完成
  ALERT: 'ALERT',       // 一般異常
};

export const INITIAL_USERS = [
  { id: 'user-001', name: '住戶 A', role: 'resident' },
  { id: 'user-002', name: '住戶 B', role: 'resident' },
  { id: 'user-003', name: '住戶 C', role: 'resident' },
];

const nowIso = new Date().toISOString();

export const INITIAL_BOXES = [
  {
    id: 'BOX-A',
    name: 'A 號箱',
    location: '一樓電梯口',
    status: BOX_STATUS.AVAILABLE,
    lastUpdated: nowIso,
    lastEventType: null,
    currentUserId: null,
  },
  {
    id: 'BOX-B',
    name: 'B 號箱',
    location: '一樓電梯口',
    status: BOX_STATUS.IN_USE,
    lastUpdated: nowIso,
    lastEventType: EVENT_TYPES.DELIVERY,
    currentUserId: 'user-001',
  },
  {
    id: 'BOX-C',
    name: 'C 號箱',
    location: '一樓管理室旁',
    status: BOX_STATUS.AVAILABLE,
    lastUpdated: nowIso,
    lastEventType: null,
    currentUserId: null,
  },
  {
    id: 'BOX-D',
    name: 'D 號箱',
    location: '二樓樓梯口',
    status: BOX_STATUS.ALERT,
    lastUpdated: nowIso,
    lastEventType: EVENT_TYPES.ALERT,
    currentUserId: 'user-002',
  },
  {
    id: 'BOX-E',
    name: 'E 號箱',
    location: '地下一樓車庫入口',
    status: BOX_STATUS.AVAILABLE,
    lastUpdated: nowIso,
    lastEventType: null,
    currentUserId: null,
  },
  {
    id: 'BOX-F',
    name: 'F 號箱',
    location: '地下一樓車庫入口',
    status: BOX_STATUS.AVAILABLE,
    lastUpdated: nowIso,
    lastEventType: null,
    currentUserId: null,
  },
];

// 初始歷史紀錄（可先空，之後由 logEvent() 產生）
export const INITIAL_HISTORY = [];
