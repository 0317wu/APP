// src/screens/BoxesScreen.js
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import BaseScreen from '../components/BaseScreen';
import PressableScale from '../components/PressableScale';
import { useThemeColors } from '../theme/ThemeContext';
import { useAppData } from '../data/DataContext';
import { styles as globalStyles } from '../styles';
import { getStatusMeta } from '../utils/boxUtils';
import { formatDateTime } from '../utils/timeUtils';

export default function BoxesScreen() {
  const theme = useThemeColors();
  const navigation = useNavigation();
  const { boxes } = useAppData();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);

  // 目前篩選後的清單
  const filtered = useMemo(() => {
    return boxes.filter((box) => {
      if (statusFilter !== 'ALL' && box.status !== statusFilter) return false;
      if (!search) return true;
      const keyword = search.trim().toLowerCase();
      return (
        box.name.toLowerCase().includes(keyword) ||
        (box.location || '').toLowerCase().includes(keyword) ||
        box.id.toLowerCase().includes(keyword)
      );
    });
  }, [boxes, statusFilter, search]);

  const onRefresh = () => {
    // 未串接 API，這裡只是示意下拉刷新動畫
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  const renderItem = ({ item }) => {
    const meta = getStatusMeta(item.status);
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

    // 狀態 icon 顏色
    const statusIconColor =
      meta.tone === 'success'
        ? theme.success || theme.accent
        : meta.tone === 'danger'
        ? theme.danger
        : theme.accent;

    return (
      <PressableScale
        style={[
          globalStyles.card,
          {
            backgroundColor: theme.card,
            borderColor: theme.cardBorder,
            marginBottom: 12,
          },
        ]}
        onPress={() =>
          navigation.navigate('BoxDetail', { boxId: item.id })
        }
      >
        <View
          style={[
            globalStyles.cardRow,
            { alignItems: 'center' },
          ]}
        >
          {/* 左側 icon */}
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
              size={20}
              color={statusIconColor}
            />
          </View>

          {/* 中間資訊 */}
          <View style={{ flex: 1 }}>
            <Text
              style={[
                globalStyles.cardTitle,
                { color: theme.text },
              ]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <Text
              style={[
                globalStyles.cardSubtitle,
                { color: theme.mutedText },
              ]}
              numberOfLines={1}
            >
              {item.location}
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
              numberOfLines={1}
            >
              更新於 {formatDateTime(item.lastUpdated)}
            </Text>
          </View>

          {/* 右側狀態 + 箭頭 */}
          <View
            style={{
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              height: 40,
            }}
          >
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
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.subtleText}
            />
          </View>
        </View>
      </PressableScale>
    );
  };

  const filterLabel = (() => {
    switch (statusFilter) {
      case 'IN_USE':
        return '使用中的箱子';
      case 'AVAILABLE':
        return '目前可預約的箱子';
      case 'ALERT':
        return '有異常狀態的箱子';
      default:
        return '全部箱子';
    }
  })();

  return (
    <BaseScreen title="所有共享箱" scroll={false}>
      {/* 上方搜尋 + 篩選區塊 */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 8 }}>
        {/* 搜尋列 */}
        <View
          style={[
            globalStyles.cardRow,
            {
              borderRadius: 999,
              paddingHorizontal: 14,
              paddingVertical: 6,
              backgroundColor: theme.card,
              marginBottom: 8,
            },
          ]}
        >
          <Ionicons
            name="search"
            size={18}
            color={theme.mutedText}
          />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="搜尋箱子名稱、位置或編號"
            placeholderTextColor={theme.mutedText}
            style={{
              flex: 1,
              marginLeft: 8,
              fontSize: 14,
              color: theme.text,
            }}
          />
        </View>

        {/* 篩選標題 + 結果數 */}
        <View
          style={[
            globalStyles.sectionTitleRow,
            { marginTop: 8, marginBottom: 4 },
          ]}
        >
          <Text
            style={[
              globalStyles.sectionTitle,
              { fontSize: 16, color: theme.mutedText },
            ]}
          >
            篩選
          </Text>
          <Text
            style={{
              marginLeft: 8,
              fontSize: 12,
              color: theme.subtleText,
            }}
          >
            {filterLabel} · {filtered.length} 個結果
          </Text>
        </View>

        {/* 篩選 pill */}
        <View style={globalStyles.pillRow}>
          {[
            { label: '全部', value: 'ALL' },
            { label: '使用中', value: 'IN_USE' },
            { label: '空閒', value: 'AVAILABLE' },
            { label: '異常', value: 'ALERT' },
          ].map((item) => {
            const active = statusFilter === item.value;
            return (
              <PressableScale
                key={item.value}
                style={[
                  globalStyles.pill,
                  {
                    borderColor: active
                      ? theme.accent
                      : theme.chipBorder,
                    backgroundColor: active
                      ? theme.accentSoft
                      : theme.chipBg,
                  },
                ]}
                onPress={() => setStatusFilter(item.value)}
              >
                <Text
                  style={[
                    globalStyles.pillText,
                    {
                      color: active
                        ? theme.accent
                        : theme.chipText,
                      fontWeight: active ? '600' : '400',
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </PressableScale>
            );
          })}
        </View>
      </View>

      {/* 列表 */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 24,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.accent}
          />
        }
        ListEmptyComponent={
          <View style={globalStyles.listEmptyContainer}>
            <Text
              style={[
                globalStyles.listEmptyText,
                { color: theme.mutedText },
              ]}
            >
              找不到符合條件的共享箱。
            </Text>
          </View>
        }
      />
    </BaseScreen>
  );
}
