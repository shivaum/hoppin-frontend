import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../constants/colors';

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export default function LoadingSpinner({ 
  size = 24, 
  color = colors.primary.purple,
  style 
}: LoadingSpinnerProps) {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spin = () => {
      spinValue.setValue(0);
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => spin());
    };
    
    spin();
  }, [spinValue]);

  const rotate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.spinner,
          {
            width: size,
            height: size,
            borderColor: `${color}20`, // 20% opacity for background
            borderTopColor: color,
            transform: [{ rotate }],
          },
        ]}
      />
    </View>
  );
}

// Alternative dot-based spinner for variety
export function DotLoadingSpinner({ 
  size = 8, 
  color = colors.primary.purple,
  style 
}: LoadingSpinnerProps) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) => {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return animation;
    };

    const animations = [
      animate(dot1, 0),
      animate(dot2, 150),
      animate(dot3, 300),
    ];

    return () => {
      animations.forEach(animation => animation.stop());
    };
  }, [dot1, dot2, dot3]);

  const dotStyle = (dot: Animated.Value) => ({
    width: size,
    height: size,
    backgroundColor: color,
    borderRadius: size / 2,
    opacity: dot,
    transform: [
      {
        scale: dot.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1.2],
        }),
      },
    ],
  });

  return (
    <View style={[styles.dotContainer, style]}>
      <Animated.View style={[styles.dot, dotStyle(dot1)]} />
      <Animated.View style={[styles.dot, dotStyle(dot2)]} />
      <Animated.View style={[styles.dot, dotStyle(dot3)]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    borderWidth: 2,
    borderRadius: 12,
    borderStyle: 'solid',
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    marginHorizontal: 2,
  },
});