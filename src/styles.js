// src/styles.js
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // 共用外層容器
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Header
  header: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  desc: {
    marginTop: 4,
    fontSize: 13,
  },

  // Scroll 內容
  scrollContent: {
    paddingBottom: 24,
  },

  // 卡片
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },

  // 小標籤 / Chip
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // 警示 Banner
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
  },

  // 狀態 Badge
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // 區塊標題（首頁等）
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionHint: {
    fontSize: 12,
  },

  // 指標卡片（Home / Analytics）
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricCard: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 4,
  },
  metricLabel: {
    fontSize: 11,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
  },

  // 主要按鈕 / 次要按鈕
  primaryButton: {
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  ghostButton: {
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginTop: 4,
  },
  ghostButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // 篩選用 pill
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
  },

  // 條狀圖（Analytics 用）
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  barLabel: {
    width: 72,
    fontSize: 12,
  },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
  },

  // 空列表
  listEmptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  listEmptyText: {
    fontSize: 13,
  },

  // 設定頁小標題（如果有用到）
  settingsTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  settingsSubtitle: {
    fontSize: 12,
  },

  // BoxDetail 快速操作用
  quickActionsContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  quickActionIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  quickActionTextWrapper: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickActionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default styles;
