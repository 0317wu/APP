// src/components/BaseScreen.js
import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import PressableScale from './PressableScale';
import { useThemeColors } from '../theme/ThemeContext';
import { styles as globalStyles } from '../styles';

export default function BaseScreen({
  title,
  children,
  scroll = true,
  rightActions = null,
  showBack = false,
}) {
  const theme = useThemeColors();
  const navigation = useNavigation();
  const Container = scroll ? ScrollView : View;

  return (
    <SafeAreaView
      style={[
        globalStyles.safeArea,
        { backgroundColor: theme.background },
      ]}
    >
      <View style={globalStyles.screenHeader}>
        <View style={globalStyles.headerLeft}>
          {showBack && (
            <PressableScale
              onPress={() => navigation.goBack()}
              style={[
                globalStyles.iconButton,
                { backgroundColor: theme.card },
              ]}
            >
              <Ionicons
                name="chevron-back"
                size={20}
                color={theme.text}
              />
            </PressableScale>
          )}
          <Text
            style={[
              globalStyles.screenTitle,
              { color: theme.text },
            ]}
          >
            {title}
          </Text>
        </View>
        <View style={globalStyles.headerRight}>{rightActions}</View>
      </View>

      <Container
        style={[
          globalStyles.screenBody,
          { backgroundColor: theme.background },
        ]}
        contentContainerStyle={
          scroll ? globalStyles.screenBodyContent : undefined
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </Container>
    </SafeAreaView>
  );
}
