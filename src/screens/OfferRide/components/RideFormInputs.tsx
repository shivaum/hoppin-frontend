// src/screens/OfferRide/components/RideFormInputs.tsx
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import UnifiedLocationInput, { LatLng } from '../../../components/common/inputs/UnifiedLocationInput';

interface RideFormInputsProps {
  apiKey: string;
  pickupText: string;
  dropoffText: string;
  availableSeats: string;
  pricePerSeat: string;
  onPickupTextChange: (text: string) => void;
  onDropoffTextChange: (text: string) => void;
  onPickupSelect: (addr: string, coords: LatLng | null) => void;
  onDropoffSelect: (addr: string, coords: LatLng | null) => void;
  onAvailableSeatsChange: (text: string) => void;
  onPricePerSeatChange: (text: string) => void;
}

export function RideFormInputs({
  apiKey,
  pickupText,
  dropoffText,
  availableSeats,
  pricePerSeat,
  onPickupTextChange,
  onDropoffTextChange,
  onPickupSelect,
  onDropoffSelect,
  onAvailableSeatsChange,
  onPricePerSeatChange,
}: RideFormInputsProps) {
  return (
    <>
      {/* Pick-up */}
      <Text style={styles.label}>Pick up</Text>
      <View style={styles.inputWrap}>
        <UnifiedLocationInput
          apiKey={apiKey}
          value={pickupText}
          onChange={onPickupTextChange}
          onSelect={(addr, coords) => onPickupSelect(addr, coords ?? null)}
        />
      </View>

      {/* Drop-off */}
      <Text style={[styles.label, { marginTop: 10 }]}>Drop off</Text>
      <View style={styles.inputWrap}>
        <UnifiedLocationInput
          apiKey={apiKey}
          value={dropoffText}
          onChange={onDropoffTextChange}
          onSelect={(addr, coords) => onDropoffSelect(addr, coords ?? null)}
        />
      </View>

      {/* Available Seats */}
      <Text style={[styles.label, { marginTop: 10 }]}>Available seats</Text>
      <View style={styles.fakeInput}>
        <TextInput
          style={styles.textInput}
          value={availableSeats}
          onChangeText={onAvailableSeatsChange}
          placeholder="Number of seats"
          keyboardType="numeric"
          maxLength={1}
        />
      </View>

      {/* Price per Seat */}
      <Text style={[styles.label, { marginTop: 10 }]}>Price per seat ($)</Text>
      <View style={styles.fakeInput}>
        <TextInput
          style={styles.textInput}
          value={pricePerSeat}
          onChangeText={onPricePerSeatChange}
          placeholder="Price in dollars"
          keyboardType="numeric"
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    fontWeight: '700',
    color: '#111827',
    marginTop: 6,
  },
  inputWrap: {
    marginTop: 6,
  },
  fakeInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textInput: {
    color: '#111827',
    fontSize: 16,
    padding: 0,
  },
});