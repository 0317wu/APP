// src/screens/AnalyticsScreen.js
import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';

import BaseScreen from '../components/BaseScreen';
import { useThemeColors } from '../theme/ThemeContext';
import { useAppData } from '../data/DataContext';
import { styles as globalStyles } from '../styles';
import { getTimeOfDayBucket } from '../utils/timeUtils';

export default function AnalyticsScreen() {
  const theme = useThemeColors();
  const { boxes, history, users } = useAppData();

  // 保險：history 不是陣列就當作空陣列
  const historySafe = Array.isArray(history) ? history : [];

  // 統計核心：依箱子 / 使用者 / 時段
  const { byBox, byUser, byTimeOfDay, totalEvents } = useMemo(() => {
    const byBox = {};
    const byUser = {};
    const byTimeOfDay = {};

    historySafe.forEach((h) => {
      // 箱子統計
      if (h.boxId) {
        byBox[h.boxId] = (byBox[h.boxId] || 0) + 1;
      }

      // 使用者統計
      if (h.userId) {
        byUser[h.userId] = (byUser[h.userId] || 0) + 1;
      }

      // 時段統計
      if (h.timestamp) {
        const bucket = getTimeOfDayBucket(h.timestamp);
        if (bucket) {
          byTimeOfDay[bucket] = (byTimeOfDay[bucket] || 0) + 1;
        }
      }
    });

    return {
      byBox,
      byUser,
      byTimeOfDay,
      totalEvents: historySafe.length,
    };
  }, [historySafe]);

  const maxBoxCount =
    Object.values(byBox).reduce(
      (m, v) => Math.max(m, v),
      0,
    ) || 1;
  const maxUserCount =
    Object.values(byUser).reduce(
      (m, v) => Math.max(m, v),
      0,
    ) || 1;
  const maxTimeCount =
    Object.values(byTimeOfDay).reduce(
      (m, v) => Math.max(m, v),
      0,
    ) || 1;

  const boxName = (boxId) =>
    boxes.find((b) => b.id === boxId)?.name || boxId;
  const userName = (userId) =>
    users.find((u) => u.id === userId)?.name ||
    users.find((u) => u.id === userId)?.label ||
    userId;

  const scopeText = '目前顯示：所有住戶的使用紀錄（管理員專用）';

  const renderBarRow = (label, value, max) => {
    const ratio = max === 0 ? 0 : value / max;
    return (
      <View key={label} style={globalStyles.barRow}>
        <Text
          style={[
            globalStyles.barLabel,
            { color: theme.mutedText },
          ]}
        >
          {label}
        </Text>
        <View
          style={[
            globalStyles.barTrack,
            { backgroundColor: theme.card },
          ]}
        >
          <View
            style={[
              globalStyles.barFill,
              {
                width: `${ratio * 100}%`,
                backgroundColor: theme.accent,
              },
            ]}
          />
        </View>
        <Text
          style={[
            globalStyles.cardSubtitle,
            {
              marginLeft: 8,
              color: theme.mutedText,
            },
          ]}
        >
          {value}
        </Text>
      </View>
    );
  };

  return (
    <BaseScreen title="使用統計">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={globalStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 範圍說明 + 指標 */}
        <View
          style={[
            globalStyles.card,
            {
              backgroundColor: theme.card,
              marginBottom: 16,
            },
          ]}
        >
          <View style={globalStyles.sectionTitleRow}>
            <Text
              style={[
                globalStyles.sectionTitle,
                { color: theme.text },
              ]}
            >
              檢視範圍
            </Text>
          </View>
          <Text
            style={[
              globalStyles.cardSubtitle,
              { color: theme.mutedText },
            ]}
          >
            {scopeText}
          </Text>

          <View
            style={[
              globalStyles.metricRow,
              { marginTop: 12 },
            ]}
          >
            <View
              style={[
                globalStyles.metricCard,
                { backgroundColor: theme.card, flex: 1 },
              ]}
            >
              <Text
                style={[
                  globalStyles.metricLabel,
                  { color: theme.mutedText },
                ]}
              >
                統計事件數
              </Text>
              <Text
                style={[
                  globalStyles.metricValue,
                  { color: theme.text },
                ]}
              >
                {totalEvents}
              </Text>
            </View>

            <View
              style={[
                globalStyles.metricCard,
                { backgroundColor: theme.card, flex: 1 },
              ]}
            >
              <Text
                style={[
                  globalStyles.metricLabel,
                  { color: theme.mutedText },
                ]}
              >
                涉及箱子
              </Text>
              <Text
                style={[
                  globalStyles.metricValue,
                  { color: theme.text },
                ]}
              >
                {Object.keys(byBox).length}
              </Text>
            </View>

            <View
              style={[
                globalStyles.metricCard,
                { backgroundColor: theme.card, flex: 1 },
              ]}
            >
              <Text
                style={[
                  globalStyles.metricLabel,
                  { color: theme.mutedText },
                ]}
              >
                參與住戶
              </Text>
              <Text
                style={[
                  globalStyles.metricValue,
                  { color: theme.text },
                ]}
              >
                {Object.keys(byUser).length}
              </Text>
            </View>
          </View>
        </View>

        {/* 依共享箱 */}
        <View style={globalStyles.sectionTitleRow}>
          <Text
            style={[
              globalStyles.sectionTitle,
              { color: theme.text },
            ]}
          >
            依共享箱
          </Text>
          <Text
            style={[
              globalStyles.sectionHint,
              { color: theme.mutedText },
            ]}
          >
            哪些箱子被使用得最多？
          </Text>
        </View>

        {Object.keys(byBox).length === 0 ? (
          <View style={globalStyles.listEmptyContainer}>
            <Text
              style={[
                globalStyles.listEmptyText,
                { color: theme.mutedText },
              ]}
            >
              尚無資料可分析。
            </Text>
          </View>
        ) : (
          <View
            style={[
              globalStyles.card,
              { backgroundColor: theme.background },
            ]}
          >
            {Object.entries(byBox).map(([id, count]) =>
              renderBarRow(
                boxName(id),
                count,
                maxBoxCount,
              ),
            )}
          </View>
        )}

        {/* 依住戶 */}
        <View style={globalStyles.sectionTitleRow}>
          <Text
            style={[
              globalStyles.sectionTitle,
              { color: theme.text },
            ]}
          >
            依住戶
          </Text>
          <Text
            style={[
              globalStyles.sectionHint,
              { color: theme.mutedText },
            ]}
          >
            哪位住戶最常使用共享箱？
          </Text>
        </View>

        {Object.keys(byUser).length === 0 ? (
          <View style={globalStyles.listEmptyContainer}>
            <Text
              style={[
                globalStyles.listEmptyText,
                { color: theme.mutedText },
              ]}
            >
              尚無資料可分析。
            </Text>
          </View>
        ) : (
          <View
            style={[
              globalStyles.card,
              { backgroundColor: theme.background },
            ]}
          >
            {Object.entries(byUser).map(([id, count]) =>
              renderBarRow(
                userName(id),
                count,
                maxUserCount,
              ),
            )}
          </View>
        )}

        {/* 依時段 */}
        <View style={globalStyles.sectionTitleRow}>
          <Text
            style={[
              globalStyles.sectionTitle,
              { color: theme.text },
            ]}
          >
            依時段
          </Text>
          <Text
            style={[
              globalStyles.sectionHint,
              { color: theme.mutedText },
            ]}
          >
            一天中什麼時間最常收發包裹？
          </Text>
        </View>

        {Object.keys(byTimeOfDay).length === 0 ? (
          <View style={globalStyles.listEmptyContainer}>
            <Text
              style={[
                globalStyles.listEmptyText,
                { color: theme.mutedText },
              ]}
            >
              尚無資料可分析。
            </Text>
          </View>
        ) : (
          <View
            style={[
              globalStyles.card,
              { backgroundColor: theme.background },
            ]}
          >
            {['早上', '下午', '晚上', '深夜'].map(
              (bucket) => {
                const count =
                  byTimeOfDay[bucket] || 0;
                return renderBarRow(
                  bucket,
                  count,
                  maxTimeCount,
                );
              },
            )}
          </View>
        )}
      </ScrollView>
    </BaseScreen>
  );
}
