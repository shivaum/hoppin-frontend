import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, View, Text, RefreshControl } from 'react-native';
import type { RideRequestItem } from '../../types';
import RiderRideItem from './RiderRideItem';
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
        <RiderRideItem
          request={item}
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