import React, { useMemo, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  Animated, PanResponder, ScrollView, Dimensions
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../navigation/types';
import Map from '../components/map/Map';
import { Ionicons } from '@expo/vector-icons';
import LocationInput from '../components/offerRides/LocationInput';

type Route = RouteProp<MainStackParamList, 'EditRide'>;
type Nav   = NativeStackNavigationProp<MainStackParamList, 'EditRide'>;

const scrH = Dimensions.get('window').height;
const SHEET_MAX = Math.round(scrH * 0.78);
const SHEET_MIN = Math.round(scrH * 0.45);
const clamp = (v:number, lo:number, hi:number) => Math.max(lo, Math.min(hi, v));

export default function EditRide() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();

  // form
  const [pickup, setPickup] = useState(params.start_address);
  const [dropoff, setDropoff] = useState(params.end_address);
  const [departureISO, setDepartureISO] = useState(params.departureISO);

  const start = useMemo(() => {
    if (params.start_lat && params.start_lng)
      return { latitude: params.start_lat, longitude: params.start_lng };
    return undefined;
  }, [params]);

  const end = useMemo(() => {
    if (params.end_lat && params.end_lng)
      return { latitude: params.end_lat, longitude: params.end_lng };
    return undefined;
  }, [params]);

  // bottom sheet
  const sheetH = useRef(new Animated.Value(SHEET_MAX)).current;
  const startH = useRef(SHEET_MAX);
  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 8,
      onPanResponderGrant: () => { startH.current = (sheetH as any)._value ?? SHEET_MAX; },
      onPanResponderMove: (_, g) => sheetH.setValue(clamp(startH.current - g.dy, SHEET_MIN, SHEET_MAX)),
      onPanResponderRelease: (_, g) => {
        const mid = (SHEET_MIN + SHEET_MAX) / 2;
        const dest = (startH.current - g.dy) > mid ? SHEET_MAX : SHEET_MIN;
        Animated.spring(sheetH, { toValue: dest, useNativeDriver: false, tension: 160, friction: 20 }).start();
      }
    })
  ).current;

  const riders = params.requests ?? []; // list shown in mock with Remove buttons

  const saveChanges = () => {
    // Hook up to PATCH /driver/ride/:id later
    // For now, just go back.
    navigation.goBack();
  };

  return (
    <View style={styles.root}>
      {/* Map (full-screen) */}
      <View style={styles.mapWrap}>
        <Map start={start || { latitude: 0, longitude: 0 }} end={end || { latitude: 0, longitude: 0 }} />
      </View>

      {/* Back button */}
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} color="#111827" />
      </TouchableOpacity>

      {/* Draggable sheet */}
      <Animated.View style={[styles.sheet, { height: sheetH }]} {...pan.panHandlers}>
        <View style={styles.handle} />
        <ScrollView contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.sheetTitle}>Edit ride</Text>

          <Text style={styles.label}>Pick up</Text>
          <LocationInput
            ref={null}
            apiKey={undefined as any}
            value={pickup}
            onChange={setPickup}
            onSelect={(addr, coord) => {
              setPickup(addr);
              // optionally lift to state if you want to update route live
              // ...
            }}
          />

          <Text style={[styles.label, { marginTop: 12 }]}>Drop off</Text>
          <LocationInput
            ref={null}
            apiKey={undefined as any}
            value={dropoff}
            onChange={setDropoff}
            onSelect={(addr, coord) => {
              setDropoff(addr);
            }}
          />

          <View style={{ height: 12 }} />

          {/* Date */}
          <Text style={styles.label}>Date</Text>
          <View style={styles.fakeInput}>
            <Text style={styles.fakeInputText}>
              {new Date(departureISO).toLocaleDateString([], { month: 'long', day: 'numeric' })}
            </Text>
          </View>

          {/* Time */}
          <Text style={[styles.label, { marginTop: 12 }]}>Time</Text>
          <View style={styles.fakeInput}>
            <Text style={styles.fakeInputText}>
              {new Date(departureISO).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase()}
            </Text>
          </View>

          {/* Riders list */}
          {riders.length > 0 && (
            <>
              <Text style={[styles.label, { marginTop: 16 }]}>Riders</Text>
              {riders.map((r) => (
                <View key={r.id} style={styles.riderRow}>
                  {r.rider.photo ? (
                    <Image source={{ uri: r.rider.photo }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.avatarFallback]}>
                      <Text style={{ color: '#fff', fontWeight: '700' }}>
                        {r.rider.name.charAt(0)}
                      </Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.riderName}>{r.rider.name}</Text>
                    {typeof r.rider.rating === 'number' && (
                      <Text style={styles.riderSub}>⭐ {r.rider.rating.toFixed(2)}</Text>
                    )}
                  </View>
                  <TouchableOpacity onPress={() => { /* remove later */ }}>
                    <Text style={styles.remove}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}

          <TouchableOpacity style={styles.cta} onPress={saveChanges}>
            <Text style={styles.ctaText}>Save changes</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  mapWrap: { flex: 1 },

  back: {
    position: 'absolute', top: 44, left: 16,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.15, shadowOffset: { width: 0, height: 3 }, shadowRadius: 6, elevation: 3,
  },

  sheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    borderTopLeftRadius: 16, borderTopRightRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000', shadowOpacity: 0.12, shadowOffset: { width: 0, height: -4 }, shadowRadius: 12, elevation: 8,
    overflow: 'hidden',
  },
  handle: { alignSelf: 'center', width: 72, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', marginVertical: 8 },
  sheetContent: { paddingHorizontal: 16, paddingBottom: 24 },

  sheetTitle: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 12 },

  label: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 6 },

  // Use your existing LocationInput; this wrapper just matches mock tone when empty
  fakeInput: {
    height: 48, borderRadius: 12, backgroundColor: '#F3F4F6',
    paddingHorizontal: 14, justifyContent: 'center',
  },
  fakeInputText: { color: '#6B7280' },

  riderRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  avatarFallback: { backgroundColor: '#9CA3AF', alignItems: 'center', justifyContent: 'center' },
  riderName: { fontWeight: '700', color: '#111827' },
  riderSub: { color: '#6B7280', marginTop: 2 },
  remove: { color: '#EF4444', fontWeight: '700' },

  cta: {
    marginTop: 16, height: 48, borderRadius: 12,
    backgroundColor: '#9CA3AF', alignItems: 'center', justifyContent: 'center',
  },
  ctaText: { color: '#fff', fontWeight: '700' },
});