import { GOOGLE_MAPS_API_KEY } from "@env";
import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, LatLng } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";

type MapProps = {
  start: { latitude: number; longitude: number };
  end: { latitude: number; longitude: number };
};

export default function Map({ start, end }: MapProps) {
  const region = {
    latitude: (start.latitude + end.latitude) / 2,
    longitude: (start.longitude + end.longitude) / 2,
    latitudeDelta: Math.abs(start.latitude - end.latitude) * 2 || 0.05,
    longitudeDelta: Math.abs(start.longitude - end.longitude) * 2 || 0.05,
  };
  return (
    <View style={styles.root}>
    <MapView 
      style={StyleSheet.absoluteFillObject} 
      provider={PROVIDER_GOOGLE} 
      initialRegion={region}
    >
      <Marker coordinate={start} />
      <Marker coordinate={end} />
      <MapViewDirections
          origin={start}
          destination={end}
          apikey={GOOGLE_MAPS_API_KEY}
          strokeWidth={4}
          strokeColor="purple"
        />
    </MapView>
  </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});