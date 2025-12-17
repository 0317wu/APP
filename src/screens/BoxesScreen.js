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
  const {
    boxes,
    history,
    logEvent,
    toggleFavoriteBox,
    hydrated,
  } = useAppData();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [expandedBoxId, setExpandedBoxId] = useState(null);

  // Skeleton：資料尚未載入
  if (!hydrated) {
    return (
      <BaseScreen title="所有共享箱" scroll={false}>
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 8,
          }}
        >
          {/* 搜尋骨架 */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderRadius: 999,
              paddingHorizontal: 14,
              paddingVertical: 8,
              backgroundColor: theme.card,
              marginBottom: 12,
            }}
          >
            <View
              style={{
                width: 16,
                height: 16,
                borderRadius: 999,
                backgroundColor: theme.cardBorder,
              }}
            />
            <View
              style={{
                flex: 1,
                height: 12,
                borderRadius: 999,
                backgroundColor: theme.cardBorder,
                marginLeft: 8,
              }}
            />
          </View>

          {/* 卡片骨架 */}
          {Array.from({ length: 3 }).map((_, idx) => (
            <View
              key={idx}
              style={[
                globalStyles.card,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.cardBorder,
                },
              ]}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 999,
                    backgroundColor: theme.cardBorder,
                    marginRight: 12,
                  }}
                />
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: theme.cardBorder,
                      marginBottom: 6,
                    }}
                  />
                  <View
                    style={{
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: theme.cardBorder,
                      marginBottom: 4,
                      width: '60%',
                    }}
                  />
                  <View
                    style={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: theme.cardBorder,
                      width: '40%',
                    }}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>
      </BaseScreen>
    );
  }

  // 篩選後的清單
  const filtered = useMemo(() => {
    return boxes.filter((box) => {
      if (statusFilter !== 'ALL' && box.status !== statusFilter)
        return false;
      if (!search) return true;
      const keyword = search.trim().toLowerCase();
      return (
        box.name.toLowerCase().includes(keyword) ||
        (box.location || '').toLowerCase().includes(keyword) ||
        box.id.toLowerCase().includes(keyword)
      );
    });
  }, [boxes, statusFilter, search]);

  // 收藏在前面
  const sorted = useMemo(() => {
    const fav = [];
    const rest = [];
    filtered.forEach((b) => {
      if (b.isFavorite) fav.push(b);
      else rest.push(b);
    });
    return [...fav, ...rest];
  }, [filtered]);

  // 每個箱子最近一次活動
  const lastEventByBoxId = useMemo(() => {
    const map = {};
    (history || []).forEach((h) => {
      if (!map[h.boxId]) {
        map[h.boxId] = h;
      }
    });
    return map;
  }, [history]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  const handleQuickAction = (boxId, type) => {
    if (!logEvent) return;
    let note = '';
    if (type === 'DELIVERY') {
      note = '物流已放入包裹';
    } else if (type === 'PICKUP') {
      note = '住戶已完成領取';
    } else {
      note = '使用者手動標記異常';
    }
    logEvent({ boxId, type, note });
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

    const statusIconColor =
      meta.tone === 'success'
        ? theme.success || theme.accent
        : meta.tone === 'danger'
        ? theme.danger
        : theme.accent;

    const isFavorite = !!item.isFavorite;
    const expanded = expandedBoxId === item.id;
    const lastEvent = lastEventByBoxId[item.id];

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
          setExpandedBoxId(expanded ? null : item.id)
        }
        onLongPress={() => toggleFavoriteBox(item.id)}
      >
        {/* 上方主要資訊列 */}
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
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 2,
              }}
            >
              <Text
                style={[
                  globalStyles.cardTitle,
                  { color: theme.text },
                ]}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              {isFavorite && (
                <Ionicons
                  name="star"
                  size={14}
                  color={theme.accent}
                  style={{ marginLeft: 6 }}
                />
              )}
            </View>
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

          {/* 右側狀態 + 展開箭頭 */}
          <View
            style={{
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              height: 40,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
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
            </View>
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={theme.subtleText}
            />
          </View>
        </View>

        {/* 展開區塊：最近活動 + 快速操作 */}
        {expanded && (
          <View style={{ marginTop: 10 }}>
            {/* 最近一次活動 */}
            {lastEvent ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={theme.mutedText}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={{
                    fontSize: 12,
                    color: theme.mutedText,
                  }}
                  numberOfLines={2}
                >
                  最近活動：{lastEvent.userName} ·{' '}
                  {lastEvent.dateLabel}
                </Text>
              </View>
            ) : (
              <Text
                style={{
                  fontSize: 12,
                  color: theme.mutedText,
                  marginBottom: 8,
                }}
              >
                尚無活動紀錄。
              </Text>
            )}

            {/* 快速操作按鈕 */}
            <View
              style={{
                flexDirection: 'row',
                marginBottom: 4,
              }}
            >
              <PressableScale
                style={[
                  globalStyles.ghostButton,
                  {
                    flex: 1,
                    marginRight: 6,
                    borderColor: theme.cardBorder,
                  },
                ]}
                onPress={() =>
                  handleQuickAction(item.id, 'DELIVERY')
                }
              >
                <Text
                  style={[
                    globalStyles.ghostButtonText,
                    { color: theme.accent, fontSize: 12 },
                  ]}
                >
                  放入包裹
                </Text>
              </PressableScale>

              <PressableScale
                style={[
                  globalStyles.ghostButton,
                  {
                    flex: 1,
                    marginRight: 6,
                    borderColor: theme.cardBorder,
                  },
                ]}
                onPress={() =>
                  handleQuickAction(item.id, 'PICKUP')
                }
              >
                <Text
                  style={[
                    globalStyles.ghostButtonText,
                    { color: theme.accent, fontSize: 12 },
                  ]}
                >
                  領取完成
                </Text>
              </PressableScale>

              <PressableScale
                style={[
                  globalStyles.ghostButton,
                  {
                    flex: 1,
                    borderColor: theme.dangerSoft,
                  },
                ]}
                onPress={() =>
                  handleQuickAction(item.id, 'ALERT')
                }
              >
                <Text
                  style={[
                    globalStyles.ghostButtonText,
                    { color: theme.danger, fontSize: 12 },
                  ]}
                >
                  標記異常
                </Text>
              </PressableScale>
            </View>

            {/* 查看詳細 */}
            <PressableScale
              style={[
                globalStyles.primaryButton,
                {
                  backgroundColor: theme.card,
                  borderWidth: 0,
                  alignSelf: 'flex-start',
                  paddingHorizontal: 0,
                  marginTop: 4,
                },
              ]}
              onPress={() =>
                navigation.navigate('BoxDetail', {
                  boxId: item.id,
                })
              }
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={[
                    globalStyles.primaryButtonText,
                    {
                      color: theme.accent,
                      fontSize: 13,
                    },
                  ]}
                >
                  查看詳情
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={14}
                  color={theme.accent}
                  style={{ marginLeft: 2 }}
                />
              </View>
            </PressableScale>

            <Text
              style={{
                fontSize: 10,
                color: theme.subtleText,
                marginTop: 4,
              }}
            >
              小技巧：長按卡片可加入 / 取消收藏，收藏會排在列表最前面。
            </Text>
          </View>
        )}
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
              alignItems: 'center',
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
            {filterLabel} · {sorted.length} 個結果
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
        data={sorted}
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
