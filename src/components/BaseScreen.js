// src/components/BaseScreen.js
import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useThemeColors } from '../theme/ThemeContext';
import { styles as globalStyles } from '../styles';

export default function BaseScreen({
  title,
  desc,
  children,
  scroll = false,
  showBack = false,
  right,
}) {
  const theme = useThemeColors();
  const navigation = useNavigation();

  const Container = scroll ? ScrollView : View;

  return (
    <SafeAreaView
      style={[
        globalStyles.container,
        { backgroundColor: theme.background },
      ]}
    >
      {/* Header 區塊 */}
      <View style={globalStyles.header}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* 左側：返回鍵 + 標題 */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              flex: 1,
            }}
          >
            {showBack && (
              <TouchableOpacity
                onPress={() =>
                  navigation.canGoBack() && navigation.goBack()
                }
                style={{ marginRight: 8, padding: 4 }}
              >
                <Ionicons
                  name="chevron-back"
                  size={22}
                  color={theme.headerText}
                />
              </TouchableOpacity>
            )}

            <View style={{ flex: 1 }}>
              {title ? (
                <Text
                  style={[
                    globalStyles.title,
                    { color: theme.headerText },
                  ]}
                  numberOfLines={1}
                >
                  {title}
                </Text>
              ) : null}
              {desc ? (
                <Text
                  style={[
                    globalStyles.desc,
                    { color: theme.subtleText },
                  ]}
                  numberOfLines={2}
                >
                  {desc}
                </Text>
              ) : null}
            </View>
          </View>

          {/* 右側自訂按鈕區（可選） */}
          {right ? (
            <View style={{ marginLeft: 8 }}>{right}</View>
          ) : null}
        </View>
      </View>

      {/* 內容區 */}
      <Container
        style={{ flex: 1 }}
        contentContainerStyle={
          scroll ? globalStyles.scrollContent : undefined
        }
        showsVerticalScrollIndicator={false}
      >
        {children}
      </Container>
    </SafeAreaView>
  );
}
