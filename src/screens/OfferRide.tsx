// src/screens/OfferRide.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

import Map from '../components/common/map/Map';
import LocationInput, { LatLng } from '../components/common/inputs/LocationInput';
import CalendarModal from '../components/common/modals/CalendarModal';
import DateTimePickerRow from '../components/common/inputs/DateTimePickerRow';
import { createRide } from '../integrations/hopin-backend/driver';
import type { MainStackParamList } from '../navigation/types';
import { formatDateForAPI } from '../utils/dateTime';

type Nav = NativeStackNavigationProp<MainStackParamList, any>;

export default function OfferRide() {
  const navigation = useNavigation<Nav>();
  const apiKey = Constants.expoConfig?.extra?.googleMapsApiKey as string;

  // Form state
  const [pickupText, setPickupText] = useState('');
  const [dropoffText, setDropoffText] = useState('');
  const [pickup, setPickup] = useState<LatLng | null>(null);
  const [dropoff, setDropoff] = useState<LatLng | null>(null);

  // Initialize with next closest hour
  const getNextHour = () => {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0); // Next hour, zero minutes/seconds
    return nextHour;
  };
  
  const [departureDate, setDepartureDate] = useState<Date>(getNextHour());
  const [dateISO, setDateISO] = useState<string | null>(null);
  const [tempDate, setTempDate] = useState<Date>(getNextHour()); // Temporary date for picker

  const [showCalendar, setShowCalendar] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [availableSeats, setAvailableSeats] = useState('1');
  const [pricePerSeat, setPricePerSeat] = useState('5');

  // Helper function to check if selected date/time is in the future
  const isDateTimeInFuture = () => {
    if (!dateISO) return false;
    const now = new Date();
    const selectedDateTime = new Date(departureDate);
    return selectedDateTime > now;
  };

  // Derived
  const canSubmit = !!pickup && !!dropoff && !!dateISO && !!pickupText && !!dropoffText && !!availableSeats && !!pricePerSeat && Number(availableSeats) > 0 && Number(pricePerSeat) > 0 && isDateTimeInFuture();

  const departureISO = useMemo(() => {
    if (!dateISO) return null;
    return formatDateForAPI(departureDate);
  }, [dateISO, departureDate]);

  // Readable labels
  const dateLabel = useMemo(() => {
    if (!dateISO) return 'Select date';
    return departureDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }, [dateISO, departureDate]);

  // Helper function to reset to next hour
  const resetToCurrentTime = () => {
    const nextHour = getNextHour();
    setDepartureDate(nextHour);
    setTempDate(nextHour);
    
    // Update dateISO
    const year = nextHour.getFullYear();
    const month = String(nextHour.getMonth() + 1).padStart(2, '0');
    const day = String(nextHour.getDate()).padStart(2, '0');
    setDateISO(`${year}-${month}-${day}`);
  };

  // Date/time picker handlers
  const handleDateChange = (_: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(departureDate);
      newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      setDepartureDate(newDate);
      setTempDate(newDate);
      // Update dateISO to trigger canSubmit validation
      const year = newDate.getFullYear();
      const month = String(newDate.getMonth() + 1).padStart(2, '0');
      const day = String(newDate.getDate()).padStart(2, '0');
      setDateISO(`${year}-${month}-${day}`);
    }
  };

  const handleTimeChange = (_: any, selectedTime?: Date) => {
    // Only update temp date during picker interaction
    if (selectedTime) {
      setTempDate(selectedTime);
    }
  };
  
  const handleTimeConfirm = () => {
    // Validate the selected time
    const now = new Date();
    if (tempDate <= now) {
      Alert.alert(
        'Invalid Time', 
        'Please select a time in the future.',
        [
          {
            text: 'OK',
            onPress: resetToCurrentTime
          }
        ]
      );
      setShowTimePicker(false);
      return;
    }
    
    // Apply the time to the departure date
    const newDate = new Date(departureDate);
    newDate.setHours(tempDate.getHours(), tempDate.getMinutes(), 0, 0);
    setDepartureDate(newDate);
    setShowTimePicker(false);
  };
  
  const handleTimeCancel = () => {
    // Reset temp date to current departure date
    setTempDate(departureDate);
    setShowTimePicker(false);
  };

  const handleCalendarConfirm = (iso: string) => {
    setDateISO(iso);
    const [y, m, d] = iso.split('-').map(Number);
    const newDate = new Date(departureDate);
    newDate.setFullYear(y, m - 1, d);
    setDepartureDate(newDate);
    setShowCalendar(false);
  };

  const handleSubmit = async () => {
    if (!canSubmit || !pickup || !dropoff || !departureISO) return;
    try {
      setSubmitting(true);
      await createRide({
        startLocation: pickupText,
        endLocation: dropoffText,
        departureTime: departureISO,
        availableSeats: Number(availableSeats),
        pricePerSeat: Number(pricePerSeat),
        startLat: pickup.lat,
        startLng: pickup.lng,
        endLat: dropoff.lat,
        endLng: dropoff.lng,
        status: 'available',
      });
      Alert.alert('Ride created', 'Your ride is now available.');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not create ride');
    } finally {
      setSubmitting(false);
    }
  };

  // For Map: show route when both set; otherwise show one pin or fallback
  const haveStart = !!pickup && Number.isFinite(pickup.lat) && Number.isFinite(pickup.lng);
  const haveEnd   = !!dropoff   && Number.isFinite(dropoff.lat)   && Number.isFinite(dropoff.lng);

  // Calculate appropriate map region based on selected locations
  const mapRegion = useMemo(() => {
    if (haveStart && haveEnd) {
      // Both points - show route with padding
      const latPadding = Math.abs(pickup!.lat - dropoff!.lat) * 0.5 || 0.01;
      const lngPadding = Math.abs(pickup!.lng - dropoff!.lng) * 0.5 || 0.01;
      return {
        latitude: (pickup!.lat + dropoff!.lat) / 2,
        longitude: (pickup!.lng + dropoff!.lng) / 2,
        latitudeDelta: Math.max(latPadding * 2, 0.02),
        longitudeDelta: Math.max(lngPadding * 2, 0.02),
      };
    } else if (haveStart) {
      // Only pickup - zoom in on pickup location
      return {
        latitude: pickup!.lat,
        longitude: pickup!.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    } else if (haveEnd) {
      // Only dropoff - zoom in on dropoff location
      return {
        latitude: dropoff!.lat,
        longitude: dropoff!.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }
    return undefined; // No region - will use default
  }, [haveStart, haveEnd, pickup, dropoff]);

  return (
    <View style={styles.root}>
      {/* Map background */}
      <View style={styles.mapWrap}>
        {haveStart || haveEnd ? (
          // Your Map component should accept optional markers
          <Map
            start={haveStart ? { latitude: pickup!.lat, longitude: pickup!.lng } : { latitude: 0, longitude: 0 }}
            end={haveEnd ? { latitude: dropoff!.lat, longitude: dropoff!.lng } : { latitude: 0, longitude: 0 }}
            startAddress={pickupText}
            endAddress={dropoffText}
            region={mapRegion}
          />
        ) : (
          // fallback region / placeholder
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6' }}>
            <Text style={{ color: '#6B7280' }}>Add a pick-up or drop-off to preview</Text>
          </View>
        )}
      </View>

      {/* Back */}
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} color="#111827" />
      </TouchableOpacity>

      {/* Bottom sheet card */}
      <View style={styles.sheet}>
        <Text style={styles.title}>Offer a ride</Text>
        <Text style={styles.subtitle}>Enter the details of your ride</Text>

        {/* Pick-up */}
        <Text style={styles.label}>Pick up</Text>
        <View style={styles.inputWrap}>
          <LocationInput
            ref={null}
            apiKey={apiKey}
            value={pickupText}
            onChange={setPickupText}
            onSelect={(addr, coords) => {
              setPickupText(addr);
              setPickup(coords);
            }}
          />
        </View>

        {/* Drop-off */}
        <Text style={[styles.label, { marginTop: 10 }]}>Drop off</Text>
        <View style={styles.inputWrap}>
          <LocationInput
            ref={null}
            apiKey={apiKey}
            value={dropoffText}
            onChange={setDropoffText}
            onSelect={(addr, coords) => {
              setDropoffText(addr);
              setDropoff(coords);
            }}
          />
        </View>

        {/* Date & Time Picker */}
        <DateTimePickerRow
          date={departureDate}
          onDatePress={() => setShowCalendar(true)}
          onTimePress={() => {
            setTempDate(departureDate);
            setShowTimePicker(true);
          }}
          showDate={false}
          showTime={showTimePicker}
          onChangeDate={handleDateChange}
          onChangeTime={handleTimeChange}
          tempDate={tempDate}
          onTimeConfirm={handleTimeConfirm}
          onTimeCancel={handleTimeCancel}
        />

        {/* Available Seats */}
        <Text style={[styles.label, { marginTop: 10 }]}>Available seats</Text>
        <View style={styles.fakeInput}>
          <TextInput
            style={styles.textInput}
            value={availableSeats}
            onChangeText={setAvailableSeats}
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
            onChangeText={setPricePerSeat}
            placeholder="Price in dollars"
            keyboardType="numeric"
          />
        </View>

        {/* Date/Time Validation Warning */}
        {dateISO && !isDateTimeInFuture() && (
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              ⚠️ Please select a future date and time to offer your ride.
            </Text>
          </View>
        )}
        
        {/* CTA */}
        <TouchableOpacity
          style={[styles.cta, (!canSubmit || submitting) && { opacity: 0.5 }]}
          disabled={!canSubmit || submitting}
          onPress={handleSubmit}
        >
          <Text style={styles.ctaText}>{submitting ? 'Posting…' : 'Offer ride'}</Text>
        </TouchableOpacity>
      </View>

      {/* Calendar modal */}
      <CalendarModal
        visible={showCalendar}
        initialDate={dateISO || undefined}
        onClose={() => setShowCalendar(false)}
        onConfirm={handleCalendarConfirm}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  mapWrap: { flex: 1 },
  mapFallback: { flex: 1, backgroundColor: '#F3F4F6' },
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

  label: { fontWeight: '700', color: '#111827', marginTop: 6 },
  inputWrap: { marginTop: 6 },

  fakeInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  fakeInputText: { color: '#111827' },
  placeholder: { color: '#9CA3AF' },
  textInput: {
    color: '#111827',
    fontSize: 16,
    padding: 0,
  },

  cta: {
    marginTop: 14,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  
  warningContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  warningText: {
    color: '#92400E',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});