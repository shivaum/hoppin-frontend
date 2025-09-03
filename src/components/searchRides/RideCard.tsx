// src/components/searchRides/RideCard.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import type { Ride } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../navigation/types';
import Toast from 'react-native-toast-message';
import { requestRide } from '../../integrations/hopin-backend/rider';
import { calculateTravelTime } from '../../utils/travelTime';
import { formatTime, formatDateShort } from '../../utils/dateTime';

type Nav = NativeStackNavigationProp<MainStackParamList, 'RideDetails'>;

type Props = {
  ride: Ride;
  myProfileId?: string;
  myRequestStatus?: string | null;
  onRequestRide?: (rideId: string, message?: string) => void;
  role?: 'search' | 'rider'; // Add role prop to determine navigation context
};

export default function RideCard({
  ride,
  myProfileId,
  myRequestStatus = null,
  onRequestRide,
  role = 'search',
}: Props) {
  const navigation = useNavigation<Nav>();
  const [loading, setLoading] = useState(false);
  const [dropOffTime, setDropOffTime] = useState<string | null>(null);
  const [arrivalISO, setArrivalISO] = useState<string | null>(null);

  const isOwn = !!myProfileId && myProfileId === ride.driverId;

  const timePickup = useMemo(() => formatTime(ride.departureTime), [ride.departureTime]);
  const dateDisplay = useMemo(() => formatDateShort(ride.departureTime), [ride.departureTime]);

  // Calculate estimated drop-off time
  useEffect(() => {
    const calculateDropOff = async () => {
      const result = await calculateTravelTime(
        ride.startLocation,
        ride.endLocation,
        ride.departureTime
      );
      
      if (result) {
        setArrivalISO(result.estimatedArrival);
        setDropOffTime(formatTime(result.estimatedArrival));
      }
    };

    calculateDropOff();
  }, [ride.startLocation, ride.endLocation, ride.departureTime]);

  // limit status union for details page
  const detailsStatus: 'pending' | 'accepted' | 'declined' | 'available' =
    (['pending', 'accepted', 'declined', 'available'] as const).includes(ride.status as any)
      ? (ride.status as any)
      : 'available';

  const openDetails = () => {
    navigation.navigate('RideDetails', {
      rideId: ride.id,
      source: 'search', // Indicate this came from search results
    } as any);
  };

  const handleQuickRequest = async () => {
    try {
      setLoading(true);
      await requestRide({ ride_id: ride.id, message: 'Hey! Can I hoppin your ride?' });
      Toast.show({ type: 'success', text1: 'Request sent', text2: 'Driver will respond soon.' });
      onRequestRide?.(ride.id, 'Hey! Can I hoppin your ride?');
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Request failed', text2: e?.message || 'Try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get status badge styling
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return { backgroundColor: '#FEF3C7', color: '#92400E', text: 'Request Pending' };
      case 'accepted':
        return { backgroundColor: '#D1FAE5', color: '#065F46', text: 'Request Accepted' };
      case 'declined':
      case 'rejected':
        return { backgroundColor: '#FEE2E2', color: '#991B1B', text: 'Request Declined' };
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={openDetails} style={s.card}>
      {/* Left: labels/times */}
      <View style={{ flex: 1 }}>
        {/* Date header */}
        <View style={s.dateHeader}>
          <Ionicons name="calendar-outline" size={14} color="#7C3AED" />
          <Text style={s.dateText}>{dateDisplay}</Text>
        </View>
        
        <View style={s.row}>
          <View style={[s.dot, { backgroundColor: '#3B82F6' }]} />
          <Text style={s.smallLabel}>Pick-up</Text>
          <Text style={s.time}>{timePickup}</Text>
        </View>
        <View style={s.row}>
          <View style={[s.dot, { backgroundColor: '#10B981' }]} />
          <Text style={s.smallLabel}>Drop-off</Text>
          <Text style={s.time}>{dropOffTime || '—'}</Text>
        </View>

        {/* Addresses */}
        <Text numberOfLines={1} style={s.addr}>{ride.startLocation}</Text>
        <View style={s.divider} />
        <Text numberOfLines={1} style={s.addr}>{ride.endLocation}</Text>

        {/* Driver info */}
        <View style={s.driverRow}>
          {ride.driver.photo ? (
            <Image source={{ uri: ride.driver.photo }} style={s.driverAvatar} />
          ) : (
            <View style={[s.driverAvatar, s.driverAvatarFallback]}>
              <Text style={s.driverAvatarText}>
                {ride.driver.name?.charAt(0) ?? 'D'}
              </Text>
            </View>
          )}
          <View style={s.driverInfo}>
            <Text style={s.driverName}>{ride.driver.name}</Text>
            {ride.driver.rating !== undefined && (
              <View style={s.ratingRow}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={s.ratingText}>{ride.driver.rating.toFixed(1)}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Right: seats & price */}
      <View style={s.rightCol}>
        <View style={s.seatsRow}>
          <Ionicons name="people" size={14} color="#6B7280" />
          <Text style={s.seatsTxt}>{ride.availableSeats}</Text>
        </View>
        
        {/* Request Status Badge */}
        {myRequestStatus && getStatusStyle(myRequestStatus) && (
          <View style={[s.statusBadge, { backgroundColor: getStatusStyle(myRequestStatus)!.backgroundColor }]}>
            <Text style={[s.statusText, { color: getStatusStyle(myRequestStatus)!.color }]}>
              {getStatusStyle(myRequestStatus)!.text}
            </Text>
          </View>
        )}
        
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={s.price}>${ride.pricePerSeat}</Text>
          <Text style={s.priceSub}>per seat</Text>
        </View>
      </View>

      {/* (Optional) inline request button — keep hidden in the list; enable if you want
      <TouchableOpacity
        onPress={handleQuickRequest}
        disabled={loading || isOwn || ride.availableSeats <= 0 || ride.status !== 'available'}
        style={[s.req, (loading || isOwn || ride.availableSeats <= 0 || ride.status !== 'available') && { opacity: 0.5 }]}
      >
        <Ionicons name="chatbubble" size={14} color="#fff" />
        <Text style={s.reqTxt}>Request</Text>
      </TouchableOpacity>
      */}
    </TouchableOpacity>
  );
}

const purple = '#7C3AED';

const s = StyleSheet.create({
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

  dateHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 6,
  },
  dateText: { 
    color: '#7C3AED', 
    fontSize: 14, 
    fontWeight: '700',
  },

  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  smallLabel: { color: '#6B7280', fontSize: 12, marginRight: 6 },
  time: { color: '#111827', fontSize: 12, fontWeight: '600' },

  addr: { color: '#111827', marginTop: 2 },
  divider: { height: 2, width: 2, backgroundColor: '#D1D5DB', marginVertical: 6, marginLeft: 3, borderRadius: 1 },

  driverRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 8,
  },
  driverAvatar: { 
    width: 24, 
    height: 24, 
    borderRadius: 12,
  },
  driverAvatarFallback: { 
    backgroundColor: '#9CA3AF', 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  driverAvatarText: { 
    color: '#fff', 
    fontSize: 10, 
    fontWeight: '600',
  },
  driverInfo: { 
    flex: 1,
  },
  driverName: { 
    color: '#111827', 
    fontSize: 12, 
    fontWeight: '600',
  },
  ratingRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 2,
    gap: 3,
  },
  ratingText: { 
    color: '#6B7280', 
    fontSize: 11,
    fontWeight: '500',
  },

  rightCol: { alignItems: 'flex-end', justifyContent: 'space-between' },
  seatsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  seatsTxt: { color: '#6B7280', fontSize: 12 },

  price: { color: purple, fontWeight: '700' },
  priceSub: { color: '#6B7280', fontSize: 12 },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginVertical: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },

  req: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  reqTxt: { color: '#fff', fontWeight: '700' },
});