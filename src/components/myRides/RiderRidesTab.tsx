import React from 'react';
import { FlatList, View } from 'react-native';
import type { RideRequestItem } from '../../types';
import RiderRideItem from './RiderRideItem';

export default function RiderRidesTab({
  rideRequests,
  loading,
  onRefresh,
}: {
  rideRequests: RideRequestItem[];
  loading?: boolean;
  onRefresh?: () => void;
}) {
  return (
    <FlatList
      data={rideRequests}
      keyExtractor={(r) => r.request_id}
      renderItem={({ item }) => <RiderRideItem request={item} />}
      contentContainerStyle={{ padding: 16 }}
      refreshing={!!loading}
      onRefresh={onRefresh}
      ListFooterComponent={<View style={{ height: 8 }} />}
    />
  );
}