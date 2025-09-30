// src/screens/MyRides/components/OfferRideButton.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OfferRideButtonProps {
  onPress: () => void;
}

export function OfferRideButton({ onPress }: OfferRideButtonProps) {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerSpacer} />
      <TouchableOpacity
        style={styles.offerBtn}
        onPress={onPress}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Offer a ride"
      >
        <Ionicons name="add" size={16} color="#fff" style={{ marginRight: 6 }} />
        <Text style={styles.offerBtnText}>Offer ride</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  headerSpacer: {
    flex: 1,
  },
  offerBtn: {
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  offerBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});