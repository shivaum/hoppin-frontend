// src/screens/SearchRides/components/FiltersBar.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { AdvancedSearchParams } from '../../../types';

interface FiltersBarProps {
  advancedFilters: Partial<AdvancedSearchParams>;
  onOpenFilters: () => void;
  onClearFilters: () => void;
}

export function FiltersBar({ advancedFilters, onOpenFilters, onClearFilters }: FiltersBarProps) {
  const hasActiveFilters = Object.keys(advancedFilters).length > 0;

  return (
    <View style={styles.leftControls}>
      <TouchableOpacity
        style={[styles.filtersButton, hasActiveFilters && styles.filtersButtonActive]}
        onPress={onOpenFilters}
      >
        <Ionicons name="funnel-outline" size={16} color={hasActiveFilters ? '#7C3AED' : '#6B7280'} />
        <Text style={[styles.filtersButtonText, hasActiveFilters && styles.filtersButtonTextActive]}>
          Filters{hasActiveFilters ? ` (${Object.keys(advancedFilters || {}).length})` : ''}
        </Text>
      </TouchableOpacity>

      {hasActiveFilters && (
        <TouchableOpacity style={styles.clearFiltersTopButton} onPress={onClearFilters}>
          <Ionicons name="close-circle" size={16} color="#DC2626" />
          <Text style={styles.clearFiltersTopButtonText}>Clear</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  leftControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  clearFiltersTopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    gap: 4,
  },
  clearFiltersTopButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#DC2626',
  },
});