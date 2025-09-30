// src/screens/MyRides/components/DriverRidesTab.tsx
import React from 'react';
import { FlatList, View, Text, RefreshControl, StyleSheet } from 'react-native';
import type { DriverRide } from '../../../types';
import DriverRideItem from './DriverRideItem';

interface DriverRidesTabProps {
  rides: DriverRide[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onAction: (requestId: string, action: 'accepted' | 'declined') => Promise<void>;
}

export function DriverRidesTab({
  rides,
  loading,
  refreshing,
  onRefresh,
  onAction,
}: DriverRidesTabProps) {
  return (
    <FlatList
      data={rides}
      keyExtractor={(r) => r.id}
      renderItem={({ item }) => <DriverRideItem ride={item} onAction={onAction} />}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={loading || refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No rides yet.</Text>
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