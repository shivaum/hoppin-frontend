// src/screens/OfferRide/index.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import type { MainStackParamList } from '../../navigation/types';

// Components
import { RideMapPreview } from './components/RideMapPreview';
import { RideFormInputs } from './components/RideFormInputs';
import { DateTimeSection } from './components/DateTimeSection';

// Hooks
import { useRideForm } from './hooks/useRideForm';
import { useDateTimePicker } from './hooks/useDateTimePicker';

type Nav = NativeStackNavigationProp<MainStackParamList, any>;

export default function OfferRide() {
  const navigation = useNavigation<Nav>();
  const apiKey = Constants.expoConfig?.extra?.googleMapsApiKey as string;

  // Date/time picker hook
  const dateTimePicker = useDateTimePicker();

  // Ride form hook
  const rideForm = useRideForm(dateTimePicker.departureDate, dateTimePicker.dateISO, () =>
    navigation.goBack()
  );

  return (
    <View style={styles.root}>
      {/* Map background */}
      <View style={styles.mapWrap}>
        <RideMapPreview
          haveStart={rideForm.haveStart}
          haveEnd={rideForm.haveEnd}
          pickup={rideForm.pickup}
          dropoff={rideForm.dropoff}
          pickupText={rideForm.pickupText}
          dropoffText={rideForm.dropoffText}
          mapRegion={rideForm.mapRegion}
        />
      </View>

      {/* Back */}
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} color="#111827" />
      </TouchableOpacity>

      {/* Bottom sheet card */}
      <View style={styles.sheet}>
        <Text style={styles.title}>Offer a ride</Text>
        <Text style={styles.subtitle}>Enter the details of your ride</Text>

        <RideFormInputs
          apiKey={apiKey}
          pickupText={rideForm.pickupText}
          dropoffText={rideForm.dropoffText}
          availableSeats={rideForm.availableSeats}
          pricePerSeat={rideForm.pricePerSeat}
          onPickupTextChange={rideForm.setPickupText}
          onDropoffTextChange={rideForm.setDropoffText}
          onPickupSelect={(addr, coords) => {
            rideForm.setPickupText(addr);
            rideForm.setPickup(coords);
          }}
          onDropoffSelect={(addr, coords) => {
            rideForm.setDropoffText(addr);
            rideForm.setDropoff(coords);
          }}
          onAvailableSeatsChange={rideForm.setAvailableSeats}
          onPricePerSeatChange={rideForm.setPricePerSeat}
        />

        <DateTimeSection
          departureDate={dateTimePicker.departureDate}
          dateISO={dateTimePicker.dateISO}
          tempDate={dateTimePicker.tempDate}
          showCalendar={dateTimePicker.showCalendar}
          showTimePicker={dateTimePicker.showTimePicker}
          onDatePress={() => dateTimePicker.setShowCalendar(true)}
          onTimePress={dateTimePicker.openTimePicker}
          onChangeDate={dateTimePicker.handleDateChange}
          onChangeTime={dateTimePicker.handleTimeChange}
          onTimeConfirm={dateTimePicker.handleTimeConfirm}
          onTimeCancel={dateTimePicker.handleTimeCancel}
          onCalendarClose={() => dateTimePicker.setShowCalendar(false)}
          onCalendarConfirm={dateTimePicker.handleCalendarConfirm}
        />

        {/* CTA */}
        <TouchableOpacity
          style={[styles.cta, (!rideForm.canSubmit || rideForm.submitting) && { opacity: 0.5 }]}
          disabled={!rideForm.canSubmit || rideForm.submitting}
          onPress={rideForm.handleSubmit}
        >
          <Text style={styles.ctaText}>{rideForm.submitting ? 'Posting…' : 'Offer ride'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  mapWrap: { flex: 1 },
  back: {
    position: 'absolute',
    top: 44,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
    zIndex: 3,
  },
  sheet: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
  },
  title: { fontSize: 22, fontWeight: '800', color: '#111827' },
  subtitle: { color: '#6B7280', marginTop: 4, marginBottom: 8 },
  cta: {
    marginTop: 14,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});