// src/screens/EditRide/hooks/useEditRide.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { DriverRideRequest } from '../../../types';
import { parseAsLocalTime, formatDateForAPI } from '../../../utils/dateTime';
import { rideService } from '../services/rideService';
import { isDateTimeInFuture, isAtLeastMinutesInFuture, hasChanges } from '../utils/validation';

interface EditRideParams {
  rideId: string;
}

export function useEditRide(params: EditRideParams) {
  // Form state - initialized empty, populated by fetchRideData
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [departureDate, setDepartureDate] = useState(new Date());
  const [departureISO, setDepartureISO] = useState('');
  const [tempDate, setTempDate] = useState(new Date());
  const [availableSeats, setAvailableSeats] = useState('1');
  const [pricePerSeat, setPricePerSeat] = useState('5');

  // Original values for change detection - set after first fetch
  const [originalValues, setOriginalValues] = useState({
    pickup: '',
    dropoff: '',
    departureISO: '',
    availableSeats: '1',
    pricePerSeat: '5',
  });

  // Date/time picker states
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Request management
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());
  const [localRequests, setLocalRequests] = useState<DriverRideRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch ride data
  const fetchRideData = useCallback(async () => {
    if (!params.rideId) return;

    setIsLoading(true);
    setError(null);
    try {
      const freshRideData = await rideService.fetchRideDetails(params.rideId);

      const pickup = freshRideData.start_location || '';
      const dropoff = freshRideData.end_location || '';
      const availableSeats = String(freshRideData.available_seats || 1);
      const pricePerSeat = String(freshRideData.price_per_seat || 5);
      const departureISO = freshRideData.departure_time || '';

      setLocalRequests(freshRideData.requests || []);
      setPickup(pickup);
      setDropoff(dropoff);
      setAvailableSeats(availableSeats);
      setPricePerSeat(pricePerSeat);

      if (departureISO) {
        const departureTime = parseAsLocalTime(departureISO);
        setDepartureDate(departureTime);
        setTempDate(departureTime);
        setDepartureISO(departureISO);
      }

      // Set original values for change detection (only on first load)
      setOriginalValues({
        pickup,
        dropoff,
        departureISO,
        availableSeats,
        pricePerSeat,
      });
    } catch (error: any) {
      setError(error.message || 'Failed to load ride details');
    } finally {
      setIsLoading(false);
    }
  }, [params.rideId]);

  // Initial fetch and focus effect
  useEffect(() => {
    fetchRideData();
  }, [fetchRideData]);

  useFocusEffect(
    useCallback(() => {
      fetchRideData();
    }, [fetchRideData])
  );

  // Visible requests (exclude declined)
  const visibleRequests = useMemo(
    () => localRequests.filter((r) => r.rider && r.status !== 'declined'),
    [localRequests]
  );

  // Check if changes were made
  const hasFormChanges = useCallback(() => {
    return hasChanges(
      { pickup, dropoff, departureISO, availableSeats, pricePerSeat },
      originalValues
    );
  }, [pickup, dropoff, departureISO, availableSeats, pricePerSeat, originalValues]);

  // Date/time handlers
  const resetToReasonableTime = useCallback(() => {
    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0);
    setDepartureDate(now);
    setTempDate(now);
    setDepartureISO(formatDateForAPI(now));
  }, []);

  const handleTimeConfirm = useCallback(() => {
    const now = new Date();
    if (tempDate <= now) {
      Alert.alert('Invalid Time', 'Please select a time in the future.', [
        { text: 'OK', onPress: resetToReasonableTime },
      ]);
      setShowTimePicker(false);
      return;
    }

    const newDate = new Date(departureDate);
    newDate.setHours(tempDate.getHours(), tempDate.getMinutes(), 0, 0);
    setDepartureDate(newDate);
    setDepartureISO(formatDateForAPI(newDate));
    setShowTimePicker(false);
  }, [tempDate, departureDate, resetToReasonableTime]);

  const handleCalendarConfirm = useCallback(
    (iso: string) => {
      const [y, m, d] = iso.split('-').map(Number);
      const newDate = new Date(departureDate);
      newDate.setFullYear(y, m - 1, d);
      setDepartureDate(newDate);
      setDepartureISO(formatDateForAPI(newDate));
      setShowCalendar(false);
    },
    [departureDate]
  );

  // Request handlers
  const handleAcceptRequest = useCallback(
    async (requestId: string) => {
      setProcessingRequests((prev) => new Set([...prev, requestId]));
      try {
        await rideService.acceptRequest(requestId);
        await fetchRideData();
        Alert.alert('Success', 'Ride request accepted!');
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to accept request');
      } finally {
        setProcessingRequests((prev) => {
          const next = new Set(prev);
          next.delete(requestId);
          return next;
        });
      }
    },
    [fetchRideData]
  );

  const handleDeclineRequest = useCallback(
    async (requestId: string) => {
      setProcessingRequests((prev) => new Set([...prev, requestId]));
      try {
        await rideService.declineRequest(requestId);
        await fetchRideData();
        Alert.alert('Success', 'Ride request declined!');
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to decline request');
      } finally {
        setProcessingRequests((prev) => {
          const next = new Set(prev);
          next.delete(requestId);
          return next;
        });
      }
    },
    [fetchRideData]
  );

  // Save changes
  const saveChanges = useCallback(async () => {
    if (isSaving) return;

    if (!isDateTimeInFuture(departureDate)) {
      Alert.alert(
        'Invalid Date/Time',
        'Please select a departure time in the future. You cannot schedule rides for past dates or times.'
      );
      return;
    }

    if (!isAtLeastMinutesInFuture(departureDate, 15)) {
      Alert.alert(
        'Too Soon',
        'Please select a departure time at least 15 minutes in the future to allow riders to adjust their plans.'
      );
      return;
    }

    setIsSaving(true);
    try {
      await rideService.updateRide(params.rideId, {
        start_location: pickup,
        end_location: dropoff,
        departure_time: departureISO,
        available_seats: Number(availableSeats),
        price_per_seat: Number(pricePerSeat),
      });
      Alert.alert('Success', 'Ride updated successfully!');
      return true;
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update ride');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, departureDate, params.rideId, pickup, dropoff, departureISO, availableSeats, pricePerSeat]);

  return {
    // Form state
    pickup,
    dropoff,
    departureDate,
    departureISO,
    tempDate,
    availableSeats,
    pricePerSeat,
    setPickup,
    setDropoff,
    setAvailableSeats,
    setPricePerSeat,
    setTempDate,

    // Date/time
    showCalendar,
    showTimePicker,
    setShowCalendar,
    setShowTimePicker,
    handleTimeConfirm,
    handleCalendarConfirm,

    // Requests
    visibleRequests,
    processingRequests,
    handleAcceptRequest,
    handleDeclineRequest,

    // Save/validation
    isSaving,
    hasFormChanges,
    saveChanges,
    isDateTimeInFuture: () => isDateTimeInFuture(departureDate),

    // Loading/error
    isLoading,
    error,
  };
}