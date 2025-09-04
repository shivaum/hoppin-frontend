// src/components/offerRides/LocationInput.tsx
import 'react-native-get-random-values';
import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

export type LatLng = { lat: number; lng: number };

type Props = {
  value: string;
  onChange: (val: string) => void;
  onSelect: (address: string, coords: LatLng) => void;
  apiKey: string;
  placeholder?: string;
  onClear?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
};

export default forwardRef<any, Props>(function LocationInput(
  { value, onChange, onSelect, apiKey, placeholder = "", onClear, onFocus, onBlur },
  ref
) {
  const [focused, setFocused] = useState(false);
  const internalRef = useRef<any>(null);
  
  // Use the ref passed from parent or create our own
  const autocompleteRef = ref || internalRef;

  // Set the initial value when component mounts or value changes
  useEffect(() => {
    const refCurrent = typeof autocompleteRef === 'function' ? null : autocompleteRef.current;
    if (value && refCurrent) {
      refCurrent.setAddressText(value);
    }
  }, [value]);

  return (
    <View style={[styles.wrapper, focused && styles.wrapperFocused]}>
      <View style={[styles.box, focused && styles.boxFocused]}>
        <GooglePlacesAutocomplete
        ref={autocompleteRef}
        placeholder={placeholder}
        fetchDetails
        minLength={2}
        debounce={250}
        GooglePlacesDetailsQuery={{ fields: 'geometry' }}
        query={{ key: apiKey, language: 'en' }}
        enablePoweredByContainer={false}
        predefinedPlaces={[]}
        textInputProps={{
          onChangeText: onChange,
          onFocus: () => {
            setFocused(true);
            onFocus?.();
          },
          onBlur: () => {
            setFocused(false);
            onBlur?.();
          },
          clearButtonMode: 'never',
          placeholderTextColor: '#9CA3AF',
        }}
        onPress={(data, details) => {
          const loc = details?.geometry?.location;
          onSelect(
            data.description ?? data.structured_formatting?.main_text ?? '',
            loc ? { lat: loc.lat, lng: loc.lng } : { lat: 0, lng: 0 }
          );
        }}
        onFail={(e) => console.error('Places error:', e)}
        onNotFound={() => {}}
        styles={{
          // remove inner container look entirely
          container: { flex: 0 },
          textInputContainer: {
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            borderBottomWidth: 0,
            height: 44,
          },
          textInput: styles.input,
          listView: { 
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
          row: { paddingVertical: 12, paddingHorizontal: 12 },
          separator: { height: StyleSheet.hairlineWidth, backgroundColor: '#E5E7EB' },
        }}
        />
        
        {/* Clear button - show when there's text */}
        {value.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton} 
            onPress={() => {
              // Clear the GooglePlacesAutocomplete component directly
              const refCurrent = typeof autocompleteRef === 'function' ? null : autocompleteRef.current;
              if (refCurrent) {
                refCurrent.setAddressText('');
                refCurrent.clear();
              }
              onChange('');
              onClear?.();
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative', // Enable absolute positioning for dropdown
    zIndex: 1,
  },
  wrapperFocused: {
    zIndex: 10, // Higher z-index when focused to show dropdown above other inputs
  },
  // outer single outline + grey fill (matches mock)
  box: {
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#C4B5FD',         // light purple
    backgroundColor: '#F5F6FA',     // light grey fill
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: 'relative',
  },
  boxFocused: {
    borderColor: '#8B5CF6',         // vivid purple on focus
  },
  // exact text styling (16, dark, no inner border)
  input: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    margin: 0,
    height: 44,                     // keeps the vertical rhythm inside the box
    fontSize: 16,
    color: '#000000',
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -12, // Half of button height for centering
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2, // Lower z-index since dropdown is now outside
    elevation: 2, // For Android
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});