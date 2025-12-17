// App.js
import React from 'react';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import HomeScreen from './src/screens/HomeScreen';
import BoxesStackNavigator from './src/navigation/BoxesStackNavigator';
import HistoryScreen from './src/screens/HistoryScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

import {
  ThemeProvider,
  useThemeColors,
} from './src/theme/ThemeContext';
import { DataProvider } from './src/data/DataContext';
import { ToastProvider } from './src/components/ToastContext';

const Tab = createBottomTabNavigator();

function AppTabs() {
  const theme = useThemeColors();
  const isDark = theme.theme === 'dark';
  const isAdmin = theme.role === 'admin';

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.background,
      card: theme.card,
      text: theme.text,
      border: theme.cardBorder,
      primary: theme.accent,
    },
  };

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer theme={navTheme}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
              backgroundColor: theme.tabBarBg,
              borderTopColor: theme.cardBorder,
            },
            tabBarActiveTintColor: theme.tabBarActive,
            tabBarInactiveTintColor: theme.tabBarInactive,
            tabBarIcon: ({ color, size }) => {
              let iconName = 'ellipse';
              if (route.name === 'Home') iconName = 'home-outline';
              else if (route.name === 'Boxes')
                iconName = 'cube-outline';
              else if (route.name === 'History')
                iconName = 'time-outline';
              else if (route.name === 'Analytics')
                iconName = 'stats-chart-outline';
              else if (route.name === 'Settings')
                iconName = 'settings-outline';

              return (
                <Ionicons
                  name={iconName}
                  size={size}
                  color={color}
                />
              );
            },
          })}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: '首頁' }}
          />
          <Tab.Screen
            name="Boxes"
            component={BoxesStackNavigator}
            options={{ title: '共享箱' }}
          />
          <Tab.Screen
            name="History"
            component={HistoryScreen}
            options={{ title: '紀錄' }}
          />
          {isAdmin && (
            <Tab.Screen
              name="Analytics"
              component={AnalyticsScreen}
              options={{ title: '統計' }}
            />
          )}
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: '設定' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <ToastProvider>
          <AppTabs />
        </ToastProvider>
      </DataProvider>
    </ThemeProvider>
  );
}
