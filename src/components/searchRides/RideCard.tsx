// src/components/RideCard.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import type { Ride } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import RequestMessageModal from './RideRequestModal';
import { requestRide } from '../../integrations/hopin-backend/rider';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<MainStackParamList, 'RideDetails'>;

interface RideCardProps {
  ride: Ride;
  myProfileId?: string;
  myRequestStatus?: string | null;
  onRequestRide?: (rideId: string, message?: string) => void;
}

export default function RideCard({
  ride,
  myProfileId,
  myRequestStatus = null,
  onRequestRide,
}: RideCardProps) {
  const navigation = useNavigation<Nav>();

  const isOwn = !!myProfileId && myProfileId === ride.driverId;
  const hasRequested = !!myRequestStatus;
  const canRequest =
    !isOwn && !hasRequested && ride.availableSeats > 0 && ride.status === 'available';

  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Narrow status to the allowed union for RideDetails
  const detailsStatus: 'pending' | 'accepted' | 'declined' | 'available' =
    (['pending', 'accepted', 'declined', 'available'] as const).includes(
      ride.status as any
    )
      ? (ride.status as any)
      : 'available';

  const openDetails = () => {
    navigation.navigate('RideDetails', {
      mode: 'search',
      rideId: ride.id,
      // snake_case display fields supported by RideDetails
      start_location: ride.startLocation,
      end_location: ride.endLocation,
      departure_time: ride.departureTime,
      price_per_seat: ride.pricePerSeat,
      available_seats: ride.availableSeats,
      driver_name: ride.driver.name,
      status: detailsStatus,
      // coords omitted; RideDetails tolerates absence
    } as any);
  };

  const handleConfirm = async (message: string) => {
    setLoading(true);
    try {
      await requestRide({ ride_id: ride.id, message });
      Toast.show({
        type: 'success',
        text1: 'Request sent',
        text2: 'Driver will respond soon.',
      });
      onRequestRide?.(ride.id, message);
      setModalVisible(false);
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Request failed',
        text2: err?.message || 'Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      {/* Whole card opens details */}
      <TouchableOpacity onPress={openDetails} activeOpacity={0.85}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.driverInfo}>
            {ride.driver.photo ? (
              <Image source={{ uri: ride.driver.photo }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.fallback]}>
                <Text style={styles.fallbackText}>{ride.driver.name.charAt(0)}</Text>
              </View>
            )}
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.driverName}>{ride.driver.name}</Text>
              <View style={styles.rating}>
                <Ionicons name="star" size={14} color="#FACC15" />
                <Text style={styles.ratingText}>{ride.driver.rating.toFixed(1)}</Text>
              </View>
            </View>
          </View>
          <View style={styles.price}>
            <Text style={styles.priceText}>${ride.pricePerSeat}</Text>
            <Text style={styles.priceSub}>per seat</Text>
          </View>
        </View>

        {/* Route */}
        <View style={styles.route}>
          <View style={styles.dot} />
          <Text style={styles.location}>{ride.startLocation}</Text>
        </View>
        <View style={styles.line} />
        <View style={styles.route}>
          <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.location}>{ride.endLocation}</Text>
        </View>

        {/* Details */}
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Ionicons name="time" size={14} color="#6B7280" />
            <Text style={styles.detailText}>
              {fmtDate(ride.departureTime)} at {fmtTime(ride.departureTime)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="people" size={14} color="#6B7280" />
            <Text style={styles.detailText}>{ride.availableSeats} seats</Text>
          </View>
        </View>

        {/* Notices */}
        {isOwn && (
          <View style={styles.notice}>
            <Ionicons name="information-circle" size={16} color="#6B7280" />
            <Text style={styles.noticeText}>This is your ride.</Text>
          </View>
        )}
        {!isOwn && hasRequested && (
          <View style={styles.notice}>
            <Ionicons name="alert-circle" size={16} color="#6B7280" />
            <Text style={styles.noticeText}>
              Request{' '}
              {myRequestStatus === 'accepted'
                ? 'accepted'
                : myRequestStatus === 'declined' || myRequestStatus === 'rejected'
                ? 'declined'
                : 'pending'}
              .
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Request Button */}
      {canRequest && (
        <TouchableOpacity
          style={[styles.requestButton, loading && { opacity: 0.6 }]}
          onPress={() => setModalVisible(true)}
          disabled={loading}
        >
          <Ionicons name="chatbubble" size={16} color="#fff" />
          <Text style={styles.requestButtonText}>Request Ride</Text>
        </TouchableOpacity>
      )}

      {/* Message Modal */}
      <RequestMessageModal
        isOpen={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={handleConfirm}
        loading={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between' },
  driverInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  fallback: { backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' },
  fallbackText: { color: '#374151', fontSize: 18, fontWeight: '600' },
  driverName: { fontSize: 16, fontWeight: '600' },
  rating: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  ratingText: { marginLeft: 4, fontSize: 12, color: '#6B7280' },
  price: { alignItems: 'flex-end' },
  priceText: { fontSize: 18, fontWeight: '700', color: '#3B82F6' },
  priceSub: { fontSize: 12, color: '#6B7280' },
  route: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3B82F6' },
  location: { marginLeft: 8, fontSize: 14, color: '#111827' },
  line: { height: 1, backgroundColor: '#E5E7EB', marginLeft: 4, marginVertical: 4 },
  details: { flexDirection: 'row', marginTop: 8 },
  detailItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  detailText: { marginLeft: 4, fontSize: 12, color: '#6B7280' },
  notice: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  noticeText: { marginLeft: 6, fontSize: 12, color: '#6B7280' },
  requestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 6,
    paddingVertical: 10,
    justifyContent: 'center',
    marginTop: 12,
  },
  requestButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});