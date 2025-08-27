// src/components/myRides/DriverRidesTab.tsx
import React, { useEffect, useState } from 'react';
import { FlatList, View, Text, RefreshControl } from 'react-native';
import type { DriverRide } from '../../types';
import DriverRideItem from './DriverRideItem';
import {
  getMyDriverRides,
  acceptRideRequest,
  declineRideRequest,
} from '../../integrations/hopin-backend/driver';

type Props = {
  driverRides?: DriverRide[];
  onAction?: (requestId: string, action: 'accepted' | 'declined') => void;
  loading?: boolean;
  onRefresh?: () => void;
};

export default function DriverRidesTab({
  driverRides,
  onAction,
  loading,
  onRefresh,
}: Props) {
  const [local, setLocal] = useState<DriverRide[] | null>(driverRides ?? null);
  const [refreshing, setRefreshing] = useState(false);

  // Self-fetch if the parent didn't pass data
  useEffect(() => {
    let mounted = true;
    if (driverRides === undefined) {
      (async () => {
        try {
          const data = await getMyDriverRides();
          if (mounted) setLocal(data);
        } catch {}
      })();
    } else {
      setLocal(driverRides);
    }
    return () => { mounted = false; };
  }, [driverRides]);

  const selfRefresh = async () => {
    const data = await getMyDriverRides();
    setLocal(data);
  };

  const handleRefresh = async () => {
    if (onRefresh) return onRefresh();
    if (driverRides !== undefined) return; // parent owns data
    setRefreshing(true);
    try { await selfRefresh(); } finally { setRefreshing(false); }
  };

  const handleAction = async (requestId: string, action: 'accepted' | 'declined') => {
    if (onAction) return onAction(requestId, action);
    // Self-handle
    if (action === 'accepted') {
      await acceptRideRequest(requestId);
    } else {
      await declineRideRequest(requestId);
    }
    await selfRefresh();
  };

  return (
    <FlatList
      data={local ?? []}
      keyExtractor={(r) => r.id}
      renderItem={({ item }) => (
        <DriverRideItem ride={item} onAction={handleAction} />
      )}
      contentContainerStyle={{ paddingTop: 8, paddingBottom: 12 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={!!loading || refreshing}
          onRefresh={handleRefresh}
        />
      }
      ListEmptyComponent={
        <View style={{ paddingVertical: 32, alignItems: 'center' }}>
          <Text style={{ color: '#6B7280' }}>No rides yet.</Text>
        </View>
      }
      ListFooterComponent={<View style={{ height: 4 }} />}
    />
  );
}