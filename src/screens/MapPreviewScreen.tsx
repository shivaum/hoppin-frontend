import React from "react";
import { View } from "react-native";
import Map from "../components/map/Map";

export default function MapPreviewScreen() {
  return (
    <View>
      <Map
        start={{ latitude: 37.7599, longitude: -122.4148 }} // Example: Mission District
        end={{ latitude: 37.8079, longitude: -122.4177 }}   // Example: Fisherman's Wharf
      />
    </View>
  );
}