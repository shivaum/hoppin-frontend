// src/screens/OfferRide/hooks/useRideForm.ts
import { useState, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import type { LatLng } from '../../../components/common/inputs/UnifiedLocationInput';
import { formatDateForAPI } from '../../../utils/dateTime';
import { canSubmitRide, getNextHour, formatDateToISO } from '../utils/validation';
import { rideService } from '../services/rideService';

interface UseRideFormReturn {
  // Location state
  pickupText: string;
  dropoffText: string;
  pickup: LatLng | null;
  dropoff: LatLng | null;
  setPickupText: (text: string) => void;
  setDropoffText: (text: string) => void;
  setPickup: (coords: LatLng | null) => void;
  setDropoff: (coords: LatLng | null) => void;

  // Ride details state
  availableSeats: string;
  pricePerSeat: string;
  setAvailableSeats: (value: string) => void;
  setPricePerSeat: (value: string) => void;

  // Validation & submission
  canSubmit: boolean;
  submitting: boolean;
  handleSubmit: () => Promise<void>;

  // Map region
  mapRegion: any;
  haveStart: boolean;
  haveEnd: boolean;
}

/**
 * Custom hook for managing ride offer form state and submission
 */
export function useRideForm(
  departureDate: Date,
  dateISO: string | null,
  onSuccess: () => void
): UseRideFormReturn {
  // Location state
  const [pickupText, setPickupText] = useState('');
  const [dropoffText, setDropoffText] = useState('');
  const [pickup, setPickup] = useState<LatLng | null>(null);
  const [dropoff, setDropoff] = useState<LatLng | null>(null);

  // Ride details state
  const [availableSeats, setAvailableSeats] = useState('1');
  const [pricePerSeat, setPricePerSeat] = useState('5');
  const [submitting, setSubmitting] = useState(false);

  // Validation
  const canSubmit = useMemo(
    () =>
      canSubmitRide(
        pickup,
        dropoff,
        dateISO,
        pickupText,
        dropoffText,
        availableSeats,
        pricePerSeat,
        departureDate
      ),
    [pickup, dropoff, dateISO, pickupText, dropoffText, availableSeats, pricePerSeat, departureDate]
  );

  // Map display logic
  const haveStart = !!pickup && Number.isFinite(pickup.lat) && Number.isFinite(pickup.lng);
  const haveEnd = !!dropoff && Number.isFinite(dropoff.lat) && Number.isFinite(dropoff.lng);

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
      // Only pickup
      return {
        latitude: pickup!.lat,
        longitude: pickup!.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    } else if (haveEnd) {
      // Only dropoff
      return {
        latitude: dropoff!.lat,
        longitude: dropoff!.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }
    return undefined;
  }, [haveStart, haveEnd, pickup, dropoff]);

  // Submit handler
  const handleSubmit = useCallback(async () => {
    if (!canSubmit || !pickup || !dropoff) return;

    const departureISO = formatDateForAPI(departureDate);

    try {
      setSubmitting(true);
      await rideService.createRide({
        pickupText,
        dropoffText,
        pickup,
        dropoff,
        departureISO,
        availableSeats: Number(availableSeats),
        pricePerSeat: Number(pricePerSeat),
      });
      Alert.alert('Ride created', 'Your ride is now available.');
      onSuccess();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not create ride');
    } finally {
      setSubmitting(false);
    }
  }, [
    canSubmit,
    pickup,
    dropoff,
    departureDate,
    pickupText,
    dropoffText,
    availableSeats,
    pricePerSeat,
    onSuccess,
  ]);

  return {
    pickupText,
    dropoffText,
    pickup,
    dropoff,
    setPickupText,
    setDropoffText,
    setPickup,
    setDropoff,
    availableSeats,
    pricePerSeat,
    setAvailableSeats,
    setPricePerSeat,
    canSubmit,
    submitting,
    handleSubmit,
    mapRegion,
    haveStart,
    haveEnd,
  };
}