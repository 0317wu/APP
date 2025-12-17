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
    isFavorite: false,
  },
  {
    id: 'BOX-B',
    name: 'B 號箱',
    location: '一樓 管理室旁',
    status: 'AVAILABLE',
    lastUpdated: new Date().toISOString(),
    isFavorite: false,
  },
  {
    id: 'BOX-C',
    name: 'C 號箱',
    location: 'B1 機車停車區',
    status: 'ALERT',
    lastUpdated: new Date().toISOString(),
    isFavorite: false,
  },
];

export const INITIAL_HISTORY = [];
