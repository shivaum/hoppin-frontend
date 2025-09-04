import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/types';

type Navigation = NativeStackNavigationProp<MainStackParamList>;

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  ride_id?: string;
  request_id?: string;
  message_id?: string;
  other_user_id?: string;
  action_data?: any;
  read: boolean;
  created_at: string;
  read_at?: string;
}

interface UseNotificationsProps {
  socket: Socket | null;
  showInAppNotifications?: boolean;
}

export function useNotifications({ 
  socket, 
  showInAppNotifications = true 
}: UseNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigation = useNavigation<Navigation>();

  useEffect(() => {
    if (!socket) return;

    const handleReceiveNotification = (notification: Notification) => {
      // Add to notifications list
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);

      // Show in-app notification if enabled
      if (showInAppNotifications) {
        showInAppNotification(notification);
      }
    };

    const handleNotificationMarkedRead = ({ notification_id }: { notification_id: string }) => {
      setNotifications(prev => 
        prev.map(n => 
          n.id === notification_id 
            ? { ...n, read: true, read_at: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    };

    socket.on('receive_notification', handleReceiveNotification);
    socket.on('notification_marked_read', handleNotificationMarkedRead);

    return () => {
      socket.off('receive_notification', handleReceiveNotification);
      socket.off('notification_marked_read', handleNotificationMarkedRead);
    };
  }, [socket, showInAppNotifications]);

  const showInAppNotification = (notification: Notification) => {
    Toast.show({
      type: getToastType(notification.type),
      text1: notification.title,
      text2: notification.body,
      onPress: () => handleNotificationAction(notification),
      visibilityTime: 4000,
    });
  };

  const getToastType = (notificationType: string): 'success' | 'error' | 'info' => {
    switch (notificationType) {
      case 'ride_request_accepted':
      case 'license_verification_complete':
        return 'success';
      case 'ride_request_declined':
      case 'ride_cancelled':
        return 'error';
      default:
        return 'info';
    }
  };

  const handleNotificationAction = (notification: Notification) => {
    if (!notification.action_data?.screen) return;

    const { screen, params } = notification.action_data;
    
    try {
      // Mark as read when user interacts with notification
      markAsRead(notification.id);
      
      // Navigate to appropriate screen
      navigation.navigate(screen, params || {});
    } catch (error) {
      console.error('Error handling notification action:', error);
    }
  };

  const markAsRead = (notificationId: string) => {
    if (!socket) return;
    
    socket.emit('mark_notification_read', { notification_id: notificationId });
  };

  const markAllAsRead = () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    
    unreadIds.forEach(id => markAsRead(id));
    
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true, read_at: new Date().toISOString() }))
    );
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    handleNotificationAction,
  };
}