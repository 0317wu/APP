// src/screens/HomeScreen.js
import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import BaseScreen from '../components/BaseScreen';
import PressableScale from '../components/PressableScale';
import { useThemeColors } from '../theme/ThemeContext';
import { useAppData } from '../data/DataContext';
import { styles as globalStyles } from '../styles';

export default function HomeScreen() {
  // ✅ hooks 一律放最上面、無條件呼叫
  const theme = useThemeColors();
  const navigation = useNavigation();
  const app = useAppData();

  // ✅ 防呆：避免 hydrated 前 boxes/history 是 undefined
  const boxes = Array.isArray(app?.boxes) ? app.boxes : [];
  const history = Array.isArray(app?.history) ? app.history : [];

  const showAlertBanner = !!app?.showAlertBanner;
  const lastAlertBoxId = app?.lastAlertBoxId ?? null;
  const clearLastAlert =
    typeof app?.clearLastAlert === 'function' ? app.clearLastAlert : () => {};

  const hydrated = !!app?.hydrated;
  const hasSeenOnboarding = !!app?.hasSeenOnboarding;
  const setHasSeenOnboarding =
    typeof app?.setHasSeenOnboarding === 'function'
      ? app.setHasSeenOnboarding
      : () => {};

  const isAdmin = (theme?.role || 'resident') === 'admin';

  // ✅ 這些 useMemo 必須「每次 render 都會被呼叫」，不能放在 return 後面才跑
  const stats = useMemo(() => {
    const total = boxes.length;
    const inUse = boxes.filter((b) => b?.status === 'IN_USE').length;
    const alerts = boxes.filter((b) => b?.status === 'ALERT').length;
    const todayCount = history.filter((h) => h?.dateLabel === '今天').length;
    return { total, inUse, alerts, todayCount };
  }, [boxes, history]);

  const alertBox = useMemo(() => {
    if (!lastAlertBoxId) return null;
    return boxes.find((b) => b?.id === lastAlertBoxId) || null;
  }, [boxes, lastAlertBoxId]);

  const abnormalBoxes = useMemo(() => {
    return boxes
      .filter((b) => b?.status === 'ALERT')
      .slice()
      .sort((a, b) =>
        (a?.lastUpdated || '') < (b?.lastUpdated || '') ? 1 : -1
      );
  }, [boxes]);

  const getEventMeta = (type) => {
    if (type === 'DELIVERY') {
      return { label: '放入包裹', icon: 'cube-outline', color: theme.accent };
    }
    if (type === 'PICKUP') {
      return {
        label: '領取完成',
        icon: 'checkmark-done-outline',
        color: theme.success || theme.accent,
      };
    }
    return {
      label: '異常事件',
      icon: 'alert-circle-outline',
      color: theme.danger,
    };
  };

  return (
    <BaseScreen title="共享箱總覽">
      {/* ✅ Skeleton：用條件渲染，不要提前 return（避免 hooks 順序改變） */}
      {!hydrated ? (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* 上方指標骨架 */}
          <View style={{ flexDirection: 'row', marginBottom: 16, paddingHorizontal: 20 }}>
            {Array.from({ length: 3 }).map((_, idx) => (
              <View
                key={idx}
                style={[
                  globalStyles.metricCard,
                  { backgroundColor: theme.card, flex: 1, marginHorizontal: 4 },
                ]}
              >
                <View style={{ height: 16, borderRadius: 8, backgroundColor: theme.cardBorder, marginBottom: 8 }} />
                <View style={{ height: 20, borderRadius: 10, backgroundColor: theme.cardBorder, marginBottom: 4 }} />
                <View style={{ height: 10, borderRadius: 6, backgroundColor: theme.cardBorder, width: '60%' }} />
              </View>
            ))}
          </View>

          {/* 快速操作骨架 */}
          <View style={globalStyles.sectionHeader}>
            <View style={{ height: 14, width: 80, borderRadius: 7, backgroundColor: theme.cardBorder }} />
          </View>

          <View style={{ flexDirection: 'row', marginBottom: 16, paddingHorizontal: 20 }}>
            {Array.from({ length: 2 }).map((_, idx) => (
              <View
                key={idx}
                style={[
                  globalStyles.metricCard,
                  { backgroundColor: theme.card, flex: 1, marginHorizontal: 4 },
                ]}
              >
                <View style={{ height: 14, borderRadius: 7, backgroundColor: theme.cardBorder, marginBottom: 6 }} />
                <View style={{ height: 10, borderRadius: 5, backgroundColor: theme.cardBorder }} />
              </View>
            ))}
          </View>

          {/* 異常總覽骨架 */}
          <View style={globalStyles.sectionHeader}>
            <View style={{ height: 14, width: 80, borderRadius: 7, backgroundColor: theme.cardBorder }} />
          </View>

          <View
            style={[
              globalStyles.card,
              { marginHorizontal: 20, backgroundColor: theme.card, borderColor: theme.cardBorder },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 32, height: 32, borderRadius: 999, backgroundColor: theme.cardBorder, marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <View style={{ height: 12, borderRadius: 6, backgroundColor: theme.cardBorder, marginBottom: 4 }} />
                <View style={{ height: 10, borderRadius: 5, backgroundColor: theme.cardBorder, width: '70%' }} />
              </View>
            </View>
          </View>
        </ScrollView>
      ) : (
        <>
          {/* 異常警示 Banner */}
          {showAlertBanner && (
            <View style={[globalStyles.banner, { backgroundColor: theme.bannerBg }]}>
              <Ionicons name="alert-circle" size={20} color={theme.bannerText} />
              <Text style={[globalStyles.bannerText, { color: theme.bannerText }]}>
                有共享箱處於異常狀態
                {alertBox ? `（${alertBox.name}）` : lastAlertBoxId ? `（${lastAlertBoxId}）` : ''}
                ，請盡快處理或確認狀態。
              </Text>
              <PressableScale
                onPress={clearLastAlert}
                style={[globalStyles.chip, { borderColor: theme.bannerText, backgroundColor: 'transparent' }]}
              >
                <Text style={[globalStyles.chipText, { color: theme.bannerText }]}>已處理</Text>
              </PressableScale>
            </View>
          )}

          <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
            {/* 上方指標卡片 */}
            <View style={{ flexDirection: 'row', marginBottom: 16 }}>
              {[
                { label: '箱子總數', value: stats.total, icon: 'cube' },
                { label: '使用中', value: stats.inUse, icon: 'play-circle-outline' },
                { label: '異常', value: stats.alerts, icon: 'warning' },
              ].map((item) => (
                <View
                  key={item.label}
                  style={[globalStyles.metricCard, { backgroundColor: theme.card, flex: 1 }]}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Ionicons name={item.icon} size={18} color={theme.mutedText} />
                    {item.label === '異常' && stats.alerts > 0 && (
                      <View style={[globalStyles.statusBadge, { backgroundColor: theme.dangerSoft }]}>
                        <Text style={[globalStyles.statusBadgeText, { color: theme.danger }]}>注意</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[globalStyles.metricValue, { color: theme.text }]}>{item.value}</Text>
                  <Text style={[globalStyles.metricLabel, { color: theme.mutedText }]}>{item.label}</Text>
                </View>
              ))}
            </View>

            {/* 快速操作 */}
            <View style={globalStyles.sectionHeader}>
              <Text style={[globalStyles.sectionTitle, { color: theme.text }]}>快速操作</Text>
            </View>

            <View style={{ flexDirection: 'row', marginBottom: 16, paddingHorizontal: 20 }}>
              <PressableScale
                style={[globalStyles.metricCard, { backgroundColor: theme.accentSoft, flex: 1 }]}
                onPress={() => navigation.navigate('Boxes')}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="cube" size={20} color={theme.accent} />
                  <Text style={{ marginLeft: 8, fontSize: 15, fontWeight: '600', color: theme.accent }}>
                    查看全部箱子
                  </Text>
                </View>
                <Text style={{ marginTop: 8, fontSize: 12, color: theme.mutedText }}>
                  即時掌握每一個共享箱的狀態
                </Text>
              </PressableScale>

              {/* 統計：一般住戶導到設定，管理員進統計 */}
              <PressableScale
                style={[
                  globalStyles.metricCard,
                  { backgroundColor: theme.card, flex: 1, opacity: isAdmin ? 1 : 0.6, marginLeft: 8 },
                ]}
                onPress={() => {
                  if (isAdmin) navigation.navigate('Analytics');
                  else navigation.navigate('Settings');
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="stats-chart" size={20} color={theme.accent} />
                  <Text style={{ marginLeft: 8, fontSize: 15, fontWeight: '600', color: isAdmin ? theme.text : theme.mutedText }}>
                    使用統計{!isAdmin ? '（僅管理員）' : ''}
                  </Text>
                </View>
                <Text style={{ marginTop: 8, fontSize: 12, color: theme.mutedText }}>
                  {isAdmin ? '查看高峰時段、使用頻率與住戶分佈' : '點此前往設定，切換為管理員模式後使用'}
                </Text>
              </PressableScale>
            </View>

            {/* 異常總覽 */}
            <View style={globalStyles.sectionHeader}>
              <Text style={[globalStyles.sectionTitle, { color: theme.text }]}>異常總覽</Text>
              {abnormalBoxes.length > 0 && (
                <Text style={[globalStyles.sectionHint, { color: theme.mutedText }]}>
                  共有 {abnormalBoxes.length} 個共享箱處於異常
                </Text>
              )}
            </View>

            {abnormalBoxes.length === 0 ? (
              <View style={globalStyles.listEmptyContainer}>
                <Text style={[globalStyles.listEmptyText, { color: theme.mutedText }]}>
                  目前沒有異常中的共享箱，狀態一切正常。
                </Text>
              </View>
            ) : (
              <View style={{ marginBottom: 16 }}>
                {abnormalBoxes.slice(0, 3).map((box) => (
                  <View
                    key={box.id}
                    style={[
                      globalStyles.card,
                      { backgroundColor: theme.card, borderColor: theme.dangerSoft, marginHorizontal: 20 },
                    ]}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View
                        style={{
                          width: 32, height: 32, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
                          marginRight: 10, backgroundColor: theme.dangerSoft,
                        }}
                      >
                        <Ionicons name="alert-circle" size={18} color={theme.danger} />
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={[globalStyles.cardTitle, { color: theme.text }]}>{box.name}</Text>
                        <Text style={[globalStyles.cardSubtitle, { color: theme.mutedText }]}>
                          {box.location || '目前處於異常狀態，請儘速確認。'}
                        </Text>
                        {box.lastUpdated && (
                          <Text style={{ marginTop: 2, fontSize: 11, color: theme.subtleText }}>
                            最後更新：{String(box.lastUpdated).replace('T', ' ').slice(0, 16)}
                          </Text>
                        )}
                      </View>

                      <View style={[globalStyles.statusBadge, { backgroundColor: theme.dangerSoft }]}>
                        <Text style={[globalStyles.statusBadgeText, { color: theme.danger }]}>異常</Text>
                      </View>
                    </View>
                  </View>
                ))}

                {abnormalBoxes.length > 3 && (
                  <Text style={{ textAlign: 'right', fontSize: 11, color: theme.mutedText, marginRight: 24, marginTop: -4 }}>
                    還有 {abnormalBoxes.length - 3} 個異常箱子…
                  </Text>
                )}
              </View>
            )}

            {/* 最近活動 */}
            <View style={globalStyles.sectionHeader}>
              <Text style={[globalStyles.sectionTitle, { color: theme.text }]}>最近活動</Text>
            </View>

            {history.length === 0 ? (
              <View style={globalStyles.listEmptyContainer}>
                <Text style={[globalStyles.listEmptyText, { color: theme.mutedText }]}>
                  目前還沒有任何使用紀錄。
                </Text>
              </View>
            ) : (
              history.slice(0, 5).map((item) => {
                const meta = getEventMeta(item.type);
                return (
                  <View
                    key={item.id}
                    style={[
                      globalStyles.card,
                      { backgroundColor: theme.card, borderColor: theme.cardBorder, marginHorizontal: 20 },
                    ]}
                  >
                    <View style={[globalStyles.cardRow, { alignItems: 'center' }]}>
                      <View
                        style={{
                          width: 32, height: 32, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
                          marginRight: 10, backgroundColor: theme.cardBorder,
                        }}
                      >
                        <Ionicons name={meta.icon} size={18} color={meta.color} />
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={[globalStyles.cardTitle, { color: theme.text }]}>{item.boxName}</Text>
                        <Text style={[globalStyles.cardSubtitle, { color: theme.mutedText }]}>
                          {item.userName} · {item.dateLabel}
                        </Text>
                      </View>

                      <Text style={{ fontSize: 13, fontWeight: '500', color: meta.color }}>
                        {meta.label}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Onboarding：只顯示一次 */}
          {hydrated && !hasSeenOnboarding && (
            <View
              style={{
                position: 'absolute',
                left: 0, right: 0, top: 0, bottom: 0,
                backgroundColor: 'rgba(15,23,42,0.55)',
                justifyContent: 'flex-end',
              }}
            >
              <View
                style={{
                  margin: 20,
                  borderRadius: 18,
                  padding: 16,
                  backgroundColor: theme.card,
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: 6 }}>
                  快速帶你認識共享箱面板
                </Text>
                <Text style={{ fontSize: 13, color: theme.mutedText, marginBottom: 12, lineHeight: 20 }}>
                  · 上方指標卡：掌握箱子總數、使用中與異常數量{'\n'}
                  · 快速操作：一鍵進入箱子列表或使用統計{'\n'}
                  · 異常總覽：集中顯示目前有問題的共享箱
                </Text>

                <PressableScale
                  onPress={() => setHasSeenOnboarding(true)}
                  style={{
                    borderRadius: 14,
                    paddingVertical: 12,
                    alignItems: 'center',
                    backgroundColor: theme.accent,
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>
                    我知道了，開始使用
                  </Text>
                </PressableScale>
              </View>
            </View>
          )}
        </>
      )}
    </BaseScreen>
  );
}
