import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import type { DriverRide } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { StatusBadge } from './StatusBadge';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../navigation/types';

type Props = {
  ride: DriverRide;
  onAction: (requestId: string, action: 'accepted' | 'declined') => void;
};

type Nav = NativeStackNavigationProp<MainStackParamList, 'RideDetails'>;

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function DriverRideItem({ ride, onAction }: Props) {
  const navigation = useNavigation<Nav>();

  const goToDetails = () => {
    // Build params that conform to RideDetailsParams
    const baseParams: any = {
      role: 'driver',
      rideId: ride.id,
      start_location: ride.start_location,
      end_location: ride.end_location,
      departure_time: ride.departure_time,
      price_per_seat: ride.price_per_seat,
      available_seats: ride.available_seats,
      status: ride.status,
      driver_name: 'You',
    };

    // Include coords only if your DriverRide has them
    if ('start_lat' in ride && 'start_lng' in ride) {
      baseParams.start_lat = (ride as any).start_lat;
      baseParams.start_lng = (ride as any).start_lng;
    }
    if ('end_lat' in ride && 'end_lng' in ride) {
      baseParams.end_lat = (ride as any).end_lat;
      baseParams.end_lng = (ride as any).end_lng;
    }

    navigation.navigate('RideDetails', baseParams);
  };

  return (
    <View style={styles.card}>
      {/* Tappable summary area */}
      <TouchableOpacity onPress={goToDetails} activeOpacity={0.8}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Ride Offer</Text>
          <StatusBadge status={ride.status} />
        </View>

        {/* Route */}
        <View style={styles.routeRow}>
          <View style={styles.dotPrimary} />
          <Text style={styles.location}>{ride.start_location}</Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routeRow}>
          <View style={styles.dotSecondary} />
          <Text style={styles.location}>{ride.end_location}</Text>
        </View>

        {/* Meta */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time" size={14} color="#6B7280" />
            <Text style={styles.metaText}>
              {fmtDate(ride.departure_time)} at {fmtTime(ride.departure_time)}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="people" size={14} color="#6B7280" />
            <Text style={styles.metaText}>
              {ride.available_seats} seats • ${ride.price_per_seat}/seat
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Requests (not tappable area) */}
      {ride.requests?.length > 0 && (
        <View style={styles.requestsBox}>
          <View style={styles.requestsHeader}>
            <Ionicons name="alert-circle" size={16} color="#374151" />
            <Text style={styles.requestsTitle}>
              Ride Requests ({ride.requests.length})
            </Text>
          </View>

          {ride.requests.map((r) => (
            <View key={r.id} style={styles.reqCard}>
              <View style={styles.reqHeader}>
                <View style={styles.reqPerson}>
                  {r.rider.photo ? (
                    <Image source={{ uri: r.rider.photo }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.fallback]}>
                      <Text style={styles.fallbackTxt}>{r.rider.name.charAt(0)}</Text>
                    </View>
                  )}
                  <View>
                    <Text style={styles.reqName}>{r.rider.name}</Text>
                    <Text style={styles.reqRating}>
                      ⭐ {r.rider.rating} ({r.rider.total_rides} rides)
                    </Text>
                  </View>
                </View>
                <StatusBadge status={r.status} />
              </View>

              {r.message ? (
                <View style={styles.reqMessage}>
                  <Text style={styles.reqMessageTxt}>“{r.message}”</Text>
                </View>
              ) : null}

              {r.status === 'pending' && (
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    onPress={() => onAction(r.id, 'accepted')}
                    style={[styles.btn, styles.btnPrimary]}
                  >
                    <Ionicons name="checkmark-circle" size={16} color="#fff" />
                    <Text style={styles.btnPrimaryTxt}>Accept</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => onAction(r.id, 'declined')}
                    style={[styles.btn, styles.btnOutline]}
                  >
                    <Ionicons name="close-circle" size={16} color="#111827" />
                    <Text style={styles.btnOutlineTxt}>Decline</Text>
                  </TouchableOpacity>
                </View>
              )}

              {r.status === 'accepted' && (
                <TouchableOpacity style={[styles.btn, styles.btnOutline, { marginTop: 8 }]}>
                  <Ionicons name="chatbubble-ellipses" size={16} color="#111827" />
                  <Text style={styles.btnOutlineTxt}>Message Rider</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
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

  metaRow: { flexDirection: 'row', marginTop: 8, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16, marginTop: 4 },
  metaText: { marginLeft: 4, fontSize: 12, color: '#6B7280' },

  requestsBox: { borderTopWidth: 1, borderColor: '#E5E7EB', marginTop: 12, paddingTop: 10 },
  requestsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  requestsTitle: { marginLeft: 6, fontWeight: '600', color: '#111827' },

  reqCard: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10, marginBottom: 8 },
  reqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reqPerson: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 8 },
  fallback: { backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' },
  fallbackTxt: { color: '#374151', fontSize: 16, fontWeight: '600' },
  reqName: { fontWeight: '600', color: '#111827' },
  reqRating: { color: '#6B7280', fontSize: 12, marginTop: 2 },

  reqMessage: { marginTop: 8, backgroundColor: '#F9FAFB', borderRadius: 6, padding: 8 },
  reqMessageTxt: { color: '#374151', fontSize: 13 },

  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  btn: { flex: 1, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
  btnPrimary: { backgroundColor: '#3B82F6' },
  btnPrimaryTxt: { color: '#fff', fontWeight: '600' },
  btnOutline: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#D1D5DB' },
  btnOutlineTxt: { color: '#111827', fontWeight: '600' },
});