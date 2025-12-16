// src/screens/BoxDetailScreen.js
import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';

import BaseScreen from '../components/BaseScreen';
import PressableScale from '../components/PressableScale';
import { useThemeColors } from '../theme/ThemeContext';
import { useAppData } from '../data/DataContext';
import { styles as globalStyles } from '../styles';
import { getStatusMeta } from '../utils/boxUtils';
import { formatDateTime } from '../utils/timeUtils';

export default function BoxDetailScreen() {
  const theme = useThemeColors();
  const route = useRoute();
  const { boxId } = route.params ?? {};
  const { boxes, logEvent } = useAppData();

  const box = boxes.find((b) => b.id === boxId);

  if (!box) {
    return (
      <BaseScreen title="箱子詳情" showBack>
        <View style={globalStyles.listEmptyContainer}>
          <Text
            style={[
              globalStyles.listEmptyText,
              { color: theme.mutedText },
            ]}
          >
            找不到此共享箱。
          </Text>
        </View>
      </BaseScreen>
    );
  }

  const meta = getStatusMeta(box.status);
  const badgeBg =
    meta.tone === 'success'
      ? theme.accentSoft
      : meta.tone === 'danger'
      ? theme.dangerSoft
      : theme.chipBg;
  const badgeColor =
    meta.tone === 'success'
      ? theme.accent
      : meta.tone === 'danger'
      ? theme.danger
      : theme.chipText;

  const handleDelivery = () => {
    logEvent({ boxId: box.id, type: 'DELIVERY', note: '' });
  };

  const handlePickup = () => {
    logEvent({ boxId: box.id, type: 'PICKUP', note: '' });
  };

  const handleAlert = () => {
    logEvent({
      boxId: box.id,
      type: 'ALERT',
      note: '手動標記異常',
    });
  };

  return (
    <BaseScreen title={box.name} showBack>
      {/* 上方箱子資訊卡片 */}
      <View
        style={[
          globalStyles.card,
          {
            backgroundColor: theme.card,
            borderColor: theme.cardBorder,
          },
        ]}
      >
        <View style={globalStyles.cardRow}>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                globalStyles.cardTitle,
                { color: theme.text },
              ]}
            >
              {box.name}
            </Text>
            <Text
              style={[
                globalStyles.cardSubtitle,
                { color: theme.mutedText },
              ]}
            >
              {box.location}
            </Text>
            <Text
              style={[
                globalStyles.cardSubtitle,
                { color: theme.mutedText, marginTop: 4 },
              ]}
            >
              上次更新：{formatDateTime(box.lastUpdated)}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <View
              style={[
                globalStyles.statusBadge,
                { backgroundColor: badgeBg },
              ]}
            >
              <Text
                style={[
                  globalStyles.statusBadgeText,
                  { color: badgeColor },
                ]}
              >
                {meta.label}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 快速操作區塊標題 */}
      <View style={globalStyles.sectionHeader}>
        <Text
          style={[
            globalStyles.sectionTitle,
            { color: theme.text },
          ]}
        >
          快速操作（模擬事件）
        </Text>
        <Text
          style={[
            globalStyles.sectionHint,
            { color: theme.mutedText },
          ]}
        >
          方便在沒有實體硬體時，直接模擬真實情境。
        </Text>
      </View>

      {/* ✅ 全新卡片式按鈕 UI */}
      <View style={globalStyles.quickActionsContainer}>
        {/* 放入包裹 */}
        <PressableScale
          style={[
            globalStyles.quickActionCard,
            {
              backgroundColor: theme.accentSoft,
              borderColor: theme.accent,
            },
          ]}
          onPress={handleDelivery}
        >
          <View
            style={[
              globalStyles.quickActionIconWrapper,
              { backgroundColor: 'rgba(37,99,235,0.12)' },
            ]}
          >
            <Ionicons
              name="cube-outline"
              size={20}
              color={theme.accent}
            />
          </View>
          <View style={globalStyles.quickActionTextWrapper}>
            <Text
              style={[
                globalStyles.quickActionTitle,
                { color: theme.text },
              ]}
            >
              放入包裹（模擬）
            </Text>
            <Text
              style={[
                globalStyles.quickActionSubtitle,
                { color: theme.mutedText },
              ]}
              numberOfLines={2}
            >
              模擬外送員或管理員將餐點放入共享箱。
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={theme.subtleText}
          />
        </PressableScale>

        {/* 領取完成 */}
        <PressableScale
          style={[
            globalStyles.quickActionCard,
            {
              backgroundColor: 'rgba(34,197,94,0.08)',
              borderColor: theme.success,
            },
          ]}
          onPress={handlePickup}
        >
          <View
            style={[
              globalStyles.quickActionIconWrapper,
              { backgroundColor: 'rgba(34,197,94,0.14)' },
            ]}
          >
            <Ionicons
              name="checkmark-done-outline"
              size={20}
              color={theme.success}
            />
          </View>
          <View style={globalStyles.quickActionTextWrapper}>
            <Text
              style={[
                globalStyles.quickActionTitle,
                { color: theme.text },
              ]}
            >
              領取完成（模擬）
            </Text>
            <Text
              style={[
                globalStyles.quickActionSubtitle,
                { color: theme.mutedText },
              ]}
              numberOfLines={2}
            >
              模擬住戶已到場領取，箱子恢復為可預約狀態。
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={theme.subtleText}
          />
        </PressableScale>

        {/* 標記異常 */}
        <PressableScale
          style={[
            globalStyles.quickActionCard,
            {
              backgroundColor: theme.dangerSoft,
              borderColor: theme.danger,
            },
          ]}
          onPress={handleAlert}
        >
          <View
            style={[
              globalStyles.quickActionIconWrapper,
              { backgroundColor: 'rgba(220,38,38,0.16)' },
            ]}
          >
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={theme.danger}
            />
          </View>
          <View style={globalStyles.quickActionTextWrapper}>
            <Text
              style={[
                globalStyles.quickActionTitle,
                { color: theme.danger },
              ]}
            >
              標記異常（模擬）
            </Text>
            <Text
              style={[
                globalStyles.quickActionSubtitle,
                { color: theme.mutedText },
              ]}
              numberOfLines={2}
            >
              當發現震動、開門異常等情況時，手動標記為異常。
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={theme.subtleText}
          />
        </PressableScale>
      </View>
    </BaseScreen>
  );
}
