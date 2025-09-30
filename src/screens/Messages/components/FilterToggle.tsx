// src/screens/Messages/components/FilterToggle.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../../constants/colors';

type FilterType = 'driver' | 'rider';

interface FilterToggleProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export function FilterToggle({ activeFilter, onFilterChange }: FilterToggleProps) {
  return (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[styles.filterButton, activeFilter === 'driver' && styles.filterButtonActive]}
        onPress={() => onFilterChange('driver')}
      >
        <Text style={styles.filterIcon}>🚗</Text>
        <Text
          style={[styles.filterText, activeFilter === 'driver' && styles.filterTextActive]}
        >
          I'm a driver
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.filterButton, activeFilter === 'rider' && styles.filterButtonActive]}
        onPress={() => onFilterChange('rider')}
      >
        <Text style={styles.filterIcon}>👤</Text>
        <Text
          style={[styles.filterText, activeFilter === 'rider' && styles.filterTextActive]}
        >
          I'm a rider
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.neutral.gray100,
    flex: 1,
  },
  filterButtonActive: {
    backgroundColor: colors.neutral.gray900,
  },
  filterIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  filterText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.neutral.gray700,
  },
  filterTextActive: {
    color: colors.neutral.white,
  },
});