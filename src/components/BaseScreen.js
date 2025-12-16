// src/components/BaseScreen.js
import React from 'react';
import { SafeAreaView, View, Text, ScrollView } from 'react-native';
import { useThemeColors } from '../theme/ThemeContext';
import { styles as globalStyles } from '../styles';

export default function BaseScreen({
  title,
  desc,
  children,
  scroll = false,
}) {
  const theme = useThemeColors();

  const Container = scroll ? ScrollView : View;

  return (
    <SafeAreaView
      style={[
        globalStyles.container,
        { backgroundColor: theme.background },
      ]}
    >
      <View style={globalStyles.header}>
        {!!title && (
          <Text style={[globalStyles.title, { color: theme.text }]}>
            {title}
          </Text>
        )}
        {!!desc && (
          <Text
            style={[
              globalStyles.desc,
              { color: theme.mutedText },
            ]}
            numberOfLines={2}
          >
            {desc}
          </Text>
        )}
      </View>

      <Container
        style={{ flex: 1 }}
        contentContainerStyle={scroll ? globalStyles.scrollContent : undefined}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </Container>
    </SafeAreaView>
  );
}
