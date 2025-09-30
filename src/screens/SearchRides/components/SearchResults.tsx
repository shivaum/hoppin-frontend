// src/screens/SearchRides/components/SearchResults.tsx
import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { EnhancedSearchRide, AdvancedSearchResponse } from '../../../types';
import EnhancedRideCard from './EnhancedRideCard';

type SortBy = 'price' | 'dropoff_distance' | 'pickup_distance' | 'departure_time';

const sortOptions = [
  { value: 'departure_time', label: 'Soonest Ride', icon: 'time' },
  { value: 'price', label: 'Lowest Price', icon: 'cash' },
  { value: 'pickup_distance', label: 'Closest Pick-up', icon: 'location' },
  { value: 'dropoff_distance', label: 'Closest Drop-off', icon: 'flag' },
] as const;

interface SearchResultsProps {
  rides: EnhancedSearchRide[];
  sortedRides: EnhancedSearchRide[];
  searchResponse: AdvancedSearchResponse | null;
  hasActiveFilters: boolean;
  sortBy: SortBy;
  onSortChange: (sort: SortBy) => void;
  onRequestRide: () => void;
  onClearFilters: () => void;
  myProfileId: string | undefined;
}

export function SearchResults({
  rides,
  sortedRides,
  searchResponse,
  hasActiveFilters,
  sortBy,
  onSortChange,
  onRequestRide,
  onClearFilters,
  myProfileId,
}: SearchResultsProps) {
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const totalResults = rides.length;

  if (totalResults === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          No rides match your criteria. Try adjusting your filters or search area.
        </Text>
        {hasActiveFilters && (
          <TouchableOpacity style={styles.clearFiltersButton} onPress={onClearFilters}>
            <Text style={styles.clearFiltersText}>Clear Filters</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <>
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsHeader}>
          Found {totalResults} ride{totalResults > 1 ? 's' : ''}
        </Text>
        {hasActiveFilters && searchResponse?.search_info && (
          <View style={styles.searchMeta}>
            <Text style={styles.searchMetaText}>
              Sorted by{' '}
              {searchResponse.search_info.search_params.sort_by === 'relevance'
                ? 'Best Match'
                : searchResponse.search_info.search_params.sort_by === 'price'
                ? 'Lowest Price'
                : searchResponse.search_info.search_params.sort_by === 'distance'
                ? 'Closest First'
                : searchResponse.search_info.search_params.sort_by === 'departure_time'
                ? 'Departure Time'
                : searchResponse.search_info.search_params.sort_by}
              {searchResponse.search_info.search_params.max_distance &&
                ` • Within ${Math.round(searchResponse.search_info.search_params.max_distance)} miles`}
            </Text>
          </View>
        )}
      </View>

      {/* Sort Dropdown */}
      <View style={styles.sortContainer}>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowSortDropdown(!showSortDropdown)}
        >
          <Ionicons
            name={sortOptions.find((opt) => opt.value === sortBy)?.icon as any}
            size={16}
            color="#7C3AED"
          />
          <Text style={styles.sortButtonText}>
            {sortOptions.find((opt) => opt.value === sortBy)?.label}
          </Text>
          <Ionicons
            name={showSortDropdown ? 'chevron-up' : 'chevron-down'}
            size={16}
            color="#6B7280"
          />
        </TouchableOpacity>

        {showSortDropdown && (
          <>
            <TouchableOpacity
              style={styles.sortOverlay}
              onPress={() => setShowSortDropdown(false)}
              activeOpacity={1}
            />
            <View style={styles.sortDropdown}>
              {sortOptions.map((option, index) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.sortOption,
                    sortBy === option.value && styles.sortOptionActive,
                    index === sortOptions.length - 1 && styles.sortOptionLast,
                  ]}
                  onPress={() => {
                    onSortChange(option.value);
                    setShowSortDropdown(false);
                  }}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={16}
                    color={sortBy === option.value ? '#7C3AED' : '#6B7280'}
                  />
                  <Text
                    style={[
                      styles.sortOptionText,
                      sortBy === option.value && styles.sortOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {sortBy === option.value && <Ionicons name="checkmark" size={16} color="#7C3AED" />}
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>

      <FlatList
        data={sortedRides.length > 0 ? sortedRides : rides}
        keyExtractor={(r) => r.ride_id}
        renderItem={({ item }) => (
          <EnhancedRideCard
            ride={item}
            myProfileId={myProfileId}
            myRequestStatus={item.my_request_status}
            onRequestRide={onRequestRide}
            showEnhancedData={true}
          />
        )}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  resultsInfo: {
    marginVertical: 12,
  },
  resultsHeader: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  searchMeta: {
    marginTop: 2,
  },
  searchMetaText: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  sortContainer: {
    marginBottom: 12,
    position: 'relative',
    zIndex: 1000,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  sortButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  sortDropdown: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1001,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sortOptionActive: {
    backgroundColor: '#F3E8FF',
  },
  sortOptionText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  sortOptionTextActive: {
    color: '#7C3AED',
    fontWeight: '500',
  },
  sortOptionLast: {
    borderBottomWidth: 0,
  },
  sortOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
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
});