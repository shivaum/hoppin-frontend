// src/navigation/TabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import SearchRides from '../screens/SearchRides';
import MyRides from '../screens/MyRides';
import Messages from '../screens/Messages';
import UserProfile from '../screens/UserProfile';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
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

          return (
            <Ionicons
              name={iconMap[route.name as keyof typeof iconMap]}
              size={size}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: '#2f95dc',
        tabBarInactiveTintColor: 'gray',
        headerTitleAlign: 'center',
      })}
    >
      <Tab.Screen 
        name="Find Ride" 
        component={SearchRides} 
        options={{ headerShown: false }}
      />
      <Tab.Screen name="My Rides" component={MyRides} options={{ headerShown: false }} />
      <Tab.Screen name="Messages" component={Messages} />
      <Tab.Screen name="Profile" component={UserProfile} />
    </Tab.Navigator>
  );
}