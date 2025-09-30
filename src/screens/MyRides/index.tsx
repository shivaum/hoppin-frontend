// src/screens/MyRides/index.tsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import type { MainStackParamList } from '../../navigation/types';

// Components
import { SegmentedControl } from './components/SegmentedControl';
import { OfferRideButton } from './components/OfferRideButton';
import { DriverRidesTab } from './components/DriverRidesTab';
import { RiderRidesTab } from './components/RiderRidesTab';

// Hooks
import { useDriverRides } from './hooks/useDriverRides';
import { useRiderRides } from './hooks/useRiderRides';

type Mode = 'driver' | 'rider';
type Nav = NativeStackNavigationProp<MainStackParamList>;

export default function MyRides() {
  const { user } = useAuth();
  const navigation = useNavigation<Nav>();
  const isDriver = !!user?.is_driver;

  const [mode, setMode] = useState<Mode>(isDriver ? 'driver' : 'rider');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Driver rides hook
  const {
    rides: driverRides,
    loading: driverLoading,
    refreshing: driverRefreshing,
    refresh: refreshDriverRides,
    handleAcceptRequest,
    handleDeclineRequest,
  } = useDriverRides(refreshTrigger);

  // Rider rides hook
  const {
    requests: riderRequests,
    loading: riderLoading,
    refreshing: riderRefreshing,
    refresh: refreshRiderRides,
  } = useRiderRides();

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      setRefreshTrigger((prev) => prev + 1);
    }, [])
  );

  const handleOfferRide = () => {
    navigation.navigate('OfferRide');
  };

  return (
    <View style={styles.root}>
      {/* Offer Ride Button - Top Right */}
      {isDriver && <OfferRideButton onPress={handleOfferRide} />}

      {/* Segmented control */}
      <SegmentedControl mode={mode} onModeChange={setMode} showDriverMode={isDriver} />

      {/* Content */}
      <View style={styles.content}>
        {mode === 'driver' ? (
          <DriverRidesTab
            rides={driverRides}
            loading={driverLoading}
            refreshing={driverRefreshing}
            onRefresh={refreshDriverRides}
            onAction={async (requestId, action) => {
              if (action === 'accepted') {
                await handleAcceptRequest(requestId);
              } else {
                await handleDeclineRequest(requestId);
              }
            }}
          />
        ) : (
          <RiderRidesTab
            requests={riderRequests}
            loading={riderLoading}
            refreshing={riderRefreshing}
            onRefresh={refreshRiderRides}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },
  content: {
    flex: 1,
    paddingTop: 8,
  },
});