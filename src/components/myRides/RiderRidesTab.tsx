import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, View, Text, RefreshControl } from 'react-native';
import type { RideRequestItem, EnhancedSearchRide } from '../../types';
import EnhancedRideCard from '../searchRides/EnhancedRideCard';
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
  const convertToEnhancedSearchRide = useCallback((request: RideRequestItem): EnhancedSearchRide => ({
      ride_id: request.ride_id,
      driver_id: '', // Not available in RideRequestItem
      start_location: request.start_location,
      end_location: request.end_location,
      departure_time: request.departure_time,
      available_seats: request.available_seats,
      price_per_seat: request.price_per_seat,
      status: request.status,
      my_request_status: request.status,
      driver: {
        name: request.driver_name,
        photo: request.driver_photo,
        rating: request.driver_rating,
        total_rides: request.driver_total_rides,
      },
      popularity_score: 0,
      coordinates: {
        start_lat: null,
        start_lng: null,
        end_lat: null,
        end_lng: null,
      }
  }), []);

  // Sort ride requests by departure time (earliest first)
  const sortRidesByDate = (requests: RideRequestItem[]): RideRequestItem[] => {
    return requests.sort((a, b) => {
      const aTime = new Date(a.departure_time).getTime();
      const bTime = new Date(b.departure_time).getTime();
      
      return aTime - bTime; // Ascending order (earliest dates first)
    });
  };

  // Self-fetch if no data provided
  useEffect(() => {
    let mounted = true;
    if (rideRequests === undefined) {
      (async () => {
        try {
          const data = await getMyRideRequests();
          if (mounted) setLocal(sortRidesByDate(data));
        } catch {}
      })();
    } else {
      setLocal(sortRidesByDate(rideRequests));
    }
    return () => { mounted = false; };
  }, [rideRequests]);

  const handleRefresh = async () => {
    if (onRefresh) return onRefresh();
    if (rideRequests !== undefined) return; // parent owns data
    setRefreshing(true);
    try {
      const data = await getMyRideRequests();
      setLocal(sortRidesByDate(data));
    } catch {} finally {
      setRefreshing(false);
    }
  };

  return (
    <FlatList
      data={local ?? []}
      keyExtractor={(r) => r.request_id}
      renderItem={({ item }) => (
        <EnhancedRideCard
          ride={convertToEnhancedSearchRide(item)}
          myProfileId={user?.id}
          myRequestStatus={item.status}
          onRequestRide={() => {}} // No-op since these are already requested rides
          role="rider"
          showEnhancedData={false} // Don't show enhanced badges for ride requests
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