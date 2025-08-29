import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { RideRequestItem } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { StatusBadge } from '../common/indicators/StatusBadge';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../navigation/types';
import { formatDateShort, formatTime } from '../../utils/dateTime';

type Props = {
  request: RideRequestItem;
};

type Nav = NativeStackNavigationProp<MainStackParamList, 'RideDetails'>;

// Using utility functions from dateTime.ts

export default function RiderRideItem({ request: b }: Props) {
  const navigation = useNavigation<Nav>();

  const goToDetails = () => {
    const params: any = {
      role: 'rider',
      rideId: b.ride_id,
      start_location: b.start_location,
      end_location: b.end_location,
      departure_time: b.departure_time,
      status: b.status,
      request_id: b.request_id,
    };

    // Optional fields if your API includes them on RideRequestItem
    if ('price_per_seat' in b) params.price_per_seat = (b as any).price_per_seat;
    if ('available_seats' in b) params.available_seats = (b as any).available_seats;
    if ('driver_name' in b) params.driver_name = (b as any).driver_name;

    // Coords if available
    if ('start_lat' in b && 'start_lng' in b) {
      params.start_lat = (b as any).start_lat;
      params.start_lng = (b as any).start_lng;
    }
    if ('end_lat' in b && 'end_lng' in b) {
      params.end_lat = (b as any).end_lat;
      params.end_lng = (b as any).end_lng;
    }

    navigation.navigate('RideDetails', params);
  };

  return (
    <View style={styles.card}>
      {/* Tappable summary */}
      <TouchableOpacity onPress={goToDetails} activeOpacity={0.8}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Request</Text>
          <StatusBadge status={b.status} />
        </View>

        {/* Route */}
        <View style={styles.routeRow}>
          <View style={styles.dotPrimary} />
          <Text style={styles.location}>{b.start_location}</Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routeRow}>
          <View style={styles.dotSecondary} />
          <Text style={styles.location}>{b.end_location}</Text>
        </View>

        {/* Time */}
        <View style={styles.metaRow}>
          <Ionicons name="time" size={14} color="#6B7280" />
          <Text style={styles.metaText}>
            {formatDateShort(b.departure_time)} at {formatTime(b.departure_time)}
          </Text>
        </View>

        {/* Optional pickup/dropoff */}
        {b.pickup?.location ? (
          <Text style={styles.small}>
            <Text style={styles.bold}>Pickup:</Text> {b.pickup.location}
          </Text>
        ) : null}
        {b.dropoff?.location ? (
          <Text style={styles.small}>
            <Text style={styles.bold}>Dropoff:</Text> {b.dropoff.location}
          </Text>
        ) : null}
      </TouchableOpacity>

      {/* Actions (not part of the tappable area) */}
      {b.status === 'accepted' && (
        <TouchableOpacity style={[styles.btn, styles.btnOutline, { marginTop: 8 }]}>
          <Ionicons name="chatbubble-ellipses" size={16} color="#111827" />
          <Text style={styles.btnOutlineTxt}>Message Driver</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 12, elevation: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '600', color: '#111827' },

  routeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  dotPrimary: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3B82F6' },
  dotSecondary: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  routeLine: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 6, marginLeft: 4 },
  location: { marginLeft: 8, fontSize: 14, color: '#111827' },

  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  metaText: { marginLeft: 6, fontSize: 12, color: '#6B7280' },

  small: { marginTop: 4, color: '#374151', fontSize: 13 },
  bold: { fontWeight: '600' },

  btn: { height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
  btnOutline: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#D1D5DB' },
  btnOutlineTxt: { color: '#111827', fontWeight: '600' },
});