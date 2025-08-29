// src/screens/OfferRide.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

import Map from '../components/common/map/Map';
import LocationInput, { LatLng } from '../components/common/inputs/LocationInput';
import CalendarModal from '../components/common/modals/CalendarModal';
import { createRide } from '../integrations/hopin-backend/driver';
import type { MainStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<MainStackParamList, any>;

export default function OfferRide() {
  const navigation = useNavigation<Nav>();
  const apiKey = Constants.expoConfig?.extra?.googleMapsApiKey as string;

  // Form state
  const [pickupText, setPickupText] = useState('');
  const [dropoffText, setDropoffText] = useState('');
  const [pickup, setPickup] = useState<LatLng | null>(null);
  const [dropoff, setDropoff] = useState<LatLng | null>(null);

  const [dateISO, setDateISO] = useState<string | null>(null);
  const [timeISO, setTimeISO] = useState<string | null>(null);

  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  // Derived
  const canSubmit = !!pickup && !!dropoff && !!dateISO && !!timeISO && !!pickupText && !!dropoffText;

  const departureISO = useMemo(() => {
    if (!dateISO || !timeISO) return null;
    // Combine date + time (both YYYY-MM-DD and HH:mm in local)
    const [y, m, d] = dateISO.split('-').map(Number);
    const [hh, mm] = timeISO.split(':').map(Number);
    const dt = new Date(y, (m - 1), d, hh, mm, 0, 0);
    return dt.toISOString();
  }, [dateISO, timeISO]);

  // Readable labels
  const dateLabel = useMemo(() => {
    if (!dateISO) return 'Date';
    const [y, m, d] = dateISO.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString([], { month: 'short', day: 'numeric' });
  }, [dateISO]);

  const timeLabel = useMemo(() => {
    if (!timeISO) return 'Time';
    const [hh, mm] = timeISO.split(':').map(Number);
    const d = new Date();
    d.setHours(hh, mm, 0, 0);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }, [timeISO]);

  // Simple time picker (cross-platform)
  const openTimePicker = () => setShowTime(true);

  const onPickTime = (h: number, m: number) => {
    const h2 = String(h).padStart(2, '0');
    const m2 = String(m).padStart(2, '0');
    setTimeISO(`${h2}:${m2}`);
    setShowTime(false);
  };

  const handleSubmit = async () => {
    if (!canSubmit || !pickup || !dropoff || !departureISO) return;
    try {
      setSubmitting(true);
      await createRide({
        startLocation: pickupText,
        endLocation: dropoffText,
        departureTime: departureISO,
        availableSeats: 1,            // default; you can add a seat input later
        pricePerSeat: 5,              // default; add a price input later
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

        {/* Date / Time */}
        <Text style={[styles.label, { marginTop: 10 }]}>Date</Text>
        <TouchableOpacity style={styles.fakeInput} onPress={() => setShowDate(true)}>
          <Text style={[styles.fakeInputText, !dateISO && styles.placeholder]}>{dateLabel}</Text>
        </TouchableOpacity>

        <Text style={[styles.label, { marginTop: 10 }]}>Time</Text>
        <TouchableOpacity style={styles.fakeInput} onPress={openTimePicker}>
          <Text style={[styles.fakeInputText, !timeISO && styles.placeholder]}>{timeLabel}</Text>
        </TouchableOpacity>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.cta, (!canSubmit || submitting) && { opacity: 0.5 }]}
          disabled={!canSubmit || submitting}
          onPress={handleSubmit}
        >
          <Text style={styles.ctaText}>{submitting ? 'Posting…' : 'Offer ride'}</Text>
        </TouchableOpacity>
      </View>

      {/* Date modal */}
      <CalendarModal
        visible={showDate}
        initialDate={dateISO || undefined}
        onClose={() => setShowDate(false)}
        onConfirm={(iso) => {
          setDateISO(iso);
          setShowDate(false);
        }}
      />

      {/* Time picker (very light custom) */}
      {showTime && (
        <View style={styles.timeOverlay}>
          <View style={styles.timeSheet}>
            <Text style={styles.timeTitle}>Select time</Text>
            <View style={styles.timeRow}>
              {['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'].map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.timeChip, timeISO === t && styles.timeChipActive]}
                  onPress={() => onPickTime(Number(t.split(':')[0]), Number(t.split(':')[1]))}
                >
                  <Text style={[styles.timeChipText, timeISO === t && styles.timeChipTextActive]}>
                    {new Date(0,0,0,Number(t.split(':')[0]),Number(t.split(':')[1]))
                      .toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.timeCancel} onPress={() => setShowTime(false)}>
              <Text style={styles.timeCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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

  cta: {
    marginTop: 14,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // time modal
  timeOverlay: {
    position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  timeSheet: {
    width: '86%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
  },
  timeTitle: { fontWeight: '700', color: '#111827', marginBottom: 10 },
  timeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeChip: {
    paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: 10, backgroundColor: '#F3F4F6',
  },
  timeChipActive: { backgroundColor: '#EDE9FE' },
  timeChipText: { color: '#111827', fontWeight: '600' },
  timeChipTextActive: { color: '#5B21B6' },
  timeCancel: { marginTop: 12, alignSelf: 'flex-end' },
  timeCancelText: { color: '#6B7280', fontWeight: '600' },
});