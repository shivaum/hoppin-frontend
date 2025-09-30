// src/screens/MyRides/components/SegmentedControl.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Mode = 'driver' | 'rider';

interface SegmentedControlProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  showDriverMode: boolean;
}

export function SegmentedControl({ mode, onModeChange, showDriverMode }: SegmentedControlProps) {
  return (
    <View style={styles.segmentWrap}>
      {showDriverMode && (
        <TouchableOpacity
          style={[styles.segment, mode === 'driver' && styles.segmentActive]}
          onPress={() => onModeChange('driver')}
          activeOpacity={0.9}
        >
          <Ionicons
            name="car"
            size={16}
            color={mode === 'driver' ? '#111827' : '#6B7280'}
            style={{ marginRight: 8 }}
          />
          <Text style={[styles.segmentText, mode === 'driver' && styles.segmentTextActive]}>
            I'm a driver
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[
          styles.segment,
          mode === 'rider' && styles.segmentActive,
          !showDriverMode && styles.segmentFullWidth,
        ]}
        onPress={() => onModeChange('rider')}
        activeOpacity={0.9}
      >
        <Ionicons
          name="person"
          size={16}
          color={mode === 'rider' ? '#111827' : '#6B7280'}
          style={{ marginRight: 8 }}
        />
        <Text style={[styles.segmentText, mode === 'rider' && styles.segmentTextActive]}>
          I'm a rider
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  segmentWrap: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
    padding: 8,
    paddingBottom: 0,
  },
  segment: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  segmentActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#A5B4FC',
  },
  segmentText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#111827',
  },
  segmentFullWidth: {
    flex: 0,
    width: '100%',
  },
});