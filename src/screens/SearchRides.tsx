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
import { searchRides, advancedSearchRides } from '../integrations/hopin-backend/rider';
import type { SearchRide as SearchRideType, Ride as RideType, AdvancedSearchParams, EnhancedSearchRide, AdvancedSearchResponse } from '../types';
import RideCard from '../components/searchRides/RideCard';
import EnhancedRideCard from '../components/searchRides/EnhancedRideCard';
import SmartLocationInput, { SmartLocationInputRef, LatLng } from '../components/common/inputs/SmartLocationInput';
import AdvancedSearchFilters from '../components/searchRides/AdvancedSearchFilters';
import SubmitButton from '../components/common/buttons/SubmitButton';
import CalendarModal from '../components/common/modals/CalendarModal';
import { formatDateShort } from '../utils/dateTime';
import { useFocusEffect } from '@react-navigation/native';

const MAX_RECENTS = 4;

export default function SearchRides() {
  const { user } = useAuth();
  const RECENTS_KEY = `search_recents_v2_${user?.id || 'guest'}`;
  const apiKey = Constants.expoConfig?.extra?.googleMapsApiKey as string;

  // Refs for SmartLocationInput components
  const fromInputRef = useRef<SmartLocationInputRef>(null);
  const toInputRef = useRef<SmartLocationInputRef>(null);

  const [fromText, setFromText] = useState('');
  const [toText, setToText] = useState('');
  const [fromCoords, setFromCoords] = useState<LatLng>({ lat: 0, lng: 0 });
  const [toCoords, setToCoords] = useState<LatLng>({ lat: 0, lng: 0 });

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const [rides, setRides] = useState<RideType[]>([]);
  const [enhancedRides, setEnhancedRides] = useState<EnhancedSearchRide[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [useAdvancedSearch, setUseAdvancedSearch] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<Partial<AdvancedSearchParams>>({});
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [searchResponse, setSearchResponse] = useState<AdvancedSearchResponse | null>(null);

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

  // Refresh search results when returning to this screen (after making requests)
  useFocusEffect(
    useCallback(() => {
      // Only refresh if we have existing search results and valid search criteria
      if (hasSearched && fromText.trim() && toText.trim() && (rides.length > 0 || enhancedRides.length > 0)) {
        console.log('🔄 Screen focused - refreshing search results');
        handleSearch();
      }
    }, [hasSearched, fromText, toText, rides.length, enhancedRides.length, handleSearch])
  );


  const mapToRide = useCallback((r: SearchRideType): RideType & { myRequestStatus: string | null } => ({
    id: r.ride_id,
    driverId: r.driver_id,
    startLocation: r.start_location,
    endLocation: r.end_location,
    departureTime: r.departure_time,
    availableSeats: r.available_seats,
    pricePerSeat: r.price_per_seat,
    status: r.status,
    requests: [],
    myRequestStatus: r.my_request_status,
    driver: {
      name: r.driver.name,
      photo: r.driver.photo,
      rating: r.driver.rating,
      totalRides: r.driver.total_rides ?? 0,
    }
  }), []);

  const sortRidesByDateRelevance = useCallback((rides: (RideType & { myRequestStatus: string | null })[], searchDate: string) => {
    const searchDateTime = new Date(searchDate + 'T00:00:00').getTime();
    const searchDateOnly = new Date(searchDate).toDateString();
    
    return rides.sort((a, b) => {
      const aTime = new Date(a.departureTime).getTime();
      const bTime = new Date(b.departureTime).getTime();
      const aDateOnly = new Date(a.departureTime).toDateString();
      const bDateOnly = new Date(b.departureTime).toDateString();
      
      // Priority 1: Rides on the selected date come first
      const aIsOnSelectedDate = aDateOnly === searchDateOnly;
      const bIsOnSelectedDate = bDateOnly === searchDateOnly;
      
      if (aIsOnSelectedDate && !bIsOnSelectedDate) return -1;
      if (!aIsOnSelectedDate && bIsOnSelectedDate) return 1;
      
      // Priority 2: If both are on selected date OR both are not, sort by closest time to selected date
      if (aIsOnSelectedDate && bIsOnSelectedDate) {
        // Both on selected date - sort by departure time (earlier first)
        return aTime - bTime;
      } else {
        // Neither on selected date - sort by closest to selected date
        const aDiff = Math.abs(aTime - searchDateTime);
        const bDiff = Math.abs(bTime - searchDateTime);
        
        if (aDiff !== bDiff) {
          return aDiff - bDiff;
        }
        
        // If same distance from search date, sort by departure time (earlier first)
        return aTime - bTime;
      }
    });
  }, []);

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
      if (useAdvancedSearch) {
        // Use advanced search with filters
        const searchParams: AdvancedSearchParams = {
          from: fromText,
          to: toText,
          from_lat: fromCoords.lat || undefined,
          from_lng: fromCoords.lng || undefined,
          to_lat: toCoords.lat || undefined,
          to_lng: toCoords.lng || undefined,
          date: selectedDate || undefined,
          ...advancedFilters,
        };
        
        const response = await advancedSearchRides(searchParams);
        setSearchResponse(response);
        setEnhancedRides(response.rides);
        setRides([]); // Clear basic rides when using advanced search
      } else {
        // Use basic search (fallback)
        const searchDate = selectedDate || undefined;
        const results = await searchRides(fromText, toText, searchDate);
        const mappedRides = results.map(mapToRide);
        const sortDate = searchDate || new Date().toISOString().split('T')[0];
        const sortedRides = sortRidesByDateRelevance(mappedRides, sortDate);
        setRides(sortedRides);
        setEnhancedRides([]); // Clear enhanced rides when using basic search
        setSearchResponse(null);
      }
      
      setJustCompletedSearch(true);
      setLastSearchTexts({from: fromText, to: toText});
      await saveRecent(fromText);
      await saveRecent(toText);
      setShowRecents(false);
      setTimeout(() => {
        setJustCompletedSearch(false);
      }, 200);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Search failed');
    } finally {
      setIsSearching(false);
    }
  }, [fromText, toText, fromCoords, toCoords, selectedDate, useAdvancedSearch, advancedFilters, mapToRide, sortRidesByDateRelevance, recents]);


  const dateBtnLabel = selectedDate ? formatDateShort(selectedDate + 'T00:00:00') : 'Select date';

  const hasInputs = fromText.trim().length > 0 || toText.trim().length > 0;
  const totalResults = enhancedRides.length || rides.length;
  const hasActiveFilters = Object.keys(advancedFilters).length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
      {/* Top controls */}
      <View style={styles.topRow}>
        <View style={styles.leftControls}>
          <TouchableOpacity 
            style={[styles.advancedToggle, useAdvancedSearch && styles.advancedToggleActive]} 
            onPress={() => setUseAdvancedSearch(!useAdvancedSearch)}
          >
            <Ionicons 
              name={useAdvancedSearch ? "settings" : "settings-outline"} 
              size={16} 
              color={useAdvancedSearch ? "#7C3AED" : "#6B7280"} 
            />
            <Text style={[styles.advancedToggleText, useAdvancedSearch && styles.advancedToggleTextActive]}>
              {useAdvancedSearch ? "Smart" : "Basic"}
            </Text>
          </TouchableOpacity>
          {useAdvancedSearch && (
            <TouchableOpacity 
              style={[styles.filtersButton, hasActiveFilters && styles.filtersButtonActive]} 
              onPress={() => setFiltersVisible(true)}
            >
              <Ionicons 
                name="funnel-outline" 
                size={16} 
                color={hasActiveFilters ? "#7C3AED" : "#6B7280"} 
              />
              <Text style={[styles.filtersButtonText, hasActiveFilters && styles.filtersButtonTextActive]}>
                Filters{hasActiveFilters ? ` (${Object.keys(advancedFilters).length})` : ''}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.datePill} onPress={() => setCalendarOpen(true)}>
          <Text style={styles.datePillText}>{dateBtnLabel}</Text>
        </TouchableOpacity>
      </View>

      {/* Inputs */}
      <View style={styles.inputs}>
        <View style={styles.inputShell}>
          <Text style={styles.inputLabel}>Pick-up</Text>
          <SmartLocationInput
            ref={fromInputRef}
            value={fromText}
            placeholder="Enter pick-up location"
            onChange={(text) => {
              setFromText(text);
              if (!justCompletedSearch && text !== lastSearchTexts.from) {
                setShowRecents(true);
              }
            }}
            onSelect={(loc, coords) => {
              setFromText(loc);
              if (coords) setFromCoords(coords);
            }}
            onClear={() => {
              setFromCoords({ lat: 0, lng: 0 });
              setShowRecents(true);
            }}
            onFocus={() => setFocusedInput('from')}
            onBlur={() => setFocusedInput(null)}
            showPersonalizedSuggestions={useAdvancedSearch}
            maxSuggestions={useAdvancedSearch ? 8 : 5}
          />
        </View>

        <View style={styles.inputShell}>
          <Text style={styles.inputLabel}>Drop-off</Text>
          <SmartLocationInput
            ref={toInputRef}
            value={toText}
            placeholder="Enter drop-off location"
            onChange={(text) => {
              setToText(text);
              if (!justCompletedSearch && text !== lastSearchTexts.to) {
                setShowRecents(true);
              }
            }}
            onSelect={(loc, coords) => {
              setToText(loc);
              if (coords) setToCoords(coords);
            }}
            onClear={() => {
              setToCoords({ lat: 0, lng: 0 });
              setShowRecents(true);
            }}
            onFocus={() => setFocusedInput('to')}
            onBlur={() => setFocusedInput(null)}
            showPersonalizedSuggestions={useAdvancedSearch}
            maxSuggestions={useAdvancedSearch ? 8 : 5}
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
                  if (fromInputRef.current) {
                    fromInputRef.current.setLocationText(r);
                  }
                } else if (focusedInput === 'to') {
                  setToText(r);
                  if (toInputRef.current) {
                    toInputRef.current.setLocationText(r);
                  }
                } else if (!fromText) {
                  setFromText(r);
                  if (fromInputRef.current) {
                    fromInputRef.current.setLocationText(r);
                  }
                } else if (!toText) {
                  setToText(r);
                  if (toInputRef.current) {
                    toInputRef.current.setLocationText(r);
                  }
                } else {
                  // Both inputs have text, default to replacing 'from'
                  setFromText(r);
                  if (fromInputRef.current) {
                    fromInputRef.current.setLocationText(r);
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

      {/* Search info and results */}
      {!isSearching && totalResults > 0 && (
        <>
          <View style={styles.resultsInfo}>
            <Text style={styles.resultsHeader}>
              Found {totalResults} ride{totalResults > 1 ? 's' : ''}
            </Text>
            {useAdvancedSearch && searchResponse?.search_info && (
              <View style={styles.searchMeta}>
                <Text style={styles.searchMetaText}>
                  Sorted by {searchResponse.search_info.search_params.sort_by}
                  {searchResponse.search_info.search_params.max_distance && 
                    ` • Within ${searchResponse.search_info.search_params.max_distance}km`
                  }
                </Text>
              </View>
            )}
          </View>

          {enhancedRides.length > 0 ? (
            <FlatList
              data={enhancedRides}
              keyExtractor={r => r.ride_id}
              renderItem={({ item }) => (
                <EnhancedRideCard
                  ride={item}
                  myProfileId={user?.id}
                  myRequestStatus={item.my_request_status}
                  onRequestRide={() => handleSearch()}
                  showEnhancedData={useAdvancedSearch}
                />
              )}
              contentContainerStyle={{ paddingBottom: 16 }}
            />
          ) : (
            <FlatList
              data={rides}
              keyExtractor={r => r.id}
              renderItem={({ item }) => (
                <RideCard
                  ride={item}
                  myProfileId={user?.id}
                  myRequestStatus={(item as any).myRequestStatus}
                  onRequestRide={() => handleSearch()}
                />
              )}
              contentContainerStyle={{ paddingBottom: 16 }}
            />
          )}
        </>
      )}

      {/* Empty state */}
      {!isSearching && hasSearched && totalResults === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            {useAdvancedSearch 
              ? "No rides match your criteria. Try adjusting your filters or search area."
              : "No rides found. Try different locations or times."
            }
          </Text>
          {useAdvancedSearch && hasActiveFilters && (
            <TouchableOpacity 
              style={styles.clearFiltersButton} 
              onPress={() => setAdvancedFilters({})}
            >
              <Text style={styles.clearFiltersText}>Clear Filters</Text>
            </TouchableOpacity>
          )}
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

      {/* Advanced Filters Modal */}
      {useAdvancedSearch && (
        <AdvancedSearchFilters
          visible={filtersVisible}
          onClose={() => setFiltersVisible(false)}
          onApply={(filters) => {
            setAdvancedFilters(filters);
            setFiltersVisible(false);
            // Auto-search if we have locations
            if (fromText.trim() && toText.trim()) {
              setTimeout(() => handleSearch(), 100);
            }
          }}
          initialFilters={advancedFilters}
        />
      )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const purple = '#7C3AED';

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },

  topRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  leftControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 4,
  },
  advancedToggleActive: {
    backgroundColor: '#F3E8FF',
    borderColor: '#C084FC',
  },
  advancedToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  advancedToggleTextActive: {
    color: '#7C3AED',
  },
  filtersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 4,
  },
  filtersButtonActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  filtersButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  filtersButtonTextActive: {
    color: '#92400E',
  },
  datePill: { 
    paddingVertical: 8, 
    paddingHorizontal: 12, 
    borderRadius: 14, 
    backgroundColor: '#F3E8FF' 
  },
  datePillText: { color: purple, fontWeight: '700' },

  inputs: { marginTop: 12 },
  inputShell: { marginBottom: 12 },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginLeft: 2,
  },
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

  resultsInfo: {
    marginVertical: 12,
  },
  resultsHeader: { 
    fontSize: 18, 
    fontWeight: '700', 
    marginBottom: 4 
  },
  searchMeta: {
    marginTop: 2,
  },
  searchMetaText: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  clearFiltersButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    alignSelf: 'center',
  },
  clearFiltersText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  empty: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyText: { 
    color: '#6B7280', 
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});