import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, View, Text, RefreshControl } from 'react-native';
import type { RideRequestItem, Ride } from '../../types';
import RideCard from '../searchRides/RideCard';
import { getMyRideRequests } from '../../integrations/hopin-backend/rider';
import { useAuth } from '../../contexts/AuthContext';

type Props = {
  rideRequests?: RideRequestItem[];
  loading?: boolean;
  onRefresh?: () => void;
};

export default function RiderRidesTab({
  rideRequests,
  loading,
  onRefresh,
}: Props) {
  const { user } = useAuth();
  const [local, setLocal] = useState<RideRequestItem[] | null>(rideRequests ?? null);
  const [refreshing, setRefreshing] = useState(false);

  // Convert RideRequestItem to Ride format for RideCard
  const convertToRide = useCallback((request: RideRequestItem): Ride & { myRequestStatus: string | null } => ({
    id: request.ride_id,
    driverId: '', // Not available in RideRequestItem
    startLocation: request.start_location,
    endLocation: request.end_location,
    departureTime: request.departure_time,
    availableSeats: request.available_seats,
    pricePerSeat: request.price_per_seat,
    status: request.status,
    requests: [],
    myRequestStatus: request.status,
    driver: {
      name: request.driver_name,
      photo: null, // Not available in RideRequestItem
      rating: 0, // Not available in RideRequestItem
      totalRides: 0, // Not available in RideRequestItem
    }
  }), []);

  // Self-fetch if no data provided
  useEffect(() => {
    let mounted = true;
    if (rideRequests === undefined) {
      (async () => {
        try {
          const data = await getMyRideRequests();
          if (mounted) setLocal(data);
        } catch {}
      })();
    } else {
      setLocal(rideRequests);
    }
    return () => { mounted = false; };
  }, [rideRequests]);

  const handleRefresh = async () => {
    if (onRefresh) return onRefresh();
    if (rideRequests !== undefined) return; // parent owns data
    setRefreshing(true);
    try {
      const data = await getMyRideRequests();
      setLocal(data);
    } catch {} finally {
      setRefreshing(false);
    }
  };

  return (
    <FlatList
      data={local ?? []}
      keyExtractor={(r) => r.request_id}
      renderItem={({ item }) => (
        <RideCard
          ride={convertToRide(item)}
          myProfileId={user?.id}
          myRequestStatus={item.status}
          onRequestRide={() => {}} // No-op since these are already requested rides
          role="rider"
        />
      )}
      contentContainerStyle={{ paddingTop: 8, paddingBottom: 12 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={!!loading || refreshing} onRefresh={handleRefresh} />
      }
      ListEmptyComponent={
        <View style={{ paddingVertical: 32, alignItems: 'center' }}>
          <Text style={{ color: '#6B7280' }}>No requests yet.</Text>
        </View>
      }
      ListFooterComponent={<View style={{ height: 4 }} />}
    />
  );
}