import React from 'react';
import { FlatList, View } from 'react-native';
import type { DriverRide } from '../../types';
import DriverRideItem from './DriverRideItem';

export default function DriverRidesTab({
  driverRides,
  onAction,
  loading,
  onRefresh,
}: {
  driverRides: DriverRide[];
  onAction: (requestId: string, action: 'accepted' | 'declined') => void;
  loading?: boolean;
  onRefresh?: () => void;
}) {
  return (
    <FlatList
      data={driverRides}
      keyExtractor={(r) => r.id}
      renderItem={({ item }) => <DriverRideItem ride={item} onAction={onAction} />}
      contentContainerStyle={{ padding: 16 }}
      refreshing={!!loading}
      onRefresh={onRefresh}
      ListFooterComponent={<View style={{ height: 8 }} />}
    />
  );
}