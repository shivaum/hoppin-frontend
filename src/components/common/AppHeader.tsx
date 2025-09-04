import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotificationContext } from '../../contexts/NotificationContext';
import NotificationBadge from '../notifications/NotificationBadge';
import NotificationsModal from '../notifications/NotificationsModal';
import { colors } from '../../constants/colors';

interface AppHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

export default function AppHeader({ 
  title, 
  showBackButton = false, 
  onBackPress 
}: AppHeaderProps) {
  const { unreadCount } = useNotificationContext();
  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);

  return (
    <>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.leftSection}>
            {showBackButton && (
              <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color={colors.neutral.gray900} />
              </TouchableOpacity>
            )}
            <Text style={styles.title}>{title}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => setNotificationsModalVisible(true)}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.neutral.gray700} />
            {unreadCount > 0 && (
              <NotificationBadge
                count={unreadCount}
                size="small"
                style={styles.notificationBadge}
              />
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <NotificationsModal
        visible={notificationsModalVisible}
        onClose={() => setNotificationsModalVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.neutral.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.neutral.gray900,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.neutral.gray50,
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
});