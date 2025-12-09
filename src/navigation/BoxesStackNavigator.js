// src/navigation/BoxesStackNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BoxesScreen from '../screens/BoxesScreen';
import BoxDetailScreen from '../screens/BoxDetailScreen';

const Stack = createNativeStackNavigator();

export default function BoxesStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // 用自己的 BaseScreen header
      }}
    >
      <Stack.Screen name="BoxesList" component={BoxesScreen} />
      <Stack.Screen name="BoxDetail" component={BoxDetailScreen} />
    </Stack.Navigator>
  );
}
