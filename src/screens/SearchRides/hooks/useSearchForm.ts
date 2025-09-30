// src/screens/SearchRides/hooks/useSearchForm.ts
import { useState, useRef } from 'react';
import type { LatLng, UnifiedLocationInputRef } from '../../../components/common/inputs/UnifiedLocationInput';

interface UseSearchFormReturn {
  fromText: string;
  toText: string;
  fromCoords: LatLng;
  toCoords: LatLng;
  setFromText: (text: string) => void;
  setToText: (text: string) => void;
  setFromCoords: (coords: LatLng) => void;
  setToCoords: (coords: LatLng) => void;
  focusedInput: 'from' | 'to' | null;
  setFocusedInput: (input: 'from' | 'to' | null) => void;
  fromInputRef: React.RefObject<UnifiedLocationInputRef>;
  toInputRef: React.RefObject<UnifiedLocationInputRef>;
  swapLocations: () => void;
  populateRecentInFocusedInput: (value: string) => void;
}

/**
 * Custom hook for managing search form state and input interactions
 */
export function useSearchForm(): UseSearchFormReturn {
  const [fromText, setFromText] = useState('');
  const [toText, setToText] = useState('');
  const [fromCoords, setFromCoords] = useState<LatLng>({ lat: 0, lng: 0 });
  const [toCoords, setToCoords] = useState<LatLng>({ lat: 0, lng: 0 });
  const [focusedInput, setFocusedInput] = useState<'from' | 'to' | null>(null);

  const fromInputRef = useRef<UnifiedLocationInputRef>(null);
  const toInputRef = useRef<UnifiedLocationInputRef>(null);

  // Swap from and to locations
  const swapLocations = () => {
    const tempFromText = fromText;
    const tempToText = toText;
    setFromText(tempToText);
    setToText(tempFromText);

    const tempFromCoords = fromCoords;
    const tempToCoords = toCoords;
    setFromCoords(tempToCoords);
    setToCoords(tempFromCoords);

    if (fromInputRef.current && toInputRef.current) {
      fromInputRef.current.setAddressText(tempToText);
      toInputRef.current.setAddressText(tempFromText);
    }
  };

  // Populate recent search into focused input
  const populateRecentInFocusedInput = (value: string) => {
    if (focusedInput === 'from') {
      setFromText(value);
      if (fromInputRef.current) {
        fromInputRef.current.setAddressText(value);
      }
    } else if (focusedInput === 'to') {
      setToText(value);
      if (toInputRef.current) {
        toInputRef.current.setAddressText(value);
      }
    } else if (!fromText) {
      setFromText(value);
      if (fromInputRef.current) {
        fromInputRef.current.setAddressText(value);
      }
    } else if (!toText) {
      setToText(value);
      if (toInputRef.current) {
        toInputRef.current.setAddressText(value);
      }
    } else {
      // Both filled, default to from
      setFromText(value);
      if (fromInputRef.current) {
        fromInputRef.current.setAddressText(value);
      }
    }
  };

  return {
    fromText,
    toText,
    fromCoords,
    toCoords,
    setFromText,
    setToText,
    setFromCoords,
    setToCoords,
    focusedInput,
    setFocusedInput,
    fromInputRef,
    toInputRef,
    swapLocations,
    populateRecentInFocusedInput,
  };
}