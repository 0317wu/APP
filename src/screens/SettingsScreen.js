// src/screens/SettingsScreen.js
// src/screens/SettingsScreen.js
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ✅ 一定要是 ../ 不是 ./
import BaseScreen from '../components/BaseScreen';
import PressableScale from '../components/PressableScale';
import { useThemeColors } from '../theme/ThemeContext';
import { useAppData } from '../data/DataContext';

const USERS = [
  {
    id: 'user-001',
    label: '住戶 A',
    desc: '主要帳號（預設）',
    displayName: '住戶 A',
  },
  {
    id: 'user-002',
    label: '住戶 B',
    desc: '家人 / 室友帳號',
    displayName: '住戶 B',
  },
  {
    id: 'user-003',
    label: '住戶 C',
    desc: '備用帳號 / 測試用',
    displayName: '住戶 C',
  },
];

export default function SettingsScreen() {
  const { theme, role, palette, toggleTheme, toggleRole } =
    useThemeColors();

  const {
    currentUserId,
    setCurrentUserId,
    abnormalAlertEnabled,
    setAbnormalAlertEnabled,
  } = useAppData();

  const isDarkMode = theme === 'dark';
  const isAdmin = role === 'admin';

  const [selectedUser, setSelectedUser] = useState(
    currentUserId || 'user-001'
  );
  const [localAbnormalEnabled, setLocalAbnormalEnabled] =
    useState(
      typeof abnormalAlertEnabled === 'boolean'
        ? abnormalAlertEnabled
        : true
    );

  const roleText = useMemo(
    () => (isAdmin ? '管理員模式' : '一般住戶'),
    [isAdmin]
  );

  const handleSelectUser = (userId) => {
    setSelectedUser(userId);
    if (typeof setCurrentUserId === 'function') {
      setCurrentUserId(userId);
    }
  };

  const handleToggleAbnormal = () => {
    const next = !localAbnormalEnabled;
    setLocalAbnormalEnabled(next);
    if (typeof setAbnormalAlertEnabled === 'function') {
      setAbnormalAlertEnabled(next);
    }
  };

  const handleSwitchRole = (nextRole) => {
    if (typeof toggleRole === 'function') {
      toggleRole(nextRole);
    }
  };

  const handleToggleTheme = () => {
    if (typeof toggleTheme === 'function') {
      toggleTheme();
    }
  };

  return (
    <BaseScreen title="設定">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 外觀與角色 */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: palette.card,
              borderColor: palette.cardBorder,
            },
          ]}
        >
          <Text
            style={[
              styles.cardTitle,
              { color: palette.text },
            ]}
          >
            外觀與角色
          </Text>
          <Text
            style={[
              styles.cardSubtitle,
              { color: palette.subtleText },
            ]}
          >
            自訂深色模式與你目前在系統中的角色身分。
          </Text>

          {/* 深色模式 */}
          <View style={styles.rowBetween}>
            <View style={styles.textBlock}>
              <Text
                style={[styles.label, { color: palette.text }]}
              >
                深色模式
              </Text>
              <Text
                style={[
                  styles.helperText,
                  { color: palette.subtleText },
                ]}
              >
                依個人喜好切換 Light / Dark。
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={handleToggleTheme}
              trackColor={{
                false: '#E5E7EB',
                true: '#93C5FD',
              }}
              thumbColor={isDarkMode ? '#2563EB' : '#FFFFFF'}
            />
          </View>

          <View style={styles.divider} />

          {/* 管理員模式切換 */}
          <View style={styles.rowBetween}>
            <View style={styles.textBlock}>
              <Text
                style={[styles.label, { color: palette.text }]}
              >
                管理員模式
              </Text>
              <Text
                style={[
                  styles.helperText,
                  { color: palette.subtleText },
                ]}
              >
                開啟後可檢視統計與所有箱子的狀態。
              </Text>
            </View>
            <Switch
              value={isAdmin}
              onValueChange={(val) =>
                handleSwitchRole(
                  val ? 'admin' : 'resident'
                )
              }
              trackColor={{
                false: '#E5E7EB',
                true: '#FDBA74',
              }}
              thumbColor={isAdmin ? '#EA580C' : '#FFFFFF'}
            />
          </View>

          <View style={styles.rolePillsRow}>
            <PressableScale
              onPress={() =>
                handleSwitchRole('resident')
              }
              style={[
                styles.rolePill,
                {
                  backgroundColor: !isAdmin
                    ? palette.primarySoft
                    : 'transparent',
                  borderColor: !isAdmin
                    ? palette.primary
                    : palette.cardBorder,
                },
              ]}
            >
              <Text
                style={{
                  color: !isAdmin
                    ? palette.primary
                    : palette.subtleText,
                  fontSize: 13,
                  fontWeight: '500',
                }}
              >
                一般住戶
              </Text>
            </PressableScale>
            <PressableScale
              onPress={() => handleSwitchRole('admin')}
              style={[
                styles.rolePill,
                {
                  backgroundColor: isAdmin
                    ? palette.warningSoft
                    : 'transparent',
                  borderColor: isAdmin
                    ? palette.warning
                    : palette.cardBorder,
                },
              ]}
            >
              <Text
                style={{
                  color: isAdmin
                    ? palette.warning
                    : palette.subtleText,
                  fontSize: 13,
                  fontWeight: '500',
                }}
              >
                管理員
              </Text>
            </PressableScale>
          </View>

          <Text
            style={[
              styles.roleHint,
              { color: palette.subtleText },
            ]}
          >
            目前身分：{roleText}
          </Text>
        </View>

        {/* 使用者帳號 */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: palette.card,
              borderColor: palette.cardBorder,
            },
          ]}
        >
          <Text
            style={[
              styles.cardTitle,
              { color: palette.text },
            ]}
          >
            使用者帳號
          </Text>
          <Text
            style={[
              styles.cardSubtitle,
              { color: palette.subtleText },
            ]}
          >
            可在住戶 A / B / C 之間切換，模擬不同成員的使用情境。
          </Text>

          {USERS.map((u) => {
            const active = selectedUser === u.id;
            return (
              <TouchableOpacity
                key={u.id}
                onPress={() =>
                  handleSelectUser(u.id)
                }
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.userRow,
                    {
                      borderColor: active
                        ? palette.primary
                        : 'transparent',
                      backgroundColor: active
                        ? palette.primarySoft
                        : 'transparent',
                    },
                  ]}
                >
                  <View style={styles.userTextBlock}>
                    <Text
                      style={{
                        color: palette.text,
                        fontSize: 15,
                        fontWeight: '500',
                      }}
                    >
                      {u.label}
                    </Text>
                    <Text
                      style={{
                        color: palette.subtleText,
                        fontSize: 13,
                        marginTop: 2,
                      }}
                    >
                      {u.desc}
                    </Text>
                  </View>
                  {active && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={palette.primary}
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 系統提醒 */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: palette.card,
              borderColor: palette.cardBorder,
            },
          ]}
        >
          <Text
            style={[
              styles.cardTitle,
              { color: palette.text },
            ]}
          >
            系統提醒
          </Text>
          <Text
            style={[
              styles.cardSubtitle,
              { color: palette.subtleText },
            ]}
          >
            控制是否顯示共享箱異常的警示 Banner。
          </Text>

          <View style={styles.rowBetween}>
            <View style={styles.textBlock}>
              <Text
                style={[styles.label, { color: palette.text }]}
              >
                顯示異常警示
              </Text>
              <Text
                style={[
                  styles.helperText,
                  { color: palette.subtleText },
                ]}
              >
                包含震動、開門異常、逾時未取等。
              </Text>
            </View>
            <Switch
              value={localAbnormalEnabled}
              onValueChange={handleToggleAbnormal}
              trackColor={{
                false: '#E5E7EB',
                true: '#FCA5A5',
              }}
              thumbColor={
                localAbnormalEnabled
                  ? '#DC2626'
                  : '#FFFFFF'
              }
            />
          </View>
        </View>
      </ScrollView>
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 32,
  },
  card: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    marginBottom: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  textBlock: {
    flex: 1,
    paddingRight: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
    opacity: 0.6,
  },
  rolePillsRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  rolePill: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  roleHint: {
    fontSize: 12,
    marginTop: 8,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  userTextBlock: {
    flex: 1,
  },
});
