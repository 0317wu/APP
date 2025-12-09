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
      <View
        style={[
          globalStyles.card,
          { backgroundColor: theme.card },
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

      <View style={globalStyles.sectionHeader}>
        <Text
          style={[
            globalStyles.sectionTitle,
            { color: theme.text },
          ]}
        >
          快速操作（模擬事件）
        </Text>
      </View>

      <PressableScale
        style={[
          globalStyles.primaryButton,
          { backgroundColor: theme.accent },
        ]}
        onPress={handleDelivery}
      >
        <Text
          style={[
            globalStyles.primaryButtonText,
            { color: '#FFFFFF' },
          ]}
        >
          放入包裹（模擬）
        </Text>
      </PressableScale>

      <PressableScale
        style={[
          globalStyles.ghostButton,
          { borderColor: theme.accent },
        ]}
        onPress={handlePickup}
      >
        <Text
          style={[
            globalStyles.ghostButtonText,
            { color: theme.accent },
          ]}
        >
          領取完成（模擬）
        </Text>
      </PressableScale>

      <PressableScale
        style={[
          globalStyles.ghostButton,
          { borderColor: theme.danger },
        ]}
        onPress={handleAlert}
      >
        <Text
          style={[
            globalStyles.ghostButtonText,
            { color: theme.danger },
          ]}
        >
          標記異常（模擬）
        </Text>
      </PressableScale>
    </BaseScreen>
  );
}
