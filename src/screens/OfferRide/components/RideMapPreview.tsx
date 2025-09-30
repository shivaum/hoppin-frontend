// src/screens/OfferRide/components/RideMapPreview.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Map from '../../../components/common/map/Map';
import type { LatLng } from '../../../components/common/inputs/UnifiedLocationInput';

interface RideMapPreviewProps {
  haveStart: boolean;
  haveEnd: boolean;
  pickup: LatLng | null;
  dropoff: LatLng | null;
  pickupText: string;
  dropoffText: string;
  mapRegion: any;
}

export function RideMapPreview({
  haveStart,
  haveEnd,
  pickup,
  dropoff,
  pickupText,
  dropoffText,
  mapRegion,
}: RideMapPreviewProps) {
  if (!haveStart && !haveEnd) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>Add a pick-up or drop-off to preview</Text>
      </View>
    );
  }

  return (
    <Map
      start={haveStart ? { latitude: pickup!.lat, longitude: pickup!.lng } : { latitude: 0, longitude: 0 }}
      end={haveEnd ? { latitude: dropoff!.lat, longitude: dropoff!.lng } : { latitude: 0, longitude: 0 }}
      startAddress={pickupText}
      endAddress={dropoffText}
      region={mapRegion}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  fallbackText: {
    color: '#6B7280',
  },
});