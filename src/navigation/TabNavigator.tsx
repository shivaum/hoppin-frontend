import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

import SearchRides from '../screens/SearchRides';
import OfferRide from '../screens/OfferRide';
import MyRides from '../screens/MyRides';
import Messages from '../screens/Messages';
import UserProfile from '../screens/UserProfile';
import MapPreviewScreen from '../screens/MapPreviewScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const iconMap = {
            'Find Ride': 'search',
            'Offer Ride': 'add-circle-outline',
            'My Rides': 'car',
            'Messages': 'chatbox',
            'Profile': 'person',
        } as const;
          return <Ionicons name={iconMap[route.name as keyof typeof iconMap]} size={size} color={color} />
        },
        tabBarActiveTintColor: '#2f95dc',
        tabBarInactiveTintColor: 'gray',
        headerTitleAlign: 'center',
      })}
    >
      <Tab.Screen name="Find Ride" component={SearchRides} />
      {user?.is_driver && <Tab.Screen name="Offer Ride" component={OfferRide} />}
      <Tab.Screen name="My Rides" component={MyRides} />
      <Tab.Screen name="Messages" component={Messages} />
      <Tab.Screen name="Profile" component={UserProfile} />
      <Tab.Screen name="Map" component={MapPreviewScreen} />
    </Tab.Navigator>
  );
}