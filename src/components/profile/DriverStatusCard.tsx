import React from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";

type Props = {
  isDriver: boolean;
  onStartVerification: () => void;
};

export default function DriverStatusCard({ isDriver, onStartVerification }: Props) {
  return (
    <View style={[styles.card, isDriver ? styles.verified : styles.unverified]}>
      {isDriver ? (
        <Text style={styles.verifiedText}>✅ You have been verified to drive</Text>
      ) : (
        <>
          <Text style={styles.unverifiedText}>You’re not verified to drive yet.</Text>
          <TouchableOpacity style={styles.verifyBtn} onPress={onStartVerification}>
            <Text style={styles.verifyBtnText}>Start Driver Verification</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  verified: {
    backgroundColor: "#d1fae5",
    borderColor: "#34d399",
    borderWidth: 1,
  },
  unverified: {
    backgroundColor: "#fef2f2",
    borderColor: "#f87171",
    borderWidth: 1,
  },
  verifiedText: {
    color: "#065f46",
    fontWeight: "500",
  },
  unverifiedText: {
    color: "#991b1b",
    marginBottom: 8,
    fontWeight: "500",
  },
  verifyBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#ef4444",
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  verifyBtnText: {
    color: "white",
    fontWeight: "600",
  },
});