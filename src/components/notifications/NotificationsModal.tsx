import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import NotificationCenter from './NotificationCenter';
import { useNotificationContext } from '../../contexts/NotificationContext';

const { height: screenHeight } = Dimensions.get('window');

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function NotificationsModal({ 
  visible, 
  onClose 
}: NotificationsModalProps) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    handleNotificationAction,
  } = useNotificationContext();

  const handleNotificationPress = (notification: any) => {
    handleNotificationAction(notification);
    onClose(); // Close modal after navigating
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <NotificationCenter
          notifications={notifications}
          unreadCount={unreadCount}
          onNotificationPress={handleNotificationPress}
          onMarkAllRead={markAllAsRead}
          onClearAll={clearNotifications}
          onClose={onClose}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});