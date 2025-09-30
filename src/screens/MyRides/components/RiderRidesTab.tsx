// src/screens/MyRides/components/RiderRidesTab.tsx
import React from 'react';
import { FlatList, View, Text, RefreshControl, StyleSheet } from 'react-native';
import type { RideRequestItem } from '../../../types';
import RiderRideItem from '../../../components/myRides/RiderRideItem';

interface RiderRidesTabProps {
  requests: RideRequestItem[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
}

export function RiderRidesTab({
  requests,
  loading,
  refreshing,
  onRefresh,
}: RiderRidesTabProps) {
  return (
    <FlatList
      data={requests}
      keyExtractor={(r) => r.request_id}
      renderItem={({ item }) => <RiderRideItem request={item} />}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={loading || refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No requests yet.</Text>
        </View>
      }
      ListFooterComponent={<View style={styles.footer} />}
    />
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingTop: 8,
    paddingBottom: 12,
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6B7280',
  },
  footer: {
    height: 4,
  },
});