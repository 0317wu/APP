// src/utils/boxUtils.js
import { BOX_STATUS } from '../constants/initialData';
import { formatDateLabel } from './timeUtils';

export const ABNORMAL_TYPES = ['ALERT', 'TIMEOUT', 'VIBRATION_ALERT', 'DOOR_OPEN_ALERT'];

export function isAbnormalEventType(type) {
  return ABNORMAL_TYPES.includes(type);
}

export function getStatusMeta(status) {
  switch (status) {
    case BOX_STATUS.AVAILABLE:
    case 'AVAILABLE':
      return { label: '空閒', tone: 'success' };
    case BOX_STATUS.IN_USE:
    case 'IN_USE':
      return { label: '使用中', tone: 'primary' };
    case BOX_STATUS.ALERT:
    case 'ALERT':
      return { label: '異常', tone: 'danger' };
    default:
      return { label: '未知', tone: 'muted' };
  }
}

// 建立一筆歷史紀錄物件
export function buildHistoryItem({ box, user, type, note, timestamp }) {
  const ts = timestamp || new Date().toISOString();
  return {
    id: `${ts}-${box.id}-${type}-${Math.random().toString(36).slice(2, 8)}`,
    boxId: box.id,
    boxName: box.name,
    userId: user?.id ?? null,
    userName: user?.name ?? '系統',
    type,
    note: note ?? '',
    timestamp: ts,
    dateLabel: formatDateLabel(ts),
  };
}
