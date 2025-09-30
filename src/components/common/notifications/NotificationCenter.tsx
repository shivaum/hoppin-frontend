import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../constants/colors';
import { Notification } from '../../../hooks/useNotifications';

interface NotificationCenterProps {
  notifications: Notification[];
  unreadCount: number;
  onNotificationPress: (notification: Notification) => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onClose: () => void;
}

export default function NotificationCenter({
  notifications,
  unreadCount,
  onNotificationPress,
  onMarkAllRead,
  onClearAll,
  onClose,
}: NotificationCenterProps) {
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

  const getIconColor = (type: string) => {
    switch (type) {
      case 'ride_request_accepted':
        return colors.success;
      case 'ride_request_declined':
      case 'ride_cancelled':
        return colors.error;
      case 'ride_starting_soon':
      case 'driver_arriving':
        return colors.secondary.yellow;
      default:
        return colors.primary.purple;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.read && styles.unreadItem]}
      onPress={() => onNotificationPress(item)}
    >
      <View style={[styles.iconContainer, { backgroundColor: getIconColor(item.type) }]}>
        <Ionicons
          name={getIcon(item.type) as any}
          size={20}
          color={colors.neutral.white}
        />
      </View>
      
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.notificationTime}>
            {formatDate(item.created_at)}
          </Text>
        </View>
        <Text style={styles.notificationBody} numberOfLines={2}>
          {item.body}
        </Text>
      </View>

      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="notifications-outline" size={64} color={colors.neutral.gray400} />
      <Text style={styles.emptyStateTitle}>No notifications</Text>
      <Text style={styles.emptyStateText}>
        You're all caught up! Notifications will appear here.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={onMarkAllRead} style={styles.headerButton}>
              <Text style={styles.headerButtonText}>Mark all read</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.neutral.gray700} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Unread count badge */}
      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Text style={styles.unreadBannerText}>
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* Notifications list */}
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />

      {/* Clear all button */}
      {notifications.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity onPress={onClearAll} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear all notifications</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.neutral.gray900,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.primary.purple,
  },
  headerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.white,
  },
  closeButton: {
    padding: 4,
  },
  unreadBanner: {
    backgroundColor: colors.primary.purple,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  unreadBannerText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.white,
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray100,
  },
  unreadItem: {
    backgroundColor: colors.neutral.gray50,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.gray900,
    flex: 1,
  },
  notificationTime: {
    fontSize: 12,
    color: colors.neutral.gray500,
    marginLeft: 8,
  },
  notificationBody: {
    fontSize: 14,
    color: colors.neutral.gray600,
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary.purple,
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.neutral.gray900,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.neutral.gray500,
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray200,
  },
  clearButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
});