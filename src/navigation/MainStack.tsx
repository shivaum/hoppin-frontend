// src/navigation/MainStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import RideDetails from '../screens/RideDetails';
import DriverVerificationRequirements from '../screens/DriverVerificationRequirements';
import DriverVerificationUpload from '../screens/DriverVerificationUpload';
import OfferRide from '../screens/OfferRide';
import EditRide from '../screens/EditRide';
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
      />
      <Stack.Screen
        name="OfferRide"
        component={OfferRide}
        options={{
          title: 'Offer ride',
          presentation: 'modal', // looks nice as a sheet/modal
        }}
      />
      <Stack.Screen
        name="EditRide"
        component={EditRide}
      />
      {/* Driver Verification Screens */}
      <Stack.Screen
        name="DriverVerificationRequirements"
        component={DriverVerificationRequirements}
      />
      <Stack.Screen
        name="DriverVerificationUpload"
        component={DriverVerificationUpload}
      />
    </Stack.Navigator>
  );
}