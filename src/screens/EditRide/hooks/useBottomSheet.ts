// src/screens/EditRide/hooks/useBottomSheet.ts
import { useRef } from 'react';
import { Animated, PanResponder, Dimensions } from 'react-native';

const scrH = Dimensions.get('window').height;
const SHEET_MAX = Math.round(scrH * 0.78);
const SHEET_MIN = Math.round(scrH * 0.45);
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export function useBottomSheet() {
  const sheetH = useRef(new Animated.Value(SHEET_MAX)).current;
  const startH = useRef(SHEET_MAX);

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 8,
      onPanResponderGrant: () => {
        startH.current = (sheetH as any)._value ?? SHEET_MAX;
      },
      onPanResponderMove: (_, g) => {
        sheetH.setValue(clamp(startH.current - g.dy, SHEET_MIN, SHEET_MAX));
      },
      onPanResponderRelease: (_, g) => {
        const mid = (SHEET_MIN + SHEET_MAX) / 2;
        const dest = startH.current - g.dy > mid ? SHEET_MAX : SHEET_MIN;
        Animated.spring(sheetH, {
          toValue: dest,
          useNativeDriver: false,
          tension: 160,
          friction: 20,
        }).start();
      },
    })
  ).current;

  return { sheetH, pan };
}