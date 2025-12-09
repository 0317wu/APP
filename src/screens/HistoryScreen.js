// src/screens/HistoryScreen.js
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  SectionList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import BaseScreen from '../components/BaseScreen';
import { useThemeColors } from '../theme/ThemeContext';
import { useAppData } from '../data/DataContext';
import { styles as globalStyles } from '../styles';

function iconForType(type) {
  if (type === 'DELIVERY') return 'download-outline';
  if (type === 'PICKUP') return 'checkmark-done-outline';
  return 'warning-outline';
}

export default function HistoryScreen() {
  const theme = useThemeColors();
  const { history } = useAppData();
  const [typeFilter, setTypeFilter] = useState('ALL');

  const filteredHistory = useMemo(() => {
    if (typeFilter === 'ALL') return history;
    if (typeFilter === 'ALERT') {
      return history.filter((h) => h.type !== 'DELIVERY' && h.type !== 'PICKUP');
    }
    return history.filter((h) => h.type === typeFilter);
  }, [history, typeFilter]);

  const sections = useMemo(() => {
    const map = new Map();
    filteredHistory.forEach((item) => {
      const label = item.dateLabel || '其他日期';
      if (!map.has(label)) {
        map.set(label, []);
      }
      map.get(label).push(item);
    });
    return Array.from(map.entries()).map(([title, data]) => ({
      title,
      data,
    }));
  }, [filteredHistory]);

  return (
    <BaseScreen title="使用紀錄" scroll={false}>
      <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
        <View style={globalStyles.pillRow}>
          {[
            { label: '全部', value: 'ALL' },
            { label: '放入', value: 'DELIVERY' },
            { label: '領取', value: 'PICKUP' },
            { label: '異常', value: 'ALERT' },
          ].map((item) => {
            const active = typeFilter === item.value;
            return (
              <View
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
              >
                <Text
                  onPress={() => setTypeFilter(item.value)}
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
              </View>
            );
          })}
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 24,
        }}
        renderSectionHeader={({ section: { title } }) => (
          <View style={{ marginTop: 16, marginBottom: 6 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: theme.mutedText,
              }}
            >
              {title}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View
            style={[
              globalStyles.card,
              {
                backgroundColor: theme.card,
                marginBottom: 8,
              },
            ]}
          >
            <View style={globalStyles.cardRow}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 999,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.accentSoft,
                  marginRight: 12,
                }}
              >
                <Ionicons
                  name={iconForType(item.type)}
                  size={18}
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
                  {item.boxName}
                </Text>
                <Text
                  style={[
                    globalStyles.cardSubtitle,
                    { color: theme.mutedText },
                  ]}
                >
                  {item.userName}
                </Text>
              </View>
              <Text
                style={[
                  globalStyles.cardSubtitle,
                  { color: theme.mutedText },
                ]}
              >
                {item.timestamp?.slice(11, 16)}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={globalStyles.listEmptyContainer}>
            <Text
              style={[
                globalStyles.listEmptyText,
                { color: theme.mutedText },
              ]}
            >
              目前沒有任何使用紀錄。
            </Text>
          </View>
        }
      />
    </BaseScreen>
  );
}
