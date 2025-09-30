// src/screens/SearchRides/components/DateNavigator.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDateShort } from '../../../utils/dateTime';

interface DateNavigatorProps {
  selectedDate: string;
  onDatePress: () => void;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;
  canNavigatePrev: boolean;
}

export function DateNavigator({
  selectedDate,
  onDatePress,
  onNavigatePrev,
  onNavigateNext,
  canNavigatePrev,
}: DateNavigatorProps) {
  const dateBtnLabel = formatDateShort(selectedDate + 'T00:00:00');

  return (
    <View style={styles.dateNavigationContainer}>
      <TouchableOpacity
        style={[styles.dateArrow, !canNavigatePrev && styles.dateArrowDisabled]}
        onPress={onNavigatePrev}
        disabled={!canNavigatePrev}
      >
        <Ionicons name="chevron-back" size={20} color={canNavigatePrev ? '#7C3AED' : '#D1D5DB'} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.datePill} onPress={onDatePress}>
        <Text style={styles.datePillText}>{dateBtnLabel}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.dateArrow} onPress={onNavigateNext}>
        <Ionicons name="chevron-forward" size={20} color="#7C3AED" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  dateNavigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateArrowDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  datePill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#F3E8FF',
    minWidth: 100,
    alignItems: 'center',
  },
  datePillText: {
    color: '#7C3AED',
    fontWeight: '700',
    fontSize: 14,
  },
});