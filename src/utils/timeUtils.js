// src/utils/timeUtils.js

export function formatDateTime(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd} ${hh}:${mi}`;
}

export function formatDateLabel(isoString) {
  if (!isoString) return '其他日期';
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return '其他日期';

  const today = new Date();
  const isSame = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (isSame(d, today)) return '今天';
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (isSame(d, yesterday)) return '昨天';

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd}`;
}

export function getTimeOfDayBucket(isoString) {
  if (!isoString) return '其他';
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return '其他';
  const h = d.getHours();
  if (h >= 6 && h < 12) return '早上';
  if (h >= 12 && h < 18) return '下午';
  if (h >= 18 && h < 24) return '晚上';
  return '深夜';
}
