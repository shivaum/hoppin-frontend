// src/screens/SearchRides.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { searchRides, getMyRideRequests } from '../integrations/hopin-backend/rider';
import type { SearchRide as SearchRideType, Ride as RideType } from '../types';
import RideCard from '../components/searchRides/RideCard';
import LocationInput, { LatLng } from '../components/common/inputs/LocationInput';
import { GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';
import SubmitButton from '../components/common/buttons/SubmitButton';
import CalendarModal from '../components/common/modals/CalendarModal';

const MAX_RECENTS = 4;

export default function SearchRides() {
  const { user } = useAuth();
  const RECENTS_KEY = `search_recents_v2_${user?.id || 'guest'}`;
  const apiKey = Constants.expoConfig?.extra?.googleMapsApiKey as string;

  // Refs for LocationInput components
  const fromInputRef = useRef<GooglePlacesAutocompleteRef>(null);
  const toInputRef = useRef<GooglePlacesAutocompleteRef>(null);

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
  const [focusedInput, setFocusedInput] = useState<'from' | 'to' | null>(null);
  const [showRecents, setShowRecents] = useState(true);
  const [justCompletedSearch, setJustCompletedSearch] = useState(false);
  const [lastSearchTexts, setLastSearchTexts] = useState<{from: string, to: string}>({from: '', to: ''});

  // Load recents on mount (user-specific)
  useEffect(() => {
    if (!user?.id) return; // Don't load recents if no user
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(RECENTS_KEY);
        setRecents(raw ? JSON.parse(raw) : []);
      } catch {}
    })();
  }, [RECENTS_KEY, user?.id]); // Reload when user changes
  
  // Clear recents when user changes
  useEffect(() => {
    setRecents([]); // Clear current recents state when user changes
  }, [user?.id]);

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
    if (!v || !user?.id) return;
    
    return new Promise<void>((resolve) => {
      setRecents(currentRecents => {
        const next = [v, ...currentRecents.filter(x => x !== v)].slice(0, MAX_RECENTS);
        // Save to AsyncStorage with the updated array
        AsyncStorage.setItem(RECENTS_KEY, JSON.stringify(next))
          .catch(() => {}) // Ignore errors
          .finally(() => resolve());
        return next;
      });
    });
  };

  const handleSearch = useCallback(async () => {
    if (!fromText.trim() || !toText.trim()) return;
    setHasSearched(true);
    setIsSearching(true);
    try {
      const results = await searchRides(fromText, toText);
      setRides(results.map(mapToRide));
      setJustCompletedSearch(true); // Flag to prevent onChange from showing recents
      setLastSearchTexts({from: fromText, to: toText}); // Store what we searched for
      await saveRecent(fromText);
      await saveRecent(toText);
      setShowRecents(false); // Hide recents after successful search
      // Reset flag after a short delay to allow for automatic onChange calls
      setTimeout(() => {
        setJustCompletedSearch(false);
      }, 200); // Increased timeout
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
    <SafeAreaView style={styles.safeArea}>
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
            ref={fromInputRef}
            apiKey={apiKey}
            value={fromText}
            onChange={(text) => {
              setFromText(text);
              // Only show recents if user is genuinely changing the text from what was searched
              if (!justCompletedSearch && text !== lastSearchTexts.from) {
                setShowRecents(true); // Show recents when typing
              }
            }}
            onSelect={(loc, coords) => {
              setFromText(loc);
              setFromCoords(coords);
            }}
            onClear={() => {
              setFromCoords({ lat: 0, lng: 0 });
              setShowRecents(true); // Show recents when clearing
            }}
            onFocus={() => setFocusedInput('from')}
            onBlur={() => setFocusedInput(null)}
          />
        </View>

        <View style={styles.inputShell}>
          <LocationInput
            ref={toInputRef}
            apiKey={apiKey}
            value={toText}
            onChange={(text) => {
              setToText(text);
              // Only show recents if user is genuinely changing the text from what was searched
              if (!justCompletedSearch && text !== lastSearchTexts.to) {
                setShowRecents(true); // Show recents when typing
              }
            }}
            onSelect={(loc, coords) => {
              setToText(loc);
              setToCoords(coords);
            }}
            onClear={() => {
              setToCoords({ lat: 0, lng: 0 });
              setShowRecents(true); // Show recents when clearing
            }}
            onFocus={() => setFocusedInput('to')}
            onBlur={() => setFocusedInput(null)}
          />
        </View>
      </View>

      {/* Recents */}
      {!isSearching && showRecents && (
        <View style={styles.recentsWrap}>
          <Text style={styles.recentsTitle}>Recents</Text>
          {recents.slice(0, MAX_RECENTS).map((r) => (
            <TouchableOpacity
              key={r}
              style={styles.recentRow}
              onPress={() => {
                // Populate focused input, or fallback to first available empty input, or default to 'from'
                if (focusedInput === 'from') {
                  setFromText(r);
                  // Also update the GooglePlacesAutocomplete component
                  if (fromInputRef.current) {
                    fromInputRef.current.setAddressText(r);
                  }
                } else if (focusedInput === 'to') {
                  setToText(r);
                  // Also update the GooglePlacesAutocomplete component
                  if (toInputRef.current) {
                    toInputRef.current.setAddressText(r);
                  }
                } else if (!fromText) {
                  setFromText(r);
                  // Also update the GooglePlacesAutocomplete component
                  if (fromInputRef.current) {
                    fromInputRef.current.setAddressText(r);
                  }
                } else if (!toText) {
                  setToText(r);
                  // Also update the GooglePlacesAutocomplete component
                  if (toInputRef.current) {
                    toInputRef.current.setAddressText(r);
                  }
                } else {
                  // Both inputs have text, default to replacing 'from'
                  setFromText(r);
                  // Also update the GooglePlacesAutocomplete component
                  if (fromInputRef.current) {
                    fromInputRef.current.setAddressText(r);
                  }
                }
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
    </SafeAreaView>
  );
}

const purple = '#7C3AED';

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
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