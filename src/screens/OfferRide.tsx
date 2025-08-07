import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import Toast from 'react-native-toast-message';
import Constants from 'expo-constants';
import 'react-native-get-random-values';
import { createRide } from '../integrations/hopin-backend/driver';

import LocationInput from '../components/offerRides/LocationInput';
import DateTimePickerRow from '../components/offerRides/DateTimePickerRow';
import NumericInput from '../components/offerRides/NumericInput';
import SubmitButton from '../components/offerRides/SubmitButton';

export default function OfferRide() {
  const apiKey = Constants.expoConfig?.extra?.googleMapsApiKey as string;

  const now = new Date();
  now.setMinutes(0, 0, 0);
  const nextHour = new Date(now.getTime() + 60 * 60 * 1000);

  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [startCoords, setStartCoords] = useState({ lat: 0, lng: 0 });
  const [endCoords, setEndCoords] = useState({ lat: 0, lng: 0 });

  const [date, setDate] = useState(nextHour);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [availableSeats, setAvailableSeats] = useState('1');
  const [pricePerSeat, setPricePerSeat] = useState('5.00');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onChangeDate = (_: any, selected?: Date) => {
    setShowDatePicker(false);
    if (selected) {
      const dt = new Date(selected);
      dt.setHours(date.getHours(), date.getMinutes());
      setDate(dt);
    }
  };

  const onChangeTime = (_: any, selected?: Date) => {
    setShowTimePicker(false);
    if (selected) {
      const dt = new Date(date);
      dt.setHours(selected.getHours(), selected.getMinutes());
      setDate(dt);
    }
  };

  const handleSubmit = async () => {
    const seats = parseInt(availableSeats, 10);
    if (isNaN(seats) || seats < 1 || seats > 7) {
      Toast.show({ type: 'error', text1: 'Seats must be between 1 and 7' });
      return;
    }

    const price = parseFloat(pricePerSeat);
    if (
      isNaN(price) ||
      price < 0 ||
      price > 100 ||
      !/^\d+(\.\d{1,2})?$/.test(pricePerSeat)
    ) {
      Toast.show({ type: 'error', text1: 'Price must be 0–100, max two decimals' });
      return;
    }

    if (!startLocation || !endLocation) {
      Toast.show({ type: 'error', text1: 'Enter both pickup and destination' });
      return;
    }

    setIsSubmitting(true);
    try {
      await createRide({
        startLocation,
        endLocation,
        departureTime: date.toISOString(),
        availableSeats: seats,
        pricePerSeat: price,
        startLat: startCoords.lat,
        startLng: startCoords.lng,
        endLat: endCoords.lat,
        endLng: endCoords.lng,
        status: 'available',
      });
      Toast.show({
        type: 'success',
        text1: 'Ride offered!',
        text2: 'Your ride has been posted.',
      });
      // reset form
      setStartLocation('');
      setEndLocation('');
      setStartCoords({ lat: 0, lng: 0 });
      setEndCoords({ lat: 0, lng: 0 });
      setDate(nextHour);
      setAvailableSeats('1');
      setPricePerSeat('5.00');
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: err.message || 'Try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const startRef = useRef<any>(null);
  const endRef = useRef<any>(null);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <View style={styles.container}>
        <Text style={styles.heading}>Offer a Ride</Text>

        <LocationInput
          ref={startRef}
          label="Pickup"
          apiKey={apiKey}
          value={startLocation}
          onChange={setStartLocation}
          onSelect={(loc, coords) => {
            setStartLocation(loc);
            setStartCoords(coords);
          }}
        />

        <LocationInput
          ref={endRef}
          label="Destination"
          apiKey={apiKey}
          value={endLocation}
          onChange={setEndLocation}
          onSelect={(loc, coords) => {
            setEndLocation(loc);
            setEndCoords(coords);
          }}
        />

        <DateTimePickerRow
          date={date}
          showDate={showDatePicker}
          showTime={showTimePicker}
          onDatePress={() => setShowDatePicker(true)}
          onTimePress={() => setShowTimePicker(true)}
          onChangeDate={onChangeDate}
          onChangeTime={onChangeTime}
        />

        <NumericInput
          label="Seats"
          value={availableSeats}
          keyboardType="number-pad"
          onChange={setAvailableSeats}
          maxLength={1}
        />

        <NumericInput
          label="Price ($)"
          value={pricePerSeat}
          keyboardType="decimal-pad"
          onChange={setPricePerSeat}
        />

        <SubmitButton
          title={isSubmitting ? 'Posting…' : 'Offer Ride'}
          onPress={handleSubmit}
          disabled={isSubmitting}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  heading: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
});