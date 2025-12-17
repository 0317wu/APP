// src/screens/SettingsScreen.js
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import BaseScreen from '../components/BaseScreen';
import PressableScale from '../components/PressableScale';
import { useThemeColors } from '../theme/ThemeContext';
import { useAppData } from '../data/DataContext';
import { useToast } from '../components/ToastContext';

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
    seedDemoData,
    adminPin,
    setAdminPin,
  } = useAppData();

  const { showToast } = useToast();

  const isDarkMode = theme === 'dark';
  const isAdmin = role === 'admin';
  const hasAdminPin = !!adminPin;

  const [selectedUser, setSelectedUser] = useState(
    currentUserId || 'user-001',
  );
  const [localAbnormalEnabled, setLocalAbnormalEnabled] =
    useState(
      typeof abnormalAlertEnabled === 'boolean'
        ? abnormalAlertEnabled
        : true,
    );

  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [isSettingPin, setIsSettingPin] = useState(false);

  const roleText = useMemo(
    () => (isAdmin ? '管理員模式' : '一般住戶'),
    [isAdmin],
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

  const openPinModalForRole = (nextRole) => {
    if (nextRole === 'resident') {
      // 退回一般模式不需要 PIN
      if (typeof toggleRole === 'function') {
        toggleRole('resident');
      }
      return;
    }

    // 切換到管理員模式
    if (!hasAdminPin) {
      // 第一次：設定 PIN
      setIsSettingPin(true);
      setPinInput('');
      setShowPinModal(true);
    } else {
      // 已有 PIN：驗證 PIN
      setIsSettingPin(false);
      setPinInput('');
      setShowPinModal(true);
    }
  };

  const handleSwitchRole = (nextRole) => {
    if (nextRole === role) return;
    openPinModalForRole(nextRole);
  };

  const handleToggleTheme = () => {
    if (typeof toggleTheme === 'function') {
      toggleTheme();
    }
  };

  const handleSeedDemoData = () => {
    Alert.alert(
      '產生模擬資料',
      '這將覆蓋目前的箱子狀態與歷史紀錄，改為一組示範用資料，確定要繼續嗎？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '確定',
          style: 'destructive',
          onPress: () => {
            if (typeof seedDemoData === 'function') {
              seedDemoData();
              showToast(
                '已產生一組模擬資料，歡迎前往統計頁查看',
              );
            }
          },
        },
      ],
    );
  };

  const handleClosePinModal = () => {
    setShowPinModal(false);
    setPinInput('');
  };

  const handleConfirmPin = () => {
    const input = pinInput.trim();
    if (isSettingPin) {
      if (input.length < 4) {
        showToast('請輸入至少 4 碼數字作為管理員 PIN');
        return;
      }
      setAdminPin(input);
      if (typeof toggleRole === 'function') {
        toggleRole('admin');
      }
      setShowPinModal(false);
      showToast('已設定管理員 PIN，並切換為管理員模式');
    } else {
      if (!hasAdminPin) {
        showToast('尚未設定 PIN，請重新嘗試');
        setShowPinModal(false);
        return;
      }
      if (input === adminPin) {
        if (typeof toggleRole === 'function') {
          toggleRole('admin');
        }
        setShowPinModal(false);
        showToast('驗證成功，已切換為管理員模式');
      } else {
        showToast('PIN 錯誤，請再試一次');
      }
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

          {/* 管理員模式切換（有 PIN 保護） */}
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
                開啟後可檢視統計與所有箱子的狀態，並可以進行進階操作。
              </Text>
            </View>
            <Switch
              value={isAdmin}
              onValueChange={(val) =>
                handleSwitchRole(
                  val ? 'admin' : 'resident',
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
            {hasAdminPin
              ? '（已設定管理員 PIN）'
              : '（尚未設定管理員 PIN）'}
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

        {/* 模擬資料 / Demo 模式（只在管理員顯示） */}
        {isAdmin && (
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
              模擬資料（Demo 模式）
            </Text>
            <Text
              style={[
                styles.cardSubtitle,
                { color: palette.subtleText },
              ]}
            >
              產生一組包含過去 7 天共享箱使用紀錄的範例資料，方便展示統計圖與歷史紀錄。
            </Text>

            <PressableScale
              onPress={handleSeedDemoData}
              style={[
                styles.demoButton,
                {
                  backgroundColor: palette.primarySoft,
                  borderColor: palette.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.demoButtonText,
                  { color: palette.primary },
                ]}
              >
                一鍵產生模擬資料
              </Text>
            </PressableScale>
          </View>
        )}
      </ScrollView>

      {/* 管理員 PIN Modal */}
      <Modal
        visible={showPinModal}
        transparent
        animationType="fade"
        onRequestClose={handleClosePinModal}
      >
        <View style={styles.pinOverlay}>
          <View
            style={[
              styles.pinCard,
              {
                backgroundColor: palette.card,
                borderColor: palette.cardBorder,
              },
            ]}
          >
            <Text
              style={[
                styles.pinTitle,
                { color: palette.text },
              ]}
            >
              {isSettingPin
                ? '設定管理員 PIN'
                : '輸入管理員 PIN'}
            </Text>
            <Text
              style={[
                styles.pinSubtitle,
                { color: palette.subtleText },
              ]}
            >
              {isSettingPin
                ? '第一次使用管理員模式，請設定一組 4 碼以上的數字密碼。'
                : '切換為管理員模式前，請先輸入管理員 PIN。'}
            </Text>

            <TextInput
              value={pinInput}
              onChangeText={setPinInput}
              placeholder={
                isSettingPin
                  ? '請輸入新的 PIN（至少 4 碼）'
                  : '請輸入 PIN'
              }
              placeholderTextColor={palette.subtleText}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
              style={[
                styles.pinInput,
                {
                  borderColor: palette.cardBorder,
                  color: palette.text,
                },
              ]}
            />

            <View style={styles.pinButtonRow}>
              <PressableScale
                onPress={handleClosePinModal}
                style={[
                  styles.pinButton,
                  {
                    borderColor: palette.cardBorder,
                    backgroundColor: 'transparent',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.pinButtonText,
                    { color: palette.subtleText },
                  ]}
                >
                  取消
                </Text>
              </PressableScale>
              <PressableScale
                onPress={handleConfirmPin}
                style={[
                  styles.pinButton,
                  {
                    borderColor: palette.primary,
                    backgroundColor: palette.primarySoft,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.pinButtonText,
                    { color: palette.primary },
                  ]}
                >
                  {isSettingPin ? '設定並啟用' : '驗證'}
                </Text>
              </PressableScale>
            </View>
          </View>
        </View>
      </Modal>
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
  demoButton: {
    marginTop: 4,
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  demoButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // PIN Modal
  pinOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinCard: {
    width: '85%',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderWidth: 1,
  },
  pinTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  pinSubtitle: {
    fontSize: 13,
    marginBottom: 12,
  },
  pinInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 12,
  },
  pinButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 8,
  },
  pinButton: {
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  pinButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
