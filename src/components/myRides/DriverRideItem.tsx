// src/components/myRides/DriverRideItem.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import type { DriverRide } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../navigation/types';
import { calculateTravelTime } from '../../utils/travelTime';
import { formatDateShort, formatTime } from '../../utils/dateTime';

type Nav = NativeStackNavigationProp<MainStackParamList, 'RideDetails'>;

type Props = {
  ride: DriverRide;
  onAction: (requestId: string, action: 'accepted' | 'declined') => void;
};

// Remove old formatting functions - now using utils

const extractShort = (addr?: string) => {
  if (!addr) return '';
  const s = addr.split(',')[0].trim();
  return s || addr;
};

export default function DriverRideItem({ ride }: Props) {
  const navigation = useNavigation<Nav>();
  const [dropOffTime, setDropOffTime] = useState<string | null>(null);

  const titleLeft = extractShort(ride.start_location);
  const titleRight = extractShort(ride.end_location);
  const dateLabel = `${formatDateShort(ride.departure_time)}, ${formatTime(ride.departure_time)}`;

  // Calculate estimated drop-off time
  useEffect(() => {
    const calculateDropOff = async () => {
      const result = await calculateTravelTime(
        ride.start_location,
        ride.end_location,
        ride.departure_time
      );
      
      if (result) {
        setDropOffTime(formatTime(result.estimatedArrival));
      }
    };

    calculateDropOff();
  }, [ride.start_location, ride.end_location, ride.departure_time]);

  // all riders (pending + accepted) for display
  const allRiders = useMemo(() => {
    const requests = (ride.requests ?? []).filter(r => r.status === 'pending' || r.status === 'accepted');
    return requests.slice(0, 3).map(r => ({
      photo: r.rider?.photo,
      name: r.rider?.name,
      status: r.status
    }));
  }, [ride.requests]);

  const totalRequestCount = (ride.requests ?? []).filter(r => r.status === 'pending' || r.status === 'accepted').length;
  const pendingCount = (ride.requests ?? []).filter(r => r.status === 'pending').length;

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
      {/* Left: Route and time info */}
      <View style={{ flex: 1 }}>
        <View style={styles.row}>
          <View style={[styles.dot, { backgroundColor: '#3B82F6' }]} />
          <Text style={styles.smallLabel}>Pick-up</Text>
          <Text style={styles.time}>{formatTime(ride.departure_time)}</Text>
        </View>
        <View style={styles.row}>
          <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.smallLabel}>Drop-off</Text>
          <Text style={styles.time}>{dropOffTime || '—'}</Text>
        </View>

        {/* Addresses */}
        <Text numberOfLines={1} style={styles.addr}>{ride.start_location}</Text>
        <View style={styles.divider} />
        <Text numberOfLines={1} style={styles.addr}>{ride.end_location}</Text>

        {/* Date info */}
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={14} color="#6B7280" />
          <Text style={styles.dateText}>{dateLabel}</Text>
        </View>
      </View>

      {/* Right: Stats and price */}
      <View style={styles.rightCol}>
        <View style={styles.seatsRow}>
          <Ionicons name="people" size={14} color="#6B7280" />
          <Text style={styles.seatsTxt}>{ride.available_seats} seats</Text>
        </View>
        
        {/* Riders info */}
        <View style={styles.ridersInfo}>
          <View style={styles.avatarsRow}>
            {allRiders.length === 0 ? (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Ionicons name="person-outline" size={12} color="#9CA3AF" />
              </View>
            ) : (
              allRiders.map((rider, idx) => (
                rider.photo ? (
                  <Image
                    key={`${rider.photo}-${idx}`}
                    source={{ uri: rider.photo }}
                    style={[
                      styles.avatar, 
                      idx > 0 && { marginLeft: -8 },
                      rider.status === 'pending' && styles.pendingAvatar
                    ]}
                  />
                ) : (
                  <View
                    key={`fallback-${idx}`}
                    style={[
                      styles.avatar, 
                      styles.avatarFallback, 
                      idx > 0 && { marginLeft: -8 },
                      rider.status === 'pending' && styles.pendingAvatar
                    ]}
                  >
                    <Text style={styles.avatarText}>
                      {rider.name?.charAt(0) || '?'}
                    </Text>
                  </View>
                )
              ))
            )}
          </View>
          <Text style={styles.ridersText}>
            {totalRequestCount > 0 
              ? `${totalRequestCount} rider${totalRequestCount !== 1 ? 's' : ''}${pendingCount > 0 ? ` (${pendingCount} pending)` : ''}`
              : 'No riders yet'
            }
          </Text>
        </View>
        
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.price}>${Number(ride.price_per_seat).toFixed(2)}</Text>
          <Text style={styles.priceSub}>per seat</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const purple = '#7C3AED';

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },

  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  smallLabel: { color: '#6B7280', fontSize: 12, marginRight: 6 },
  time: { color: '#111827', fontSize: 12, fontWeight: '600' },

  addr: { color: '#111827', marginTop: 2 },
  divider: { height: 2, width: 2, backgroundColor: '#D1D5DB', marginVertical: 6, marginLeft: 3, borderRadius: 1 },

  dateRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 4 },
  dateText: { color: '#6B7280', fontSize: 12 },

  rightCol: { alignItems: 'flex-end', justifyContent: 'space-between' },
  seatsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  seatsTxt: { color: '#6B7280', fontSize: 12 },

  ridersInfo: { 
    alignItems: 'center', 
    marginVertical: 8,
  },
  avatarsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  avatar: { 
    width: 24, 
    height: 24, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#fff',
    backgroundColor: '#F3F4F6',
  },
  avatarFallback: { 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  pendingAvatar: {
    borderColor: '#F59E0B',
    borderWidth: 2,
  },
  avatarText: { color: '#6B7280', fontSize: 10, fontWeight: '600' },
  ridersText: { color: '#6B7280', fontSize: 10, textAlign: 'center' },

  price: { color: purple, fontWeight: '700' },
  priceSub: { color: '#6B7280', fontSize: 12 },
});