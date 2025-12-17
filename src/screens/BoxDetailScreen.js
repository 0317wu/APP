// src/screens/BoxDetailScreen.js
import React, { useMemo } from 'react';
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
import { useToast } from '../components/ToastContext';

export default function BoxDetailScreen() {
  const theme = useThemeColors();
  const route = useRoute();
  const { boxes, logEvent } = useAppData();
  const { showToast } = useToast();

  const boxId = route.params?.boxId;

  const box = useMemo(
    () => boxes.find((b) => b.id === boxId) || null,
    [boxes, boxId],
  );

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
            找不到這個共享箱，可能已被移除。
          </Text>
        </View>
      </BaseScreen>
    );
  }

  const meta = getStatusMeta(box.status);

  const handleDelivery = () => {
    logEvent({
      boxId: box.id,
      type: 'DELIVERY',
      note: '模擬放入包裹',
    });
    showToast(`已為 ${box.name} 記錄：放入包裹`);
  };

  const handlePickup = () => {
    logEvent({
      boxId: box.id,
      type: 'PICKUP',
      note: '模擬領取完成',
    });
    showToast(`已為 ${box.name} 記錄：領取完成`);
  };

  const handleMarkAbnormal = () => {
    logEvent({
      boxId: box.id,
      type: 'ALERT',
      note: '手動標記異常',
    });
    showToast(`已標記 ${box.name} 為異常狀態`);
  };

  return (
    <BaseScreen title={box.name} showBack>
      {/* 上方狀態卡片 */}
      <View
        style={[
          globalStyles.card,
          {
            backgroundColor: theme.card,
            borderColor: theme.cardBorder,
          },
        ]}
      >
        <View
          style={[
            globalStyles.cardRow,
            { alignItems: 'center' },
          ]}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
              backgroundColor: theme.background,
            }}
          >
            <Ionicons
              name="cube-outline"
              size={22}
              color={theme.accent}
            />
          </View>

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
                {
                  color: theme.subtleText,
                  marginTop: 4,
                  fontSize: 11,
                },
              ]}
            >
              最後更新：{formatDateTime(box.lastUpdated)}
            </Text>
          </View>

          <View>
            <View
              style={[
                globalStyles.statusBadge,
                {
                  backgroundColor:
                    meta.tone === 'success'
                      ? theme.accentSoft
                      : meta.tone === 'danger'
                      ? theme.dangerSoft
                      : theme.chipBg,
                },
              ]}
            >
              <Text
                style={[
                  globalStyles.statusBadgeText,
                  {
                    color:
                      meta.tone === 'success'
                        ? theme.accent
                        : meta.tone === 'danger'
                        ? theme.danger
                        : theme.chipText,
                  },
                ]}
              >
                {meta.label}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 快速操作區塊 */}
      <View style={globalStyles.sectionHeader}>
        <Text
          style={[
            globalStyles.sectionTitle,
            { color: theme.text },
          ]}
        >
          快速操作
        </Text>
      </View>

      <View style={globalStyles.quickActionsContainer}>
        {/* 放入包裹 */}
        <PressableScale
          onPress={handleDelivery}
          style={[
            globalStyles.quickActionCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.cardBorder,
            },
          ]}
        >
          <View
            style={[
              globalStyles.quickActionIconWrapper,
              { backgroundColor: theme.accentSoft },
            ]}
          >
            <Ionicons
              name="download-outline"
              size={18}
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
              模擬放入包裹
            </Text>
            <Text
              style={[
                globalStyles.quickActionSubtitle,
                { color: theme.mutedText },
              ]}
            >
              用來模擬物流將包裹放入共享箱的情境。
            </Text>
          </View>
        </PressableScale>

        {/* 領取完成 */}
        <PressableScale
          onPress={handlePickup}
          style={[
            globalStyles.quickActionCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.cardBorder,
            },
          ]}
        >
          <View
            style={[
              globalStyles.quickActionIconWrapper,
              { backgroundColor: theme.successSoft },
            ]}
          >
            <Ionicons
              name="checkmark-done-outline"
              size={18}
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
              模擬領取完成
            </Text>
            <Text
              style={[
                globalStyles.quickActionSubtitle,
                { color: theme.mutedText },
              ]}
            >
              住戶成功開啟共享箱並完成領取。
            </Text>
          </View>
        </PressableScale>

        {/* 標記異常 */}
        <PressableScale
          onPress={handleMarkAbnormal}
          style={[
            globalStyles.quickActionCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.cardBorder,
            },
          ]}
        >
          <View
            style={[
              globalStyles.quickActionIconWrapper,
              { backgroundColor: theme.dangerSoft },
            ]}
          >
            <Ionicons
              name="alert-circle-outline"
              size={18}
              color={theme.danger}
            />
          </View>
          <View style={globalStyles.quickActionTextWrapper}>
            <Text
              style={[
                globalStyles.quickActionTitle,
                { color: theme.text },
              ]}
            >
              標記異常
            </Text>
            <Text
              style={[
                globalStyles.quickActionSubtitle,
                { color: theme.mutedText },
              ]}
            >
              模擬震動偵測、長時間未取件等異常狀況。
            </Text>
          </View>
        </PressableScale>
      </View>
    </BaseScreen>
  );
}
