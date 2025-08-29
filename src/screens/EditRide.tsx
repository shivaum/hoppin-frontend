import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  Animated, PanResponder, ScrollView, Dimensions, Alert
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../navigation/types';
import type { DriverRideRequest } from '../types';
import Map from '../components/common/map/Map';
import { Ionicons } from '@expo/vector-icons';
import LocationInput from '../components/common/inputs/LocationInput';
import DateTimePickerRow from '../components/common/inputs/DateTimePickerRow';
import Constants from 'expo-constants';
import { acceptRideRequest, declineRideRequest, getRideDetails, updateRide } from '../integrations/hopin-backend/driver';
import { parseAsLocalTime, formatDateForAPI } from '../utils/dateTime';

type Route = RouteProp<MainStackParamList, 'EditRide'>;
type Nav   = NativeStackNavigationProp<MainStackParamList, 'EditRide'>;

const scrH = Dimensions.get('window').height;
const SHEET_MAX = Math.round(scrH * 0.78);
const SHEET_MIN = Math.round(scrH * 0.45);
const clamp = (v:number, lo:number, hi:number) => Math.max(lo, Math.min(hi, v));

export default function EditRide() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const apiKey = Constants.expoConfig?.extra?.googleMapsApiKey as string;

  // Using utility function from dateTime.ts

  // form
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [departureISO, setDepartureISO] = useState(params.departureISO);
  const [departureDate, setDepartureDate] = useState(parseAsLocalTime(params.departureISO));
  
  // date/time picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // request management
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());
  const [localRequests, setLocalRequests] = useState<DriverRideRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convert navigation params to proper format on mount
  useEffect(() => {
    if (params.requests) {
      const convertedRequests: DriverRideRequest[] = params.requests.map(req => ({
        id: req.id,
        status: 'pending' as const, // Default to pending for nav params
        message: null,
        created_at: new Date().toISOString(),
        rider: {
          id: '', // Not available in nav params
          name: req.rider.name,
          photo: req.rider.photo || null,
          rating: req.rider.rating || 0,
          total_rides: 0 // Not available in nav params
        }
      }));
      setLocalRequests(convertedRequests);
    }
  }, [params.requests]);

  // Initialize form values when params are available
  useEffect(() => {
    // Small delay to ensure component is fully mounted
    const timer = setTimeout(() => {
      if (params.start_address) {
        setPickup(params.start_address);
      }
      if (params.end_address) {
        setDropoff(params.end_address);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [params.start_address, params.end_address]);

  // Fetch fresh ride data on mount
  useEffect(() => {
    const fetchRideData = async () => {
      if (!params.rideId) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const freshRideData = await getRideDetails(params.rideId);
        setLocalRequests(freshRideData.requests || []);
      } catch (error: any) {
        console.error('Failed to fetch ride details:', error);
        setError(error.message || 'Failed to load ride details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRideData();
  }, [params.rideId]);

  const start = useMemo(() => {
    if (params.start_lat && params.start_lng)
      return { latitude: params.start_lat, longitude: params.start_lng };
    return undefined;
  }, [params]);

  const end = useMemo(() => {
    if (params.end_lat && params.end_lng)
      return { latitude: params.end_lat, longitude: params.end_lng };
    return undefined;
  }, [params]);

  // bottom sheet
  const sheetH = useRef(new Animated.Value(SHEET_MAX)).current;
  const startH = useRef(SHEET_MAX);
  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 8,
      onPanResponderGrant: () => { startH.current = (sheetH as any)._value ?? SHEET_MAX; },
      onPanResponderMove: (_, g) => sheetH.setValue(clamp(startH.current - g.dy, SHEET_MIN, SHEET_MAX)),
      onPanResponderRelease: (_, g) => {
        const mid = (SHEET_MIN + SHEET_MAX) / 2;
        const dest = (startH.current - g.dy) > mid ? SHEET_MAX : SHEET_MIN;
        Animated.spring(sheetH, { toValue: dest, useNativeDriver: false, tension: 160, friction: 20 }).start();
      }
    })
  ).current;

  // separate requests by status - show pending and accepted, exclude declined/rejected
  const visibleRequests = useMemo(() => 
    localRequests.filter(r => r.rider && r.status !== 'declined' && r.status !== 'rejected'), 
    [localRequests]
  );

  const handleAcceptRequest = async (requestId: string) => {
    setProcessingRequests(prev => new Set([...prev, requestId]));
    try {
      await acceptRideRequest(requestId);
      // Update local state to show as accepted
      setLocalRequests(prev => 
        prev.map(r => r.id === requestId ? { ...r, status: 'accepted' as const } : r)
      );
      Alert.alert('Success', 'Ride request accepted!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to accept request');
    } finally {
      setProcessingRequests(prev => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    setProcessingRequests(prev => new Set([...prev, requestId]));
    try {
      await declineRideRequest(requestId);
      // Update status to 'declined' so it gets filtered out
      setLocalRequests(prev => 
        prev.map(r => r.id === requestId ? { ...r, status: 'declined' as const } : r)
      );
      Alert.alert('Success', 'Ride request declined!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to decline request');
    } finally {
      setProcessingRequests(prev => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

  // Date/time picker handlers
  const handleDateChange = (_: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(departureDate);
      newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      setDepartureDate(newDate);
      // Create ISO string that represents local time, not UTC
      setDepartureISO(formatDateForAPI(newDate));
    }
  };

  const handleTimeChange = (_: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(departureDate);
      newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
      setDepartureDate(newDate);
      // Create ISO string that represents local time, not UTC
      setDepartureISO(formatDateForAPI(newDate));
    }
  };

  // Using utility function from dateTime.ts

  const saveChanges = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      // Call update ride API
      const updateData = {
        start_location: pickup,
        end_location: dropoff,
        departure_time: departureISO,
      };

      await updateRide(params.rideId, updateData);
      Alert.alert('Success', 'Ride updated successfully!');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update ride');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* Map (full-screen) */}
      <View style={styles.mapWrap}>
        <Map start={start || { latitude: 0, longitude: 0 }} end={end || { latitude: 0, longitude: 0 }} />
      </View>

      {/* Back button */}
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} color="#111827" />
      </TouchableOpacity>

      {/* Draggable sheet */}
      <Animated.View style={[styles.sheet, { height: sheetH }]} {...pan.panHandlers}>
        <View style={styles.handle} />
        <ScrollView contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.sheetTitle}>Edit ride</Text>

          <Text style={styles.label}>Pick up</Text>
          <LocationInput
            ref={null}
            apiKey={apiKey}
            value={pickup}
            placeholder="Enter pick-up location"
            onChange={setPickup}
            onSelect={(addr, coord) => {
              setPickup(addr);
              // optionally lift to state if you want to update route live
              // ...
            }}
          />

          <Text style={[styles.label, { marginTop: 12 }]}>Drop off</Text>
          <LocationInput
            ref={null}
            apiKey={apiKey}
            value={dropoff}
            placeholder="Enter drop-off location"
            onChange={setDropoff}
            onSelect={(addr, coord) => {
              setDropoff(addr);
            }}
          />

          <View style={{ height: 12 }} />

          {/* Date & Time Picker */}
          <DateTimePickerRow
            date={departureDate}
            onDatePress={() => setShowDatePicker(true)}
            onTimePress={() => setShowTimePicker(true)}
            showDate={showDatePicker}
            showTime={showTimePicker}
            onChangeDate={handleDateChange}
            onChangeTime={handleTimeChange}
          />

          {/* Loading state */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading ride details...</Text>
            </View>
          )}

          {/* Error state */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Ride requests */}
          {!isLoading && visibleRequests.length > 0 && (
            <>
              <Text style={[styles.label, { marginTop: 16 }]}>Ride Requests</Text>
              {visibleRequests.map((r) => {
                const isPending = r.status === 'pending' || !r.status; // Show buttons for pending or undefined status
                const isProcessing = processingRequests.has(r.id);
                
                return (
                  <View key={r.id} style={styles.riderRow}>
                    {r.rider.photo ? (
                      <Image source={{ uri: r.rider.photo }} style={styles.avatar} />
                    ) : (
                      <View style={[styles.avatar, styles.avatarFallback]}>
                        <Text style={{ color: '#fff', fontWeight: '700' }}>
                          {r.rider.name.charAt(0)}
                        </Text>
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.riderName}>{r.rider.name}</Text>
                      <View style={styles.statusRow}>
                        {typeof r.rider.rating === 'number' && (
                          <Text style={styles.riderSub}>⭐ {r.rider.rating.toFixed(2)}</Text>
                        )}
                        <Text style={[
                          styles.statusBadge,
                          r.status === 'accepted' ? styles.acceptedBadge : styles.pendingBadge
                        ]}>
                          {r.status === 'accepted' ? 'Confirmed' : 'Pending'}
                        </Text>
                      </View>
                    </View>
                    {isPending && (
                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.acceptBtn]}
                          onPress={() => handleAcceptRequest(r.id)}
                          disabled={isProcessing}
                        >
                          <Ionicons 
                            name={isProcessing ? "time-outline" : "checkmark"} 
                            size={16} 
                            color="#fff" 
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.declineBtn]}
                          onPress={() => handleDeclineRequest(r.id)}
                          disabled={isProcessing}
                        >
                          <Ionicons 
                            name={isProcessing ? "time-outline" : "close"} 
                            size={16} 
                            color="#fff" 
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}
            </>
          )}

          <TouchableOpacity 
            style={[styles.cta, isSaving && styles.ctaDisabled]} 
            onPress={saveChanges}
            disabled={isSaving}
          >
            <Text style={styles.ctaText}>
              {isSaving ? 'Saving...' : 'Save changes'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  mapWrap: { flex: 1 },

  back: {
    position: 'absolute', top: 44, left: 16,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.15, shadowOffset: { width: 0, height: 3 }, shadowRadius: 6, elevation: 3,
  },

  sheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    borderTopLeftRadius: 16, borderTopRightRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000', shadowOpacity: 0.12, shadowOffset: { width: 0, height: -4 }, shadowRadius: 12, elevation: 8,
    overflow: 'hidden',
  },
  handle: { alignSelf: 'center', width: 72, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', marginVertical: 8 },
  sheetContent: { paddingHorizontal: 16, paddingBottom: 24 },

  sheetTitle: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 12 },

  label: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 6 },

  // Use your existing LocationInput; this wrapper just matches mock tone when empty
  fakeInput: {
    height: 48, borderRadius: 12, backgroundColor: '#F3F4F6',
    paddingHorizontal: 14, justifyContent: 'center',
  },
  fakeInputText: { color: '#6B7280' },

  riderRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 12 },
  avatarFallback: { backgroundColor: '#9CA3AF', alignItems: 'center', justifyContent: 'center' },
  riderName: { fontWeight: '700', color: '#111827', fontSize: 16 },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  riderSub: { color: '#6B7280', fontSize: 14 },
  statusBadge: { 
    paddingHorizontal: 8, 
    paddingVertical: 2, 
    borderRadius: 12, 
    fontSize: 11, 
    fontWeight: '600',
  },
  pendingBadge: { backgroundColor: '#FEF3C7', color: '#92400E' },
  acceptedBadge: { backgroundColor: '#D1FAE5', color: '#065F46' },
  
  actionButtons: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptBtn: { backgroundColor: '#10B981' },
  declineBtn: { backgroundColor: '#EF4444' },

  loadingContainer: { 
    paddingVertical: 20, 
    alignItems: 'center' 
  },
  loadingText: { 
    color: '#6B7280', 
    fontSize: 14 
  },
  errorContainer: { 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    backgroundColor: '#FEF2F2', 
    borderRadius: 8, 
    marginVertical: 8 
  },
  errorText: { 
    color: '#DC2626', 
    fontSize: 14 
  },

  cta: {
    marginTop: 16, height: 48, borderRadius: 12,
    backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center',
  },
  ctaDisabled: {
    backgroundColor: '#9CA3AF',
  },
  ctaText: { color: '#fff', fontWeight: '700' },
});