import { GOOGLE_MAPS_API_KEY } from "@env";
import React, { useRef, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";

type MapProps = {
  start: { latitude: number; longitude: number };
  end: { latitude: number; longitude: number };
  startAddress?: string;
  endAddress?: string;
  region?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
};

export default function Map({ start, end, startAddress, endAddress, region: customRegion }: MapProps) {
  const mapRef = useRef<MapView>(null);
  
  const defaultRegion = {
    latitude: (start.latitude + end.latitude) / 2,
    longitude: (start.longitude + end.longitude) / 2,
    latitudeDelta: Math.abs(start.latitude - end.latitude) * 2 || 0.05,
    longitudeDelta: Math.abs(start.longitude - end.longitude) * 2 || 0.05,
  };
  
  const region = customRegion || defaultRegion;
  
  // Check if we have both valid coordinates
  const hasValidRoute = start.latitude !== 0 && start.longitude !== 0 && 
                       end.latitude !== 0 && end.longitude !== 0 &&
                       (start.latitude !== end.latitude || start.longitude !== end.longitude);

  // Animation effect when both locations are set
  useEffect(() => {
    if (hasValidRoute && mapRef.current) {
      // Small delay to ensure map is rendered
      const timer = setTimeout(() => {
        // Calculate region that shows both points with padding
        const latPadding = Math.abs(start.latitude - end.latitude) * 0.5 || 0.01;
        const lngPadding = Math.abs(start.longitude - end.longitude) * 0.5 || 0.01;
        
        const animatedRegion = {
          latitude: (start.latitude + end.latitude) / 2,
          longitude: (start.longitude + end.longitude) / 2,
          latitudeDelta: Math.max(latPadding * 2.5, 0.02), // Slightly more padding for better view
          longitudeDelta: Math.max(lngPadding * 2.5, 0.02),
        };
        
        mapRef.current?.animateToRegion(animatedRegion, 1500); // 1.5 second animation
      }, 500); // 500ms delay
      
      return () => clearTimeout(timer);
    }
  }, [hasValidRoute, start.latitude, start.longitude, end.latitude, end.longitude]);

  return (
    <View style={styles.root}>
      <MapView 
        ref={mapRef}
        style={StyleSheet.absoluteFillObject} 
        provider={PROVIDER_GOOGLE} 
        initialRegion={region}
      >
        <Marker coordinate={start} title="Start" description={startAddress} />
        <Marker coordinate={end} title="End" description={endAddress} />
        <MapViewDirections
          origin={start}
          destination={end}
          apikey={GOOGLE_MAPS_API_KEY}
          strokeWidth={4}
          strokeColor="#4285F4"
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});