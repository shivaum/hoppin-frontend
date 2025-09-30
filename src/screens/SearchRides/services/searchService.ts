// src/screens/SearchRides/services/searchService.ts
import { advancedSearchRides as apiAdvancedSearchRides } from '../../../integrations/hopin-backend/rider';
import type { AdvancedSearchParams, AdvancedSearchResponse } from '../../../types';
import type { LatLng } from '../../../components/common/inputs/UnifiedLocationInput';

interface SearchParams {
  fromText: string;
  toText: string;
  fromCoords: LatLng;
  toCoords: LatLng;
  selectedDate: string;
  advancedFilters: Partial<AdvancedSearchParams>;
}

/**
 * Service layer for SearchRides screen
 * Handles search API calls and data transformations
 */
export const searchService = {
  /**
   * Perform advanced ride search
   */
  search: async (params: SearchParams): Promise<AdvancedSearchResponse> => {
    const searchParams: AdvancedSearchParams = {
      from: params.fromText,
      to: params.toText,
      from_lat: params.fromCoords.lat || undefined,
      from_lng: params.fromCoords.lng || undefined,
      to_lat: params.toCoords.lat || undefined,
      to_lng: params.toCoords.lng || undefined,
      date: params.selectedDate,
      ...params.advancedFilters,
    };

    try {
      const response = await apiAdvancedSearchRides(searchParams);
      return response;
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    }
  },
};