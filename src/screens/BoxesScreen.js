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

    return (
      <PressableScale
        style={[
          globalStyles.card,
          { backgroundColor: theme.card },
        ]}
        onPress={() => navigation.navigate('BoxDetail', { boxId: item.id })}
      >
        <View style={globalStyles.cardRow}>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                globalStyles.cardTitle,
                { color: theme.text },
              ]}
            >
              {item.name}
            </Text>
            <Text
              style={[
                globalStyles.cardSubtitle,
                { color: theme.mutedText },
              ]}
            >
              {item.location}
            </Text>
            <Text
              style={[
                globalStyles.cardSubtitle,
                { color: theme.mutedText, marginTop: 4 },
              ]}
            >
              更新於 {formatDateTime(item.lastUpdated)}
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
      </PressableScale>
    );
  };

  return (
    <BaseScreen title="所有共享箱" scroll={false}>
      <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
        <View
          style={[
            globalStyles.cardRow,
            {
              borderRadius: 999,
              paddingHorizontal: 14,
              paddingVertical: 6,
              backgroundColor: theme.card,
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

        <View style={[globalStyles.sectionHeader, { marginTop: 12 }]}>
          <Text
            style={[
              globalStyles.sectionTitle,
              { fontSize: 16, color: theme.mutedText },
            ]}
          >
            篩選
          </Text>
        </View>
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
