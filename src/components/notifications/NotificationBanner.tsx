import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { Notification } from '../../hooks/useNotifications';

interface NotificationBannerProps {
  notification: Notification;
  onPress: () => void;
  onDismiss: () => void;
  style?: any;
}

export default function NotificationBanner({
  notification,
  onPress,
  onDismiss,
  style,
}: NotificationBannerProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'ride_request_received':
        return 'car-outline';
      case 'ride_request_accepted':
        return 'checkmark-circle-outline';
      case 'ride_request_declined':
        return 'close-circle-outline';
      case 'new_message':
        return 'chatbubble-outline';
      case 'ride_cancelled':
        return 'warning-outline';
      case 'ride_starting_soon':
        return 'time-outline';
      case 'driver_arriving':
        return 'location-outline';
      default:
        return 'notifications-outline';
    }
  };

  const getBannerStyle = (type: string) => {
    switch (type) {
      case 'ride_request_accepted':
        return { backgroundColor: colors.success };
      case 'ride_request_declined':
      case 'ride_cancelled':
        return { backgroundColor: colors.error };
      case 'ride_starting_soon':
      case 'driver_arriving':
        return { backgroundColor: colors.secondary.yellow };
      default:
        return { backgroundColor: colors.primary.purple };
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, getBannerStyle(notification.type), style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={getIcon(notification.type) as any}
          size={24}
          color={colors.neutral.white}
        />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {notification.title}
        </Text>
        <Text style={styles.body} numberOfLines={2}>
          {notification.body}
        </Text>
      </View>

      <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
        <Ionicons name="close" size={20} color={colors.neutral.white} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.white,
    marginBottom: 2,
  },
  body: {
    fontSize: 14,
    color: colors.neutral.white,
    opacity: 0.9,
    lineHeight: 18,
  },
  dismissButton: {
    marginLeft: 8,
    padding: 4,
  },
});