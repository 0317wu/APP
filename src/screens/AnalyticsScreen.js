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
  const { boxes, history, users, isAdminMode, currentUser } = useAppData();

  // ✔ 管理員看全部，一般住戶只看自己的紀錄
  const scopedHistory = useMemo(() => {
    if (isAdminMode) return history;
    if (!currentUser) return [];
    return history.filter((h) => h.userId === currentUser.id);
  }, [history, isAdminMode, currentUser]);

  const { byBox, byUser, byTimeOfDay, totalEvents } = useMemo(() => {
    const byBox = {};
    const byUser = {};
    const byTimeOfDay = {};
    const totalEvents = scopedHistory.length;

    scopedHistory.forEach((h) => {
      if (!h.boxId) return;
      byBox[h.boxId] = (byBox[h.boxId] || 0) + 1;
      if (h.userId) {
        byUser[h.userId] = (byUser[h.userId] || 0) + 1;
      }
      const bucket = getTimeOfDayBucket(h.timestamp);
      byTimeOfDay[bucket] = (byTimeOfDay[bucket] || 0) + 1;
    });

    return { byBox, byUser, byTimeOfDay, totalEvents };
  }, [scopedHistory]);

  const maxBoxCount =
    Object.values(byBox).reduce((m, v) => Math.max(m, v), 0) || 1;
  const maxUserCount =
    Object.values(byUser).reduce((m, v) => Math.max(m, v), 0) || 1;
  const maxTimeCount =
    Object.values(byTimeOfDay).reduce((m, v) => Math.max(m, v), 0) || 1;

  const boxName = (boxId) =>
    boxes.find((b) => b.id === boxId)?.name || boxId;
  const userName = (userId) =>
    users.find((u) => u.id === userId)?.name || userId;

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

  const scopeText = isAdminMode
    ? '目前為「管理員模式」，統計包含所有住戶與所有共享箱的使用紀錄。'
    : currentUser
    ? `目前為「一般使用者模式」，只顯示 ${currentUser.name} 的使用紀錄。`
    : '目前為「一般使用者模式」，只顯示當前住戶的使用紀錄。';

  return (
    <BaseScreen title="使用統計">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            globalStyles.card,
            {
              backgroundColor: theme.card,
              marginBottom: 16,
            },
          ]}
        >
          <Text
            style={[
              globalStyles.cardTitle,
              { color: theme.text, marginBottom: 4 },
            ]}
          >
            檢視範圍
          </Text>
          <Text
            style={[
              globalStyles.cardSubtitle,
              { color: theme.mutedText },
            ]}
          >
            {scopeText}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
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

        {/* 依共享箱 */}
        <View style={globalStyles.sectionHeader}>
          <Text
            style={[
              globalStyles.sectionTitle,
              { color: theme.text },
            ]}
          >
            依共享箱
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
              尚無資料可分析，請先在共享箱進行幾次操作。
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
              renderBarRow(boxName(id), count, maxBoxCount),
            )}
          </View>
        )}

        {/* 依住戶 */}
        <View style={globalStyles.sectionHeader}>
          <Text
            style={[
              globalStyles.sectionTitle,
              { color: theme.text },
            ]}
          >
            依住戶
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
              renderBarRow(userName(id), count, maxUserCount),
            )}
          </View>
        )}

        {/* 依時間區段 */}
        <View style={globalStyles.sectionHeader}>
          <Text
            style={[
              globalStyles.sectionTitle,
              { color: theme.text },
            ]}
          >
            依時間區間
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
            {['早上', '下午', '晚上', '深夜'].map((bucket) => {
              const count = byTimeOfDay[bucket] || 0;
              return renderBarRow(bucket, count, maxTimeCount);
            })}
          </View>
        )}
      </ScrollView>
    </BaseScreen>
  );
}
