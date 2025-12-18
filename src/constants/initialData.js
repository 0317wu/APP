// src/constants/initialData.js

export const INITIAL_USERS = [
  { id: 'user-001', name: '住戶 A' },
  { id: 'user-002', name: '住戶 B' },
  { id: 'user-003', name: '住戶 C' },
];

export const INITIAL_BOXES = [
  {
    id: 'BOX-A',
    name: 'A 號箱',
    location: '一樓 電梯旁',
    status: 'IN_USE', // AVAILABLE | IN_USE | ALERT
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'BOX-B',
    name: 'B 號箱',
    location: '一樓 管理室旁',
    status: 'AVAILABLE',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'BOX-C',
    name: 'C 號箱',
    location: 'B1 機車停車區',
    status: 'ALERT',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'BOX-D',
    name: 'D 號箱',
    location: '二樓 走廊',
    status: 'AVAILABLE',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'BOX-E',
    name: 'E 號箱',
    location: '三樓 茶水間旁',
    status: 'IN_USE',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'BOX-F',
    name: 'F 號箱',
    location: '頂樓 入口',
    status: 'AVAILABLE',
    lastUpdated: new Date().toISOString(),
  },
];

// 初始先空，之後由使用者「真實輸入」產生
export const INITIAL_HISTORY = [];
