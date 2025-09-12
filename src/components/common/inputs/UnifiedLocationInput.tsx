// src/components/common/inputs/UnifiedLocationInput.tsx
import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Ionicons } from '@expo/vector-icons';

export interface UnifiedLocationInputRef {
  focus(): void;
  blur(): void;
  clear(): void;
  setAddressText(text: string): void;
}

export interface LatLng {
  lat: number;
  lng: number;
}

interface Props {
  value: string;
  placeholder?: string;
  onChange?: (text: string) => void;
  onSelect?: (location: string, coords?: LatLng) => void;
  onClear?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: any;
  apiKey: string;
}

const UnifiedLocationInput = forwardRef<UnifiedLocationInputRef, Props>(
  (
    {
      value,
      placeholder = 'Enter location',
      onChange,
      onSelect,
      onClear,
      onFocus,
      onBlur,
      style,
      apiKey,
    },
    ref
  ) => {
    const googlePlacesRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      focus: () => googlePlacesRef.current?.focus(),
      blur: () => googlePlacesRef.current?.blur(),
      clear: () => {
        googlePlacesRef.current?.setAddressText('');
        googlePlacesRef.current?.clear();
        onChange?.('');
        onClear?.();
      },
      setAddressText: (text: string) => {
        googlePlacesRef.current?.setAddressText(text);
        onChange?.(text);
      },
    }));

    return (
      <View style={[styles.container, style]}>
        <View style={styles.inputContainer}>
          <GooglePlacesAutocomplete
            ref={googlePlacesRef}
            placeholder={placeholder}
            fetchDetails
            minLength={2}
            debounce={250}
            GooglePlacesDetailsQuery={{ fields: 'geometry' }}
            query={{ 
              key: apiKey, 
              language: 'en',
              // Include both address and establishment types for comprehensive results
              types: undefined, // Allow all types (addresses, cities, landmarks, etc.)
            }}
            enablePoweredByContainer={false}
            predefinedPlaces={[]}
            textInputProps={{
              value: value,
              onChangeText: onChange,
              onFocus: onFocus,
              onBlur: onBlur,
              clearButtonMode: 'never',
              placeholderTextColor: '#9CA3AF',
              style: styles.textInput,
            }}
            onPress={(data, details) => {
              const loc = details?.geometry?.location;
              onSelect?.(
                data.description ?? data.structured_formatting?.main_text ?? '',
                loc ? { lat: loc.lat, lng: loc.lng } : undefined
              );
            }}
            onFail={(e) => console.error('Places error:', e)}
            styles={{
              container: { flex: 0 },
              textInputContainer: {
                backgroundColor: 'transparent',
                borderTopWidth: 0,
                borderBottomWidth: 0,
                height: 44,
              },
              textInput: styles.hiddenInput,
              listView: styles.suggestionsList,
              row: { paddingVertical: 12, paddingHorizontal: 12 },
              separator: { height: StyleSheet.hairlineWidth, backgroundColor: '#E5E7EB' },
            }}
          />
          
          {value.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton} 
              onPress={() => {
                googlePlacesRef.current?.setAddressText('');
                googlePlacesRef.current?.clear();
                onChange?.('');
                onClear?.();
              }}
            >
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }
);

UnifiedLocationInput.displayName = 'UnifiedLocationInput';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },

  inputContainer: {
    borderWidth: 2,
    borderColor: '#C4B5FD',
    borderRadius: 14,
    backgroundColor: '#F5F6FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: 'relative',
  },

  textInput: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    margin: 0,
    height: 44,
    fontSize: 16,
    color: '#111827',
  },

  hiddenInput: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    margin: 0,
    height: 44,
    fontSize: 16,
    color: '#000000',
  },

  suggestionsList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 4,
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 5000,
    elevation: 10,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  clearButton: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    elevation: 2,
  },
});

export default UnifiedLocationInput;