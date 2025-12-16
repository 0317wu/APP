// src/styles.js
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
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
  scrollContent: {
    paddingBottom: 24,
  },

  // 共用卡片
  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },

  // Banner
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    marginBottom: 16,
  },
  bannerText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    lineHeight: 18,
  },

  // 小圓角 chip
  chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // 指標卡
  metricRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  metricLabel: {
    marginTop: 4,
    fontSize: 12,
  },

  // Sections
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  sectionHint: {
    marginLeft: 6,
    fontSize: 12,
  },

  // ✅ 新增：Section header（BoxDetail 用）
  sectionHeader: {
    marginTop: 16,
    marginBottom: 10,
  },

  // 搜尋列 / pill
  pillRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    marginRight: 8,
  },
  pillText: {
    fontSize: 12,
  },
  pillTextActive: {
    fontWeight: '600',
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    marginLeft: 6,
  },

  // Box 狀態 badge
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },

  // list 空畫面
  listEmptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  listEmptyText: {
    fontSize: 13,
  },

  // Analytics bar
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  barLabel: {
    width: 70,
    fontSize: 11,
  },
  barTrack: {
    flex: 1,
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
  },

  // Settings 專用
  settingsCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  settingsTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingsTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  settingsSubtitle: {
    fontSize: 12,
  },

  // ✅ 新增：BoxDetail 快速操作卡片
  quickActionsContainer: {
    marginBottom: 24,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    marginBottom: 10,
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
