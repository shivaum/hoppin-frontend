import React from "react";
import { View, Text, StyleSheet } from "react-native";

type ProfileRatingProps = {
  driverRating: number | null;
  riderRating: number | null;
};

export default function ProfileRating({ driverRating, riderRating }: ProfileRatingProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Driver Rating: {driverRating !== null ? driverRating : "Not rated yet"}
      </Text>
      <Text style={styles.label}>
        Rider Rating: {riderRating !== null ? riderRating : "Not rated yet"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 12 },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
});