import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../../constants/colors';

interface NotificationBadgeProps {
  count: number;
  maxCount?: number;
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

export default function NotificationBadge({ 
  count, 
  maxCount = 99, 
  size = 'medium',
  style 
}: NotificationBadgeProps) {
  if (count <= 0) return null;

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();
  
  const sizeStyles = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large,
  };

  return (
    <View style={[styles.badge, sizeStyles[size], style]}>
      <Text style={[styles.text, styles[`${size}Text`]]}>
        {displayCount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  small: {
    height: 16,
    minWidth: 16,
    borderRadius: 8,
  },
  medium: {
    height: 20,
    minWidth: 20,
    borderRadius: 10,
  },
  large: {
    height: 24,
    minWidth: 24,
    borderRadius: 12,
  },
  text: {
    color: colors.neutral.white,
    fontWeight: '600',
    textAlign: 'center',
  },
  smallText: {
    fontSize: 10,
  },
  mediumText: {
    fontSize: 12,
  },
  largeText: {
    fontSize: 14,
  },
});