// src/screens/HomeScreen.js
import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import BaseScreen from '../components/BaseScreen';
import PressableScale from '../components/PressableScale';
import { useThemeColors } from '../theme/ThemeContext';
import { useAppData } from '../data/DataContext';
import { styles as globalStyles } from '../styles';

export default function HomeScreen() {
  const theme = useThemeColors();
  const navigation = useNavigation();
  const {
    boxes,
    history,
    showAlertBanner,
    lastAlertBoxId,
    clearLastAlert,
  } = useAppData();

  const stats = useMemo(() => {
    const total = boxes.length;
    const inUse = boxes.filter((b) => b.status === 'IN_USE').length;
    const alerts = boxes.filter((b) => b.status === 'ALERT').length;
    const todayCount = history.filter((h) => h.dateLabel === '今天').length;
    return { total, inUse, alerts, todayCount };
  }, [boxes, history]);

  return (
    <BaseScreen title="共享箱總覽">
      {showAlertBanner && (
        <View
          style={[
            globalStyles.banner,
            { backgroundColor: theme.bannerBg },
          ]}
        >
          <Ionicons name="alert-circle" size={20} color={theme.bannerText} />
          <Text
            style={[
              globalStyles.bannerText,
              { color: theme.bannerText },
            ]}
          >
            有共享箱處於異常狀態
            {lastAlertBoxId ? `（${lastAlertBoxId}）` : ''}，請盡快處理。
          </Text>
          <PressableScale
            onPress={clearLastAlert}
            style={[
              globalStyles.chip,
              {
                borderColor: theme.bannerText,
                backgroundColor: 'transparent',
              },
            ]}
          >
            <Text
              style={[
                globalStyles.chipText,
                { color: theme.bannerText },
              ]}
            >
              已處理
            </Text>
          </PressableScale>
        </View>
      )}

      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          {[
            { label: '箱子總數', value: stats.total, icon: 'cube' },
            { label: '使用中', value: stats.inUse, icon: 'cube-outline' },
            { label: '異常', value: stats.alerts, icon: 'warning' },
          ].map((item) => (
            <View
              key={item.label}
              style={[
                globalStyles.metricCard,
                {
                  backgroundColor: theme.card,
                  flex: 1,
                },
              ]}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Ionicons
                  name={item.icon}
                  size={18}
                  color={theme.mutedText}
                />
                {item.label === '異常' && stats.alerts > 0 && (
                  <View
                    style={[
                      globalStyles.statusBadge,
                      { backgroundColor: theme.dangerSoft },
                    ]}
                  >
                    <Text
                      style={[
                        globalStyles.statusBadgeText,
                        { color: theme.danger },
                      ]}
                    >
                      注意
                    </Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  globalStyles.metricValue,
                  { color: theme.text },
                ]}
              >
                {item.value}
              </Text>
              <Text
                style={[
                  globalStyles.metricLabel,
                  { color: theme.mutedText },
                ]}
              >
                {item.label}
              </Text>
            </View>
          ))}
        </View>

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

        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          <PressableScale
            style={[
              globalStyles.metricCard,
              {
                backgroundColor: theme.accentSoft,
                flex: 1,
              },
            ]}
            onPress={() => navigation.navigate('Boxes')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="cube" size={20} color={theme.accent} />
              <Text
                style={{
                  marginLeft: 8,
                  fontSize: 15,
                  fontWeight: '600',
                  color: theme.accent,
                }}
              >
                查看全部箱子
              </Text>
            </View>
            <Text
              style={{
                marginTop: 8,
                fontSize: 12,
                color: theme.mutedText,
              }}
            >
              即時掌握每一個共享箱的狀態
            </Text>
          </PressableScale>

          <PressableScale
            style={[
              globalStyles.metricCard,
              {
                backgroundColor: theme.card,
                flex: 1,
              },
            ]}
            onPress={() => navigation.navigate('Analytics')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons
                name="stats-chart"
                size={20}
                color={theme.accent}
              />
              <Text
                style={{
                  marginLeft: 8,
                  fontSize: 15,
                  fontWeight: '600',
                  color: theme.text,
                }}
              >
                使用統計
              </Text>
            </View>
            <Text
              style={{
                marginTop: 8,
                fontSize: 12,
                color: theme.mutedText,
              }}
            >
              查看高峰時段、使用頻率與住戶分佈
            </Text>
          </PressableScale>
        </View>

        <View style={globalStyles.sectionHeader}>
          <Text
            style={[
              globalStyles.sectionTitle,
              { color: theme.text },
            ]}
          >
            最近活動
          </Text>
        </View>

        {history.length === 0 ? (
          <View style={globalStyles.listEmptyContainer}>
            <Text
              style={[
                globalStyles.listEmptyText,
                { color: theme.mutedText },
              ]}
            >
              目前還沒有任何使用紀錄。
            </Text>
          </View>
        ) : (
          history.slice(0, 5).map((item) => (
            <View
              key={item.id}
              style={[
                globalStyles.card,
                { backgroundColor: theme.card },
              ]}
            >
              <View style={globalStyles.cardRow}>
                <View>
                  <Text
                    style={[
                      globalStyles.cardTitle,
                      { color: theme.text },
                    ]}
                  >
                    {item.boxName}
                  </Text>
                  <Text
                    style={[
                      globalStyles.cardSubtitle,
                      { color: theme.mutedText },
                    ]}
                  >
                    {item.userName} · {item.dateLabel}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '500',
                    color: theme.accent,
                  }}
                >
                  {item.type === 'DELIVERY'
                    ? '放入包裹'
                    : item.type === 'PICKUP'
                    ? '領取完成'
                    : '異常事件'}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </BaseScreen>
  );
}
