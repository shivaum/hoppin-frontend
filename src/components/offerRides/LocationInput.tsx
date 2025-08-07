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
        fetchDetails
        textInputProps={{ value, onChangeText: onChange }}
        onPress={(data, details) => {
          onSelect(
            data.description,
            details?.geometry?.location
              ? { lat: details.geometry.location.lat, lng: details.geometry.location.lng }
              : { lat: 0, lng: 0 }
          );
        }}
        query={{ key: apiKey, language: 'en' }}
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