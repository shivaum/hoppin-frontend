// src/components/searchRides/AdvancedSearchFilters.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { AdvancedSearchParams } from '../../types';

interface Props {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: Partial<AdvancedSearchParams>) => void;
  initialFilters?: Partial<AdvancedSearchParams>;
}

export default function AdvancedSearchFilters({
  visible,
  onClose,
  onApply,
  initialFilters = {},
}: Props) {
  const [filters, setFilters] = useState<Partial<AdvancedSearchParams>>({
    max_distance: 25,
    min_seats: 1,
    sort_by: 'relevance',
    resolve_aliases: true,
    ...initialFilters,
  });

  const sortOptions = [
    { value: 'relevance', label: 'Best Match', icon: 'star' },
    { value: 'price', label: 'Lowest Price', icon: 'cash' },
    { value: 'distance', label: 'Closest First', icon: 'location' },
    { value: 'departure_time', label: 'Departure Time', icon: 'time' },
  ];

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      max_distance: 25,
      min_seats: 1,
      sort_by: 'relevance',
      resolve_aliases: true,
    });
  };

  const updateFilter = <K extends keyof AdvancedSearchParams>(
    key: K,
    value: AdvancedSearchParams[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={s.container}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={onClose} style={s.headerButton}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
          
          <Text style={s.headerTitle}>Advanced Search</Text>
          
          <TouchableOpacity onPress={handleReset} style={s.headerButton}>
            <Text style={s.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
          {/* Distance Filter */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Search Distance</Text>
            <Text style={s.sectionSubtitle}>
              Find rides within {filters.max_distance} miles
            </Text>
            
            <View style={s.sliderContainer}>
              <View style={s.customSlider}>
                <View style={s.sliderTrack}>
                  <View 
                    style={[
                      s.sliderProgress, 
                      { 
                        width: `${((filters.max_distance || 25) - 0) / (25 - 0) * 100}%` 
                      }
                    ]} 
                  />
                </View>
                <View style={s.sliderButtons}>
                  <TouchableOpacity
                    style={s.sliderButton}
                    onPress={() => updateFilter('max_distance', Math.max(0, (filters.max_distance || 25) - 5))}
                  >
                    <Ionicons name="remove" size={16} color="#7C3AED" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.sliderButton}
                    onPress={() => updateFilter('max_distance', Math.min(25, (filters.max_distance || 25) + 5))}
                  >
                    <Ionicons name="add" size={16} color="#7C3AED" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={s.sliderLabels}>
                <Text style={s.sliderLabel}>0 mi</Text>
                <Text style={s.sliderValue}>{filters.max_distance} mi</Text>
                <Text style={s.sliderLabel}>25 mi</Text>
              </View>
            </View>
          </View>

          {/* Minimum Seats Filter */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Minimum number of seats</Text>
            <View style={s.seatsContainer}>
              {[1, 2, 3, 4, 5].map((seats) => (
                <TouchableOpacity
                  key={seats}
                  style={[
                    s.seatButton,
                    filters.min_seats === seats && s.seatButtonActive,
                  ]}
                  onPress={() => updateFilter('min_seats', seats)}
                >
                  <Text
                    style={[
                      s.seatButtonText,
                      filters.min_seats === seats && s.seatButtonTextActive,
                    ]}
                  >
                    {seats}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sort Order */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Sort Results By</Text>
            <View style={s.sortContainer}>
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    s.sortOption,
                    filters.sort_by === option.value && s.sortOptionActive,
                  ]}
                  onPress={() => updateFilter('sort_by', option.value as any)}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={18}
                    color={
                      filters.sort_by === option.value ? '#7C3AED' : '#6B7280'
                    }
                  />
                  <Text
                    style={[
                      s.sortOptionText,
                      filters.sort_by === option.value && s.sortOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Smart Features */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Smart Search Features</Text>
            
            <View style={s.toggleRow}>
              <View style={s.toggleInfo}>
                <Text style={s.toggleTitle}>Location Intelligence</Text>
                <Text style={s.toggleSubtitle}>
                  Resolve aliases and get smart suggestions
                </Text>
              </View>
              <Switch
                value={filters.resolve_aliases}
                onValueChange={(value) => updateFilter('resolve_aliases', value)}
                trackColor={{ false: '#E5E7EB', true: '#C084FC' }}
                thumbColor={filters.resolve_aliases ? '#7C3AED' : '#9CA3AF'}
              />
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={s.footer}>
          <TouchableOpacity style={s.cancelButton} onPress={onClose}>
            <Text style={s.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={s.applyButton} onPress={handleApply}>
            <Text style={s.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },

  resetText: {
    color: '#7C3AED',
    fontSize: 16,
    fontWeight: '500',
  },

  content: {
    flex: 1,
    padding: 16,
  },

  section: {
    marginBottom: 32,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },

  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },

  // Distance Slider
  sliderContainer: {
    paddingHorizontal: 4,
  },

  customSlider: {
    marginVertical: 8,
  },

  sliderTrack: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 12,
  },

  sliderProgress: {
    height: '100%',
    backgroundColor: '#7C3AED',
    borderRadius: 2,
  },

  sliderButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },

  sliderButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C084FC',
  },

  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -8,
  },

  sliderLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },

  sliderValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
  },


  // Seats Selection
  seatsContainer: {
    flexDirection: 'row',
    gap: 12,
  },

  seatButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  seatButtonActive: {
    borderColor: '#7C3AED',
    backgroundColor: '#F3E8FF',
  },

  seatButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },

  seatButtonTextActive: {
    color: '#7C3AED',
  },

  // Sort Options
  sortContainer: {
    gap: 8,
  },

  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    gap: 12,
  },

  sortOptionActive: {
    borderColor: '#7C3AED',
    backgroundColor: '#F3E8FF',
  },

  sortOptionText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },

  sortOptionTextActive: {
    color: '#7C3AED',
  },

  // Toggle Rows
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  toggleInfo: {
    flex: 1,
    marginRight: 12,
  },

  toggleTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },

  toggleSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },


  // Footer
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },

  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },

  applyButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },

  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});