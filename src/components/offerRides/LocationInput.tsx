// src/components/offerRides/LocationInput.tsx
import React, { forwardRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

export type LatLng = { lat: number; lng: number };

type Props = {
  value: string;
  onChange: (val: string) => void;
  onSelect: (address: string, coords: LatLng) => void;
  apiKey: string;
};

export default forwardRef<any, Props>(function LocationInput(
  { value, onChange, onSelect, apiKey },
  ref
) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.box, focused && styles.boxFocused]}>
      <GooglePlacesAutocomplete
        ref={ref}
        placeholder=""
        fetchDetails
        minLength={2}
        debounce={250}
        GooglePlacesDetailsQuery={{ fields: 'geometry' }}
        query={{ key: apiKey, language: 'en' }}
        enablePoweredByContainer={false}
        predefinedPlaces={[]}
        textInputProps={{
          value,
          onChangeText: onChange,
          onFocus: () => setFocused(true),
          onBlur: () => setFocused(false),
          clearButtonMode: 'never',       // remove iOS “x”
          placeholderTextColor: '#9CA3AF',
        }}
        onPress={(data, details) => {
          const loc = details?.geometry?.location;
          onSelect(
            data.description ?? data.structured_formatting?.main_text ?? '',
            loc ? { lat: loc.lat, lng: loc.lng } : { lat: 0, lng: 0 }
          );
        }}
        onFail={(e) => console.log('Places error:', e)}
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
          textInput: styles.input,        // typography/padding = mock
          listView: { backgroundColor: '#fff', borderRadius: 12, marginTop: 8, zIndex: 2000 },
          row: { paddingVertical: 12, paddingHorizontal: 12 },
          separator: { height: StyleSheet.hairlineWidth, backgroundColor: '#E5E7EB' },
        }}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  // outer single outline + grey fill (matches mock)
  box: {
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#C4B5FD',         // light purple
    backgroundColor: '#F5F6FA',     // light grey fill
    paddingHorizontal: 12,
    paddingVertical: 8,
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
    height: 28,                     // keeps the vertical rhythm inside the box
    fontSize: 16,
    color: '#111827',
  },
});