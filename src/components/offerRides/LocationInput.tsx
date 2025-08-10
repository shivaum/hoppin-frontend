// src/components/OfferRide/LocationInput.tsx
import React, { forwardRef } from 'react';
import { Text, StyleSheet } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

type Props = {
  label: string;
  value: string;
  onChange: (val: string) => void;
  onSelect: (address: string, coords: { lat: number; lng: number }) => void;
  apiKey: string;
};

export type LatLng = { lat: number; lng: number; };

export default forwardRef<any, Props>(function LocationInput(
  { label, value, onChange, onSelect, apiKey },
  ref
) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <GooglePlacesAutocomplete
        ref={ref}
        placeholder={label}
        minLength={2}
        debounce={250}
        fetchDetails
        GooglePlacesDetailsQuery={{ fields: 'geometry' }}
        query={{ key: apiKey, language: 'en' }}
        textInputProps={{ value, onChangeText: onChange }}
        onPress={(data, details) => {
          const loc = details?.geometry?.location;
          onSelect(
            data.description ?? data.structured_formatting?.main_text ?? '',
            loc ? { lat: loc.lat, lng: loc.lng } : { lat: 0, lng: 0 }
          );
        }}
        onFail={(e) => console.log('Places error:', e)}
        onNotFound={() => console.log('No results')}
        enablePoweredByContainer={false}
        predefinedPlaces={[]}                   
        predefinedPlacesAlwaysVisible={false}
        styles={{
          container: { flex: 0, zIndex: 1000 },
          textInput: { ...styles.input, zIndex: 1000 },
          listView: { backgroundColor: '#fff', zIndex: 2000 },
        }}
      />
    </>
  );
});

const styles = StyleSheet.create({
  label: { marginTop: 12, marginBottom: 4, fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: '#FFF',
  },
});