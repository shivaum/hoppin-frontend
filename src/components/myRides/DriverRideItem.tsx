// src/components/myRides/DriverRideItem.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import type { DriverRide } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<MainStackParamList, 'RideDetails'>;

type Props = {
  ride: DriverRide;
  onAction: (requestId: string, action: 'accepted' | 'declined') => void; // kept for future actions
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const extractShort = (addr?: string) => {
  if (!addr) return '';
  const s = addr.split(',')[0].trim();
  return s || addr;
};

export default function DriverRideItem({ ride }: Props) {
  const navigation = useNavigation<Nav>();

  const titleLeft = extractShort(ride.start_location);
  const titleRight = extractShort(ride.end_location);
  const dateLabel = `${fmtDate(ride.departure_time)}, ${fmtTime(ride.departure_time)}`;

  // first 3 riders (pending/accepted) for overlapping avatars
  const riders = useMemo(() => {
    const list = (ride.requests ?? [])
      .filter(r => r.status === 'pending' || r.status === 'accepted')
      .slice(0, 3)
      .map(r => r.rider?.photo)
      .filter(Boolean) as string[];
    return list;
  }, [ride.requests]);

  const goToDetails = () => {
    navigation.navigate('EditRide', {
      rideId: ride.id,
      start_address: ride.start_location,
      end_address: ride.end_location,
      departureISO: ride.departure_time,
      price_per_seat: ride.price_per_seat,
      start_lat: (ride as any).start_lat,
      start_lng: (ride as any).start_lng,
      end_lat:   (ride as any).end_lat,
      end_lng:   (ride as any).end_lng,
      requests: (ride.requests || []).map(r => ({
        id: r.id,
        rider: {
          name: r.rider.name,
          photo: r.rider.photo || undefined,
          rating: r.rider.rating,
        }
      })),
    });
  };

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={goToDetails} style={styles.card}>
      {/* Top row: title/date and right side (riders + price) */}
      <View style={styles.topRow}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={styles.routeTitle}>
            {titleLeft} <Text style={styles.arrow}>→</Text> {titleRight}
          </Text>
          <Text style={styles.subDate}>{dateLabel}</Text>
        </View>

        <View style={styles.rightCols}>
          <View style={styles.rightCol}>
            <Text style={styles.rightLabel}>Riders</Text>
            <View style={styles.avatarsRow}>
              {riders.length === 0 ? (
                <View style={[styles.avatar, styles.avatarFallback]} />
              ) : (
                riders.map((uri, idx) => (
                  <Image
                    key={`${uri}-${idx}`}
                    source={{ uri }}
                    style={[styles.avatar, idx > 0 && { marginLeft: -10 }]}
                  />
                ))
              )}
            </View>
          </View>

          <View style={[styles.rightCol, { minWidth: 92, alignItems: 'flex-end' }]}>
            <Text style={styles.rightLabel}>Price</Text>
            <Text style={styles.priceMain}>
              ${Number(ride.price_per_seat).toFixed(2)}
            </Text>
            <Text style={styles.priceSub}>per seat</Text>
          </View>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Chips row */}
      <View style={styles.chipsRow}>
        <View style={styles.chip}>
          <View style={styles.chipIcon}>
            <Ionicons name="chevron-down" size={14} color="#111827" />
          </View>
          <Text style={styles.chipLabel}>Pick-up</Text>
        </View>
        <View style={[styles.chip, { marginLeft: 24 }]}>
          <View style={styles.chipIcon}>
            <Ionicons name="chevron-down" size={14} color="#111827" />
          </View>
          <Text style={styles.chipLabel}>Drop-off</Text>
        </View>
      </View>

      {/* Large times */}
      <View style={styles.timesRow}>
        <Text style={styles.bigTime}>{fmtTime(ride.departure_time)}</Text>
        <Text style={styles.bigTime}>{/* arrival unknown */ '—'}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECECEC',
    marginBottom: 14,
  },

  topRow: { flexDirection: 'row', alignItems: 'flex-start' },

  routeTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
  arrow: { color: '#111827' },
  subDate: { marginTop: 6, color: '#6B7280', fontSize: 16, fontWeight: '600' },

  rightCols: { flexDirection: 'row', alignItems: 'flex-start' },
  rightCol: { marginLeft: 16 },
  rightLabel: { color: '#6B7280', fontSize: 14, marginBottom: 8 },

  avatarsRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: '#fff' },
  avatarFallback: { backgroundColor: '#E5E7EB' },

  priceMain: { fontSize: 28, fontWeight: '800', color: '#111827', lineHeight: 30 },
  priceSub: { color: '#6B7280', marginTop: 2 },

  divider: { height: 1, backgroundColor: '#EFEFF1', marginTop: 14, marginBottom: 10 },

  chipsRow: { flexDirection: 'row', alignItems: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center' },
  chipIcon: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#EFEFF4', alignItems: 'center', justifyContent: 'center',
  },
  chipLabel: { marginLeft: 8, color: '#6B7280', fontWeight: '600', fontSize: 15 },

  timesRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  bigTime: { fontSize: 34, fontWeight: '800', color: '#111827' },
});