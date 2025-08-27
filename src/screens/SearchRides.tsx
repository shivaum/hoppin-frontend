// src/screens/SearchRides.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { searchRides, getMyRideRequests } from '../integrations/hopin-backend/rider';
import type { SearchRide as SearchRideType, Ride as RideType } from '../types';
import RideCard from '../components/searchRides/RideCard';
import LocationInput, { LatLng } from '../components/offerRides/LocationInput';
import SubmitButton from '../components/offerRides/SubmitButton';
import CalendarModal from '../components/searchRides/CalendarModal';

const RECENTS_KEY = 'search_recents_v2';
const MAX_RECENTS = 4;

export default function SearchRides() {
  const { user } = useAuth();
  const apiKey = Constants.expoConfig?.extra?.googleMapsApiKey as string;

  const [fromText, setFromText] = useState('');
  const [toText, setToText] = useState('');
  const [fromCoords, setFromCoords] = useState<LatLng>({ lat: 0, lng: 0 });
  const [toCoords, setToCoords] = useState<LatLng>({ lat: 0, lng: 0 });

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const [rides, setRides] = useState<RideType[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [myRequestsMap, setMyRequestsMap] = useState<Record<string, string>>({});

  const [recents, setRecents] = useState<string[]>([]);

  // Load recents on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(RECENTS_KEY);
        setRecents(raw ? JSON.parse(raw) : []);
      } catch {}
    })();
  }, []);

  // Load my requests map
  useEffect(() => {
    getMyRideRequests()
      .then(reqs => {
        const m: Record<string, string> = {};
        reqs.forEach(r => { m[r.ride_id] = r.status; });
        setMyRequestsMap(m);
      })
      .catch(console.warn);
  }, []);

  const mapToRide = useCallback((r: SearchRideType): RideType => ({
    id: r.ride_id,
    driverId: r.driver_id,
    startLocation: r.start_location,
    endLocation: r.end_location,
    departureTime: r.departure_time,
    availableSeats: r.available_seats,
    pricePerSeat: r.price_per_seat,
    status: r.status,
    requests: [],
    driver: {
      name: r.driver.name,
      photo: r.driver.photo,
      rating: r.driver.rating,
      totalRides: r.driver.total_rides ?? 0,
    }
  }), []);

  const saveRecent = async (value: string) => {
    const v = value.trim();
    if (!v) return;
    const next = [v, ...recents.filter(x => x !== v)].slice(0, MAX_RECENTS);
    setRecents(next);
    try { await AsyncStorage.setItem(RECENTS_KEY, JSON.stringify(next)); } catch {}
  };

  const handleSearch = useCallback(async () => {
    if (!fromText.trim() || !toText.trim()) return;
    setHasSearched(true);
    setIsSearching(true);
    try {
      const results = await searchRides(fromText, toText);
      setRides(results.map(mapToRide));
      await Promise.all([saveRecent(fromText), saveRecent(toText)]);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Search failed');
    } finally {
      setIsSearching(false);
    }
  }, [fromText, toText, mapToRide, recents]);

  const reloadRequests = () =>
    getMyRideRequests()
      .then(reqs => {
        const m: Record<string, string> = {};
        reqs.forEach(r => { m[r.ride_id] = r.status; });
        setMyRequestsMap(m);
      })
      .catch(console.warn);

  const formatPillDate = useCallback((iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString([], { month: 'short', day: 'numeric' });
  }, []);
  const dateBtnLabel = selectedDate ? formatPillDate(selectedDate) : 'Select date';

  const hasInputs = fromText.trim().length > 0 || toText.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      {/* Top right date pill */}
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.datePill} onPress={() => setCalendarOpen(true)}>
          <Text style={styles.datePillText}>{dateBtnLabel}</Text>
        </TouchableOpacity>
      </View>

      {/* Inputs */}
      <View style={styles.inputs}>
        <View style={styles.inputShell}>
          <LocationInput
            ref={null}
            apiKey={apiKey}
            value={fromText}
            onChange={setFromText}
            onSelect={(loc, coords) => {
              setFromText(loc);
              setFromCoords(coords);
              saveRecent(loc);
            }}
          />
        </View>

        <View style={styles.inputShell}>
          <LocationInput
            ref={null}
            apiKey={apiKey}
            value={toText}
            onChange={setToText}
            onSelect={(loc, coords) => {
              setToText(loc);
              setToCoords(coords);
              saveRecent(loc);
            }}
          />
        </View>
      </View>

      {/* Recents */}
      {!isSearching && (
        <View style={styles.recentsWrap}>
          <Text style={styles.recentsTitle}>Recents</Text>
          {recents.slice(0, MAX_RECENTS).map((r) => (
            <TouchableOpacity
              key={r}
              style={styles.recentRow}
              onPress={() => {
                if (!fromText) setFromText(r);
                else setToText(r);
              }}
            >
              <Ionicons name="time-outline" size={18} color="#6B7280" style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={styles.recentTitle}>{r}</Text>
                <Text style={styles.recentSub}>Saved place</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Search CTA (kept) */}
      {!isSearching && (
        <SubmitButton
          title={isSearching ? 'Searching…' : 'Search Rides'}
          onPress={handleSearch}
          disabled={!fromText.trim() || !toText.trim() || isSearching}
        />
      )}

      {isSearching && <ActivityIndicator style={{ marginTop: 18 }} size="large" />}

      {/* Summary pills + results */}
      {!isSearching && rides.length > 0 && (
        <>
          <Text style={styles.resultsHeader}>
            Found {rides.length} ride{rides.length > 1 ? 's' : ''}
          </Text>

          <FlatList
            data={rides}
            keyExtractor={r => r.id}
            renderItem={({ item }) => (
              <RideCard
                ride={item}
                myProfileId={user?.id}
                myRequestStatus={myRequestsMap[item.id] || null}
                onRequestRide={reloadRequests}
                // RideCard is restyled below to match mock
              />
            )}
            contentContainerStyle={{ paddingBottom: 16 }}
          />
        </>
      )}

      {/* Empty state */}
      {!isSearching && hasSearched && rides.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No rides found. Try different locations or times.</Text>
        </View>
      )}

      {/* Calendar modal */}
      <CalendarModal
        visible={calendarOpen}
        initialDate={selectedDate || undefined}
        onClose={() => setCalendarOpen(false)}
        onConfirm={(iso) => {
          setSelectedDate(iso);
          setCalendarOpen(false);
        }}
      />
    </KeyboardAvoidingView>
  );
}

const purple = '#7C3AED';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },

  topRow: { alignItems: 'flex-end' },
  datePill: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 14, backgroundColor: '#F3E8FF' },
  datePillText: { color: purple, fontWeight: '700' },

  inputs: { marginTop: 12 },
  inputShell: { marginBottom: 12 },
  textContainer: {
    borderWidth: 2,
    borderColor: purple,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textInput: { fontSize: 16, color: '#111827' },

  recentsWrap: { marginTop: 6 },
  recentsTitle: { fontWeight: '600', color: '#6B7280', marginBottom: 8 },
  recentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  recentTitle: { color: '#111827', fontWeight: '600' },
  recentSub: { color: '#9CA3AF', fontSize: 12 },

  summaryPills: { marginTop: 16 },
  summaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryText: { flex: 1, color: '#111827', fontWeight: '600' },

  resultsHeader: { fontSize: 18, fontWeight: '700', marginVertical: 12 },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#6B7280', fontSize: 16 },
});