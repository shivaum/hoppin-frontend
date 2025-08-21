// src/navigation/MainStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import RideDetails from '../screens/RideDetails';
import type { MainStackParamList } from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Tabs live here */}
      <Stack.Screen name="Tabs" component={TabNavigator} />
      {/* Pushed over tabs */}
      <Stack.Screen
        name="RideDetails"
        component={RideDetails}
        // If you want a header on the details screen, flip this:
        // options={{ headerShown: true, title: 'Ride Details' }}
      />
    </Stack.Navigator>
  );
}