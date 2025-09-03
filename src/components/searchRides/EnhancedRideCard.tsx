// src/components/searchRides/EnhancedRideCard.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import type { EnhancedSearchRide } from '../../types';
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
  ride: EnhancedSearchRide;
  myProfileId?: string;
  myRequestStatus?: string | null;
  onRequestRide?: (rideId: string, message?: string) => void;
  role?: 'search' | 'rider';
  showEnhancedData?: boolean; // Toggle enhanced features display
};

export default function EnhancedRideCard({
  ride,
  myProfileId,
  myRequestStatus = null,
  onRequestRide,
  role = 'search',
  showEnhancedData = true,
}: Props) {
  const navigation = useNavigation<Nav>();
  const [loading, setLoading] = useState(false);
  const [dropOffTime, setDropOffTime] = useState<string | null>(null);
  const [arrivalISO, setArrivalISO] = useState<string | null>(null);

  const isOwn = !!myProfileId && myProfileId === ride.driver_id;

  const timePickup = useMemo(() => formatTime(ride.departure_time), [ride.departure_time]);
  const dateDisplay = useMemo(() => formatDateShort(ride.departure_time), [ride.departure_time]);

  // Calculate estimated drop-off time
  useEffect(() => {
    const calculateDropOff = async () => {
      const result = await calculateTravelTime(
        ride.start_location,
        ride.end_location,
        ride.departure_time
      );
      
      if (result) {
        setArrivalISO(result.estimatedArrival);
        setDropOffTime(formatTime(result.estimatedArrival));
      }
    };

    calculateDropOff();
  }, [ride.start_location, ride.end_location, ride.departure_time]);

  // limit status union for details page
  const detailsStatus: 'pending' | 'accepted' | 'declined' | 'available' =
    (['pending', 'accepted', 'declined', 'available'] as const).includes(ride.status as any)
      ? (ride.status as any)
      : 'available';

  const openDetails = () => {
    navigation.navigate('RideDetails', {
      rideId: ride.ride_id,
      source: 'search', // Indicate this came from search results
    } as any);
  };

  const handleQuickRequest = async () => {
    try {
      setLoading(true);
      await requestRide({ ride_id: ride.ride_id, message: 'Hey! Can I hoppin your ride?' });
      Toast.show({ type: 'success', text1: 'Request sent', text2: 'Driver will respond soon.' });
      onRequestRide?.(ride.ride_id, 'Hey! Can I hoppin your ride?');
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

  // Helper function to get popularity level
  const getPopularityLevel = (score: number) => {
    if (score >= 80) return { level: 'High', color: '#10B981', icon: 'trending-up' };
    if (score >= 50) return { level: 'Medium', color: '#F59E0B', icon: 'trending-up' };
    if (score >= 20) return { level: 'Low', color: '#6B7280', icon: 'trending-up' };
    return { level: 'New', color: '#9CA3AF', icon: 'sparkles' };
  };

  // Helper function to get relevance badge color
  const getRelevanceBadgeColor = (score?: number) => {
    if (!score) return '#F3F4F6';
    if (score >= 80) return '#DCFCE7'; // green
    if (score >= 60) return '#FEF3C7'; // yellow
    return '#FEE2E2'; // red
  };

  const getRelevanceTextColor = (score?: number) => {
    if (!score) return '#6B7280';
    if (score >= 80) return '#15803D';
    if (score >= 60) return '#92400E';
    return '#991B1B';
  };

  const popularityData = getPopularityLevel(ride.popularity_score);

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={openDetails} style={s.card}>
      {/* Enhanced Header with Badges */}
      {showEnhancedData && (
        <View style={s.enhancedHeader}>
          <View style={s.badgeRow}>
            {/* Popularity Badge */}
            <View style={[s.popularityBadge, { backgroundColor: popularityData.color + '20' }]}>
              <Ionicons name={popularityData.icon as any} size={10} color={popularityData.color} />
              <Text style={[s.popularityText, { color: popularityData.color }]}>
                {popularityData.level}
              </Text>
            </View>

            {/* Relevance Score */}
            {ride.relevance_score !== undefined && (
              <View style={[s.relevanceBadge, { 
                backgroundColor: getRelevanceBadgeColor(ride.relevance_score) 
              }]}>
                <Text style={[s.relevanceText, { 
                  color: getRelevanceTextColor(ride.relevance_score) 
                }]}>
                  {Math.round(ride.relevance_score)}% match
                </Text>
              </View>
            )}

            {/* Distance Badge */}
            {ride.distance_km !== undefined && (
              <View style={s.distanceBadge}>
                <Ionicons name="location-outline" size={10} color="#6B7280" />
                <Text style={s.distanceText}>{ride.distance_km}km</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Main Content */}
      <View style={s.mainContent}>
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
          <Text numberOfLines={1} style={s.addr}>{ride.start_location}</Text>
          <View style={s.divider} />
          <Text numberOfLines={1} style={s.addr}>{ride.end_location}</Text>

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
                  {ride.driver.total_rides && (
                    <Text style={s.ratingSubText}>({ride.driver.total_rides} rides)</Text>
                  )}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Right: seats & price */}
        <View style={s.rightCol}>
          <View style={s.seatsRow}>
            <Ionicons name="people" size={14} color="#6B7280" />
            <Text style={s.seatsTxt}>{ride.available_seats}</Text>
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
            <Text style={s.price}>${ride.price_per_seat}</Text>
            <Text style={s.priceSub}>per seat</Text>
            {showEnhancedData && ride.popularity_score > 60 && (
              <View style={s.trendingPill}>
                <Ionicons name="flame" size={10} color="#F59E0B" />
                <Text style={s.trendingText}>Popular</Text>
              </View>
            )}
          </View>
        </View>
      </View>
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
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
    overflow: 'hidden',
  },

  enhancedHeader: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  popularityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  popularityText: {
    fontSize: 10,
    fontWeight: '600',
  },

  relevanceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  relevanceText: {
    fontSize: 10,
    fontWeight: '600',
  },

  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    gap: 2,
  },
  distanceText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },

  mainContent: {
    padding: 12,
    flexDirection: 'row',
    gap: 12,
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
  ratingSubText: {
    color: '#9CA3AF',
    fontSize: 10,
  },

  rightCol: { alignItems: 'flex-end', justifyContent: 'space-between' },
  seatsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  seatsTxt: { color: '#6B7280', fontSize: 12 },

  price: { color: purple, fontWeight: '700' },
  priceSub: { color: '#6B7280', fontSize: 12 },

  trendingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
    gap: 2,
  },
  trendingText: {
    fontSize: 9,
    color: '#F59E0B',
    fontWeight: '600',
  },

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
});