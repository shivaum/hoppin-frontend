// src/screens/SearchRides/hooks/useSearchResults.ts
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { EnhancedSearchRide, AdvancedSearchParams, AdvancedSearchResponse } from '../../../types';
import type { LatLng } from '../../../components/common/inputs/UnifiedLocationInput';
import { searchService } from '../services/searchService';

type SortBy = 'price' | 'dropoff_distance' | 'pickup_distance' | 'departure_time';

interface UseSearchResultsReturn {
  rides: EnhancedSearchRide[];
  sortedRides: EnhancedSearchRide[];
  isSearching: boolean;
  hasSearched: boolean;
  searchResponse: AdvancedSearchResponse | null;
  sortBy: SortBy;
  setSortBy: (sort: SortBy) => void;
  advancedFilters: Partial<AdvancedSearchParams>;
  setAdvancedFilters: (filters: Partial<AdvancedSearchParams>) => void;
  performSearch: (params: {
    fromText: string;
    toText: string;
    fromCoords: LatLng;
    toCoords: LatLng;
    selectedDate: string;
  }) => Promise<void>;
}

/**
 * Custom hook for managing search results, sorting, and filters
 */
export function useSearchResults(): UseSearchResultsReturn {
  const route = useRoute();
  const navigation = useNavigation();

  const [rides, setRides] = useState<EnhancedSearchRide[]>([]);
  const [sortedRides, setSortedRides] = useState<EnhancedSearchRide[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResponse, setSearchResponse] = useState<AdvancedSearchResponse | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('departure_time');
  const [advancedFilters, setAdvancedFilters] = useState<Partial<AdvancedSearchParams>>({});

  // Sort rides based on sort criteria
  const sortRides = useCallback((ridesToSort: EnhancedSearchRide[], sortType: SortBy) => {
    return [...ridesToSort].sort((a, b) => {
      switch (sortType) {
        case 'price':
          return a.price_per_seat - b.price_per_seat;
        case 'pickup_distance':
          return (a.distance_km || 0) - (b.distance_km || 0);
        case 'dropoff_distance':
          return (a.distance_km || 0) - (b.distance_km || 0);
        case 'departure_time':
        default:
          return new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime();
      }
    });
  }, []);

  // Apply sorting when rides or sort criteria changes
  useEffect(() => {
    if (rides.length > 0) {
      const sorted = sortRides(rides, sortBy);
      setSortedRides(sorted);
    }
  }, [rides, sortBy, sortRides]);

  // Perform search
  const performSearch = useCallback(
    async (params: {
      fromText: string;
      toText: string;
      fromCoords: LatLng;
      toCoords: LatLng;
      selectedDate: string;
    }) => {
      if (!params.fromText.trim() || !params.toText.trim()) return;

      setHasSearched(true);
      setIsSearching(true);

      try {
        const response = await searchService.search({
          fromText: params.fromText,
          toText: params.toText,
          fromCoords: params.fromCoords,
          toCoords: params.toCoords,
          selectedDate: params.selectedDate,
          advancedFilters,
        });

        setSearchResponse(response);
        setRides(response.rides);
      } catch (err: any) {
        console.error(err);
        alert(err.message || 'Search failed');
      } finally {
        setIsSearching(false);
      }
    },
    [advancedFilters]
  );

  // Listen for ride request events to refresh search results
  useEffect(() => {
    const refreshAfterRequest = (route.params as any)?.refreshAfterRequest;

    if (refreshAfterRequest && hasSearched && rides.length > 0 && !isSearching) {
      navigation.setParams({ refreshAfterRequest: undefined } as any);
      // Note: would need to call performSearch here but need access to search params
    }
  }, [route.params, hasSearched, rides.length, isSearching, navigation]);

  return {
    rides,
    sortedRides,
    isSearching,
    hasSearched,
    searchResponse,
    sortBy,
    setSortBy,
    advancedFilters,
    setAdvancedFilters,
    performSearch,
  };
}