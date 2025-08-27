// src/screens/MyRides.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';

import DriverRidesTab from '../components/myRides/DriverRidesTab';
import RiderRidesTab from '../components/myRides/RiderRidesTab';
import type { MainStackParamList } from '../navigation/types';

type Mode = 'driver' | 'rider';
type Nav = NativeStackNavigationProp<MainStackParamList>;

export default function MyRides() {
  const { user } = useAuth();
  const navigation = useNavigation<Nav>();
  const [mode, setMode] = useState<Mode>('driver');

  const isDriver = !!user?.is_driver;

  const goToOfferRide = () => {
    navigation.navigate('OfferRide');
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* Header row */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>My rides</Text>
          <Text style={styles.subtitle}>Your scheduled rides</Text>
        </View>

        {isDriver && (
          <TouchableOpacity
            style={styles.offerBtn}
            onPress={goToOfferRide}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Offer a ride"
          >
            <Text style={styles.offerBtnText}>Offer ride</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Segmented control */}
      <View style={styles.segmentWrap}>
        <TouchableOpacity
          style={[styles.segment, mode === 'driver' && styles.segmentActive]}
          onPress={() => setMode('driver')}
          activeOpacity={0.9}
        >
          <Ionicons
            name="car"
            size={16}
            color={mode === 'driver' ? '#111827' : '#6B7280'}
            style={{ marginRight: 8 }}
          />
          <Text style={[styles.segmentText, mode === 'driver' && styles.segmentTextActive]}>
            I’m a driver
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segment, mode === 'rider' && styles.segmentActive]}
          onPress={() => setMode('rider')}
          activeOpacity={0.9}
        >
          <Ionicons
            name="person"
            size={16}
            color={mode === 'rider' ? '#111827' : '#6B7280'}
            style={{ marginRight: 8 }}
          />
          <Text style={[styles.segmentText, mode === 'rider' && styles.segmentTextActive]}>
            I’m a rider
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {mode === 'driver' ? <DriverRidesTab /> : <RiderRidesTab />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    marginTop: 2,
    color: '#6B7280',
    fontSize: 14,
  },
  offerBtn: {
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  offerBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  segmentWrap: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
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
  content: {
    flex: 1,
    paddingTop: 8,
  },
});