import React, { createContext, useContext, ReactNode } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useNotifications, Notification } from '../hooks/useNotifications';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  handleNotificationAction: (notification: Notification) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const socket = useSocket();
  const notificationSystem = useNotifications({ 
    socket, 
    showInAppNotifications: true 
  });

  return (
    <NotificationContext.Provider value={notificationSystem}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}