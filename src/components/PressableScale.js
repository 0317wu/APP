// src/components/PressableScale.js
import React, { useRef } from 'react';
import { Animated, Pressable } from 'react-native';

export default function PressableScale({
  children,
  onPress,
  style,
  ...rest
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (toValue) => {
    Animated.spring(scale, {
      toValue,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const handlePressIn = () => {
    animateTo(0.96);
  };

  const handlePressOut = () => {
    animateTo(1);
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...rest}
    >
      <Animated.View
        style={[
          {
            transform: [{ scale }],
          },
          style,
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}
