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
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';

interface FilterParams {
  pickup_distance: number;
  dropoff_distance: number;
  max_price: number;
  min_seats: number;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: Partial<FilterParams>) => void;
  initialFilters?: Partial<FilterParams>;
}

export default function AdvancedSearchFilters({
  visible,
  onClose,
  onApply,
  initialFilters = {},
}: Props) {
  const [filters, setFilters] = useState<Partial<FilterParams>>({
    pickup_distance: 25,
    dropoff_distance: 25,
    max_price: 50,
    min_seats: 1,
    ...initialFilters,
  });

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      pickup_distance: 25,
      dropoff_distance: 25,
      max_price: 50,
      min_seats: 1,
    });
  };

  const updateFilter = <K extends keyof FilterParams>(
    key: K,
    value: FilterParams[K]
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
          {/* Pickup Distance Filter */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Pickup Distance</Text>
            <Text style={s.sectionSubtitle}>
              Find rides within {filters.pickup_distance} miles of pickup location
            </Text>

            <View style={s.sliderContainer}>
              <Slider
                style={s.slider}
                minimumValue={0}
                maximumValue={100}
                value={filters.pickup_distance || 25}
                onValueChange={(value) => updateFilter('pickup_distance', Math.round(value))}
                minimumTrackTintColor="#7C3AED"
                maximumTrackTintColor="#E5E7EB"
                thumbTintColor="#7C3AED"
              />
              <View style={s.sliderRow}>
                <Text style={s.sliderLabel}>0 mi</Text>
                <View style={s.textInputContainer}>
                  <TextInput
                    style={s.textInput}
                    value={String(filters.pickup_distance || 25)}
                    onChangeText={(text) => {
                      const value = parseInt(text) || 0;
                      if (value >= 0 && value <= 100) {
                        updateFilter('pickup_distance', value);
                      }
                    }}
                    keyboardType="numeric"
                    maxLength={3}
                  />
                  <Text style={s.textInputSuffix}>mi</Text>
                </View>
                <Text style={s.sliderLabel}>100 mi</Text>
              </View>
            </View>
          </View>

          {/* Dropoff Distance Filter */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Dropoff Distance</Text>
            <Text style={s.sectionSubtitle}>
              Find rides within {filters.dropoff_distance} miles of dropoff location
            </Text>

            <View style={s.sliderContainer}>
              <Slider
                style={s.slider}
                minimumValue={0}
                maximumValue={100}
                value={filters.dropoff_distance || 25}
                onValueChange={(value) => updateFilter('dropoff_distance', Math.round(value))}
                minimumTrackTintColor="#7C3AED"
                maximumTrackTintColor="#E5E7EB"
                thumbTintColor="#7C3AED"
              />
              <View style={s.sliderRow}>
                <Text style={s.sliderLabel}>0 mi</Text>
                <View style={s.textInputContainer}>
                  <TextInput
                    style={s.textInput}
                    value={String(filters.dropoff_distance || 25)}
                    onChangeText={(text) => {
                      const value = parseInt(text) || 0;
                      if (value >= 0 && value <= 100) {
                        updateFilter('dropoff_distance', value);
                      }
                    }}
                    keyboardType="numeric"
                    maxLength={3}
                  />
                  <Text style={s.textInputSuffix}>mi</Text>
                </View>
                <Text style={s.sliderLabel}>100 mi</Text>
              </View>
            </View>
          </View>

          {/* Max Price Filter */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Maximum Price</Text>
            <Text style={s.sectionSubtitle}>
              Show rides up to ${filters.max_price} per seat
            </Text>

            <View style={s.sliderContainer}>
              <Slider
                style={s.slider}
                minimumValue={5}
                maximumValue={100}
                value={filters.max_price || 50}
                onValueChange={(value) => updateFilter('max_price', Math.round(value))}
                minimumTrackTintColor="#7C3AED"
                maximumTrackTintColor="#E5E7EB"
                thumbTintColor="#7C3AED"
              />
              <View style={s.sliderRow}>
                <Text style={s.sliderLabel}>$5</Text>
                <View style={s.textInputContainer}>
                  <Text style={s.textInputPrefix}>$</Text>
                  <TextInput
                    style={s.textInput}
                    value={String(filters.max_price || 50)}
                    onChangeText={(text) => {
                      const value = parseInt(text) || 5;
                      if (value >= 5 && value <= 100) {
                        updateFilter('max_price', value);
                      }
                    }}
                    keyboardType="numeric"
                    maxLength={3}
                  />
                </View>
                <Text style={s.sliderLabel}>$100</Text>
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

  // Slider Styles
  sliderContainer: {
    paddingHorizontal: 4,
    marginVertical: 8,
  },

  slider: {
    width: '100%',
    height: 40,
  },


  sliderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },

  sliderLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },

  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  textInput: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    minWidth: 32,
    padding: 0,
  },

  textInputPrefix: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginRight: 2,
  },

  textInputSuffix: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 4,
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