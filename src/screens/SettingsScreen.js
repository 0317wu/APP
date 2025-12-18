// src/screens/SettingsScreen.js
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import BaseScreen from '../components/BaseScreen';
import PressableScale from '../components/PressableScale';
import { useThemeColors } from '../theme/ThemeContext';
import { useAppData } from '../data/DataContext';
import { useToast } from '../components/ToastContext';

const USERS = [
  { id: 'user-001', label: '住戶 A', desc: '主要帳號（預設）' },
  { id: 'user-002', label: '住戶 B', desc: '家人 / 室友帳號' },
  { id: 'user-003', label: '住戶 C', desc: '備用帳號 / 測試用' },
];

export default function SettingsScreen() {
  const theme = useThemeColors();
  const toast = useToast();

  const {
    currentUserId,
    setCurrentUserId,
    showAlertBanner,
    setShowAlertBanner,
    isAdminMode,
    hasAdminPin,
    setAdminPin,
    enableAdminMode,
    disableAdminMode,
  } = useAppData();

  const [selectedUser, setSelectedUser] = useState(currentUserId || 'user-001');

  // PIN Modal 狀態
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [pinMode, setPinMode] = useState('set'); // 'set' | 'verify'
  const [pin1, setPin1] = useState('');
  const [pin2, setPin2] = useState('');

  const isDarkMode = theme.theme === 'dark';

  const adminText = useMemo(() => (isAdminMode ? '管理員模式（已開啟）' : '一般住戶'), [isAdminMode]);

  const openSetPin = () => {
    setPinMode('set');
    setPin1('');
    setPin2('');
    setPinModalVisible(true);
  };

  const openVerifyPin = () => {
    setPinMode('verify');
    setPin1('');
    setPin2('');
    setPinModalVisible(true);
  };

  const closePinModal = () => setPinModalVisible(false);

  const handleSelectUser = (userId) => {
    setSelectedUser(userId);
    setCurrentUserId?.(userId);
  };

  const onToggleAdmin = (next) => {
    if (!next) {
      disableAdminMode?.();
      toast.showToast('已關閉管理員模式', { type: 'info' });
      return;
    }

    // next === true
    if (!hasAdminPin) openSetPin();
    else openVerifyPin();
  };

  const confirmPin = async () => {
    const a = (pin1 || '').trim();
    const b = (pin2 || '').trim();

    if (pinMode === 'set') {
      if (a.length !== 4 || b.length !== 4) {
        toast.showToast('請輸入 4 碼 PIN', { type: 'warning' });
        return;
      }
      if (a !== b) {
        toast.showToast('兩次 PIN 不一致', { type: 'danger' });
        return;
      }

      await setAdminPin?.(a);
      // ✅ 設定完直接開啟管理員（體驗更順）
      const ok = enableAdminMode?.(a);
      closePinModal();

      if (ok) toast.showToast('管理員 PIN 設定完成，已開啟管理員模式', { type: 'success' });
      else toast.showToast('PIN 已設定，但開啟管理員失敗', { type: 'warning' });
      return;
    }

    // verify
    if (a.length !== 4) {
      toast.showToast('請輸入 4 碼 PIN', { type: 'warning' });
      return;
    }
    const ok = enableAdminMode?.(a);
    if (ok) {
      closePinModal();
      toast.showToast('已開啟管理員模式', { type: 'success' });
    } else {
      toast.showToast('PIN 錯誤，無法開啟', { type: 'danger' });
    }
  };

  const resetPin = async () => {
    await setAdminPin?.('');
    disableAdminMode?.();
    toast.showToast('已清除管理員 PIN', { type: 'info' });
  };

  return (
    <BaseScreen title="設定">
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 外觀 */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>外觀</Text>
          <Text style={[styles.cardSubtitle, { color: theme.subtleText }]}>切換深色 / 淺色模式。</Text>

          <View style={styles.rowBetween}>
            <View style={styles.textBlock}>
              <Text style={[styles.label, { color: theme.text }]}>深色模式</Text>
              <Text style={[styles.helperText, { color: theme.subtleText }]}>依個人喜好切換 Light / Dark。</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={theme.toggleTheme}
              trackColor={{ false: '#E5E7EB', true: '#93C5FD' }}
              thumbColor={isDarkMode ? '#2563EB' : '#FFFFFF'}
            />
          </View>
        </View>

        {/* 管理員 */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>管理員模式</Text>
          <Text style={[styles.cardSubtitle, { color: theme.subtleText }]}>
            開啟後可查看統計、檢視所有箱子狀態。
          </Text>

          <View style={styles.rowBetween}>
            <View style={styles.textBlock}>
              <Text style={[styles.label, { color: theme.text }]}>{adminText}</Text>
              <Text style={[styles.helperText, { color: theme.subtleText }]}>
                {isAdminMode ? '統計功能已解鎖' : '統計功能將被鎖定'}
              </Text>
            </View>

            <Switch
              value={!!isAdminMode}
              onValueChange={onToggleAdmin}
              trackColor={{ false: '#E5E7EB', true: '#FDBA74' }}
              thumbColor={isAdminMode ? '#EA580C' : '#FFFFFF'}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            {!hasAdminPin ? (
              <PressableScale
                onPress={openSetPin}
                style={[styles.smallBtn, { backgroundColor: theme.accent }]}
              >
                <Text style={styles.smallBtnText}>設定管理員 PIN</Text>
              </PressableScale>
            ) : (
              <>
                <PressableScale
                  onPress={openSetPin}
                  style={[styles.smallBtn, { backgroundColor: theme.chipBg, borderWidth: 1, borderColor: theme.chipBorder }]}
                >
                  <Text style={[styles.smallBtnText, { color: theme.text }]}>重設 PIN</Text>
                </PressableScale>

                <PressableScale
                  onPress={resetPin}
                  style={[styles.smallBtn, { backgroundColor: theme.dangerSoft, borderWidth: 1, borderColor: 'rgba(220,38,38,0.35)' }]}
                >
                  <Text style={[styles.smallBtnText, { color: theme.danger }]}>清除 PIN</Text>
                </PressableScale>
              </>
            )}
          </View>
        </View>

        {/* 使用者 */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>使用者帳號</Text>
          <Text style={[styles.cardSubtitle, { color: theme.subtleText }]}>可在住戶 A / B / C 之間切換。</Text>

          {USERS.map((u) => {
            const active = selectedUser === u.id;
            return (
              <TouchableOpacity key={u.id} onPress={() => handleSelectUser(u.id)} activeOpacity={0.7}>
                <View
                  style={[
                    styles.userRow,
                    {
                      borderColor: active ? theme.accent : 'transparent',
                      backgroundColor: active ? theme.accentSoft : 'transparent',
                    },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.text, fontSize: 15, fontWeight: '600' }}>{u.label}</Text>
                    <Text style={{ color: theme.subtleText, fontSize: 12, marginTop: 3 }}>{u.desc}</Text>
                  </View>
                  {active ? <Ionicons name="checkmark-circle" size={20} color={theme.accent} /> : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 系統提醒 */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>系統提醒</Text>
          <Text style={[styles.cardSubtitle, { color: theme.subtleText }]}>控制是否顯示共享箱異常 Banner。</Text>

          <View style={styles.rowBetween}>
            <View style={styles.textBlock}>
              <Text style={[styles.label, { color: theme.text }]}>顯示異常警示</Text>
              <Text style={[styles.helperText, { color: theme.subtleText }]}>包含震動、開門異常、逾時未取等。</Text>
            </View>
            <Switch
              value={!!showAlertBanner}
              onValueChange={(v) => setShowAlertBanner?.(v)}
              trackColor={{ false: '#E5E7EB', true: '#FCA5A5' }}
              thumbColor={showAlertBanner ? '#DC2626' : '#FFFFFF'}
            />
          </View>
        </View>
      </ScrollView>

      {/* PIN Modal */}
      <Modal visible={pinModalVisible} transparent animationType="fade" onRequestClose={closePinModal}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: theme.text, fontSize: 16, fontWeight: '800' }}>
                {pinMode === 'set' ? '設定管理員 PIN' : '輸入管理員 PIN'}
              </Text>
              <PressableScale onPress={closePinModal} style={{ padding: 6 }}>
                <Ionicons name="close" size={20} color={theme.mutedText} />
              </PressableScale>
            </View>

            <Text style={{ marginTop: 8, color: theme.subtleText, fontSize: 12 }}>
              {pinMode === 'set' ? '請輸入 4 碼並再次確認' : '輸入 4 碼 PIN 以開啟管理員'}
            </Text>

            <TextInput
              value={pin1}
              onChangeText={(t) => setPin1(t.replace(/[^\d]/g, '').slice(0, 4))}
              placeholder="4 碼 PIN"
              placeholderTextColor={theme.subtleText}
              keyboardType="number-pad"
              secureTextEntry
              style={[styles.input, { borderColor: theme.cardBorder, color: theme.text }]}
            />

            {pinMode === 'set' ? (
              <TextInput
                value={pin2}
                onChangeText={(t) => setPin2(t.replace(/[^\d]/g, '').slice(0, 4))}
                placeholder="再次輸入 4 碼 PIN"
                placeholderTextColor={theme.subtleText}
                keyboardType="number-pad"
                secureTextEntry
                style={[styles.input, { borderColor: theme.cardBorder, color: theme.text }]}
              />
            ) : null}

            <PressableScale
              onPress={confirmPin}
              style={[styles.primaryBtn, { backgroundColor: theme.accent }]}
            >
              <Text style={{ color: '#fff', fontWeight: '800' }}>
                {pinMode === 'set' ? '確認設定並開啟' : '確認開啟'}
              </Text>
            </PressableScale>
          </View>
        </View>
      </Modal>
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 32 },
  card: { borderRadius: 18, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  cardSubtitle: { fontSize: 12, marginBottom: 12 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  textBlock: { flex: 1, paddingRight: 12 },
  label: { fontSize: 14, fontWeight: '700' },
  helperText: { fontSize: 12, marginTop: 2 },

  userRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, marginTop: 8 },

  smallBtn: { flex: 1, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  smallBtnText: { color: '#fff', fontWeight: '800', fontSize: 12 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', padding: 18 },
  modalCard: { width: '100%', maxWidth: 420, borderRadius: 16, borderWidth: 1, padding: 14 },
  input: { marginTop: 10, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  primaryBtn: { marginTop: 12, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
});
