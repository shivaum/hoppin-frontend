// src/screens/SearchRides/components/SearchInputs.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import UnifiedLocationInput, {
  LatLng,
  UnifiedLocationInputRef,
} from '../../../components/common/inputs/UnifiedLocationInput';

interface SearchInputsProps {
  apiKey: string;
  fromText: string;
  toText: string;
  fromInputRef: React.RefObject<UnifiedLocationInputRef>;
  toInputRef: React.RefObject<UnifiedLocationInputRef>;
  onFromTextChange: (text: string) => void;
  onToTextChange: (text: string) => void;
  onFromSelect: (loc: string, coords: LatLng | undefined) => void;
  onToSelect: (loc: string, coords: LatLng | undefined) => void;
  onFromClear: () => void;
  onToClear: () => void;
  onFromFocus: () => void;
  onToFocus: () => void;
  onFromBlur: () => void;
  onToBlur: () => void;
  onSwap: () => void;
}

export function SearchInputs({
  apiKey,
  fromText,
  toText,
  fromInputRef,
  toInputRef,
  onFromTextChange,
  onToTextChange,
  onFromSelect,
  onToSelect,
  onFromClear,
  onToClear,
  onFromFocus,
  onToFocus,
  onFromBlur,
  onToBlur,
  onSwap,
}: SearchInputsProps) {
  return (
    <View style={styles.inputs}>
      <View style={styles.inputShell}>
        <Text style={styles.inputLabel}>Pick-up</Text>
        <UnifiedLocationInput
          ref={fromInputRef}
          apiKey={apiKey}
          value={fromText}
          placeholder="Enter pick-up location"
          onChange={onFromTextChange}
          onSelect={onFromSelect}
          onClear={onFromClear}
          onFocus={onFromFocus}
          onBlur={onFromBlur}
        />
      </View>

      {/* Swap button */}
      <View style={styles.swapButtonContainer}>
        <TouchableOpacity
          style={styles.swapButton}
          onPress={onSwap}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="swap-vertical" size={20} color="#7C3AED" />
        </TouchableOpacity>
      </View>

      <View style={styles.inputShell}>
        <Text style={styles.inputLabel}>Drop-off</Text>
        <UnifiedLocationInput
          ref={toInputRef}
          apiKey={apiKey}
          value={toText}
          placeholder="Enter drop-off location"
          onChange={onToTextChange}
          onSelect={onToSelect}
          onClear={onToClear}
          onFocus={onToFocus}
          onBlur={onToBlur}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputs: {
    marginTop: 12,
  },
  inputShell: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginLeft: 2,
  },
  swapButtonContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  swapButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3E8FF',
    borderWidth: 2,
    borderColor: '#C084FC',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});