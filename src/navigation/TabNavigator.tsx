// src/navigation/TabNavigator.tsx
import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import SearchRides from '../screens/SearchRides';
import MyRides from '../screens/MyRides';
import Messages from '../screens/Messages';
import UserProfile from '../screens/UserProfile';
import { useNotificationContext } from '../contexts/NotificationContext';
import NotificationBadge from '../components/common/notifications/NotificationBadge';
import AppHeader from '../components/common/AppHeader';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { unreadCount } = useNotificationContext();

  const getHeaderTitle = (routeName: string) => {
    const titleMap = {
      'Find Ride': 'Find Ride',
      'My Rides': 'My Rides',
      'Messages': 'Messages',
      'Profile': 'Profile',
    } as const;
    return titleMap[routeName as keyof typeof titleMap] || routeName;
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const iconMap = {
            'Find Ride': 'search',
            'My Rides': 'car',
            'Messages': 'chatbox',
            'Profile': 'person',
          } as const;

          const icon = (
            <Ionicons
              name={iconMap[route.name as keyof typeof iconMap]}
              size={size}
              color={color}
            />
          );

          // Add notification badge to Messages tab
          if (route.name === 'Messages' && unreadCount > 0) {
            return (
              <View>
                {icon}
                <NotificationBadge
                  count={unreadCount}
                  size="small"
                  style={{
                    position: 'absolute',
                    top: -2,
                    right: -6,
                  }}
                />
              </View>
            );
          }

          return icon;
        },
        tabBarActiveTintColor: '#8B5CF6',
        tabBarInactiveTintColor: 'gray',
        header: () => <AppHeader title={getHeaderTitle(route.name)} />,
      })}
    >
      <Tab.Screen name="Find Ride" component={SearchRides} />
      <Tab.Screen name="My Rides" component={MyRides} />
      <Tab.Screen name="Messages" component={Messages} />
      <Tab.Screen name="Profile" component={UserProfile} />
    </Tab.Navigator>
  );
}