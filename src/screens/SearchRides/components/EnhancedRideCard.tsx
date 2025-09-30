// src/components/searchRides/EnhancedRideCard.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import type { EnhancedSearchRide } from '../../../types';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../../navigation/types';
import Toast from 'react-native-toast-message';
import { requestRide } from '../../../integrations/hopin-backend/rider';
import { calculateTravelTime } from '../../../utils/travelTime';
import { formatTime, formatDateShort } from '../../../utils/dateTime';

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

  // Safety check - ensure we have valid ride data
  if (!ride || !ride.ride_id || !ride.departure_time || !ride.driver) {
    console.log('❌ EnhancedRideCard: Invalid ride data, returning empty View');
    return <View />;
  }
  
  // Step 2: Add time formatting - this might be the culprit
  const safeRideId = ride?.ride_id ? String(ride.ride_id) : 'N/A';
  const safeDriverName = ride?.driver?.name ? String(ride.driver.name) : 'Driver';
  const safeSeats = ride?.available_seats !== undefined ? String(ride.available_seats) : 'N/A';
  const safePrice = ride?.price_per_seat !== undefined ? String(ride.price_per_seat) : 'N/A';

  // Ultra-safe time formatting
  let safeTimePickup = 'Time N/A';
  let safeDateDisplay = 'Date N/A';
  
  try {
    if (ride?.departure_time && typeof ride.departure_time === 'string') {
      const timeResult = formatTime(ride.departure_time);
      const dateResult = formatDateShort(ride.departure_time);
      
      safeTimePickup = timeResult ? String(timeResult) : 'Time N/A';
      safeDateDisplay = dateResult ? String(dateResult) : 'Date N/A';
    }
  } catch (error) {
    console.log('Time formatting error:', error);
    safeTimePickup = 'Time Error';
    safeDateDisplay = 'Date Error';
  }

  // Step 3: Add driver rating and total_rides - VERY SUSPICIOUS FIELDS
  const safeDriverRating = ride?.driver?.rating !== undefined && ride?.driver?.rating !== null 
    ? String(Number(ride.driver.rating).toFixed(1))
    : 'New';
    
  const safeDriverTotalRides = ride?.driver?.total_rides !== undefined && ride?.driver?.total_rides !== null
    ? String(ride.driver.total_rides)
    : '0';

  const safeStartLocation = ride?.start_location ? String(ride.start_location) : 'Start location N/A';
  const safeEndLocation = ride?.end_location ? String(ride.end_location) : 'End location N/A';

  // Calculate estimated drop-off time
  useEffect(() => {
    const calculateDropOff = async () => {
      try {
        const result = await calculateTravelTime(
          ride.start_location,
          ride.end_location,
          ride.departure_time
        );
        
        if (result) {
          setArrivalISO(result.estimatedArrival);
          const formattedTime = formatTime(result.estimatedArrival);
          setDropOffTime(String(formattedTime || 'Calculating...'));
        }
      } catch (e) {
        console.log('🚗 calculateDropOff error:', e);
        setDropOffTime('Calculating...');
      }
    };

    calculateDropOff();
  }, [ride.start_location, ride.end_location, ride.departure_time]);

  // FINAL: Complete EnhancedRideCard with fixed conditional rendering
  const isOwn = !!myProfileId && myProfileId === ride.driver_id;
  
  // Helper functions
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

  const getRelevanceBadgeColor = (score?: number) => {
    if (!score) return '#F3F4F6';
    if (score >= 80) return '#DCFCE7';
    if (score >= 60) return '#FEF3C7';
    return '#FEE2E2';
  };

  const getRelevanceTextColor = (score?: number) => {
    if (!score) return '#6B7280';
    if (score >= 80) return '#15803D';
    if (score >= 60) return '#92400E';
    return '#991B1B';
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

  const openDetails = () => {
    navigation.navigate('RideDetails', {
      rideId: ride.ride_id,
      source: 'search',
    } as any);
  };

  return (
    <View>
      {/* Enhanced header with badges - USING SAFE CONDITIONAL RENDERING */}
      {(() => {
        if (showEnhancedData) {
          return (
            <View style={s.enhancedHeader}>
              <View style={s.badgeRow}>
                {/* Relevance Score Badge */}
                {(() => {
                  if (ride.relevance_score) {
                    return (
                      <View style={[
                        s.relevanceBadge, 
                        { backgroundColor: getRelevanceBadgeColor(ride.relevance_score) }
                      ]}>
                        <Text style={[
                          s.relevanceText, 
                          { color: getRelevanceTextColor(ride.relevance_score) }
                        ]}>
                          {String(Math.round(ride.relevance_score || 0))}% match
                        </Text>
                      </View>
                    );
                  }
                  return null;
                })()}
                
                {/* Distance Badge */}
                {(() => {
                  if (ride.distance_miles) {
                    return (
                      <View style={s.distanceBadge}>
                        <Ionicons name="location-outline" size={10} color="#6B7280" />
                        <Text style={s.distanceText}>{String(ride.distance_miles.toFixed(1))} mi</Text>
                      </View>
                    );
                  }
                  return null;
                })()}
              </View>
            </View>
          );
        }
        return null;
      })()}

      <TouchableOpacity activeOpacity={0.85} onPress={openDetails} style={s.card}>
      {/* Left: Route and time info */}
      <View style={{ flex: 1 }}>
        {/* Date Header */}
        <View style={s.dateHeader}>
          <Ionicons name="calendar-outline" size={14} color="#7C3AED" />
          <Text style={s.dateText}>{safeDateDisplay}</Text>
        </View>
        
        <View style={s.row}>
          <View style={[s.dot, { backgroundColor: '#3B82F6' }]} />
          <Text style={s.smallLabel}>Pick-up</Text>
          <Text style={s.time}>{safeTimePickup}</Text>
        </View>
        <View style={s.row}>
          <View style={[s.dot, { backgroundColor: '#10B981' }]} />
          <Text style={s.smallLabel}>Drop-off</Text>
          <Text style={s.time}>{dropOffTime || '—'}</Text>
        </View>

        {/* Addresses */}
        <Text numberOfLines={1} style={s.addr}>{safeStartLocation}</Text>
        <View style={s.divider} />
        <Text numberOfLines={1} style={s.addr}>{safeEndLocation}</Text>
      </View>

      {/* Right: Stats and price */}
      <View style={s.rightCol}>
        <View style={s.seatsRow}>
          <Ionicons name="person-outline" size={14} color="#6B7280" />
          <Text style={s.seatsTxt}>{safeSeats} left</Text>
        </View>
        
        {/* Driver info */}
        <View style={{ alignItems: 'center', marginVertical: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            {ride.driver?.photo ? (
              <Image source={{ uri: ride.driver.photo }} style={s.driverAvatar} />
            ) : (
              <View style={[s.driverAvatar, s.driverAvatarFallback]}>
                <Text style={s.driverAvatarText}>{String(safeDriverName.charAt(0) || '?')}</Text>
              </View>
            )}
          </View>
          <Text style={s.driverName}>{safeDriverName}</Text>
          <View style={s.ratingRow}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={s.ratingText}>{safeDriverRating}</Text>
            {(() => {
              const totalRides = ride?.driver?.total_rides;
              if (totalRides !== undefined && totalRides !== null && typeof totalRides === 'number' && totalRides > 0) {
                return <Text style={s.ratingSubText}>({String(totalRides)} rides)</Text>;
              }
              return null;
            })()}
          </View>
        </View>
        
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={s.price}>${safePrice}</Text>
          <Text style={s.priceSub}>per seat</Text>
        </View>
      </View>
      </TouchableOpacity>

      {/* Owner Badge - Show if this is user's own ride */}
      {(() => {
        if (isOwn) {
          return (
            <View style={{ marginTop: 8, paddingHorizontal: 12 }}>
              <View style={[
                s.statusBadge,
                { backgroundColor: '#EDF2F7', borderWidth: 1, borderColor: '#7C3AED' }
              ]}>
                <Text style={[
                  s.statusText,
                  { color: '#7C3AED', fontWeight: '600' }
                ]}>
                  Your Ride
                </Text>
              </View>
            </View>
          );
        }
        return null;
      })()}

      {/* Status Badge - USING SAFE CONDITIONAL RENDERING */}
      {(() => {
        if (myRequestStatus && getStatusStyle(myRequestStatus) && !isOwn) {
          const statusStyle = getStatusStyle(myRequestStatus);
          return (
            <View style={{ marginTop: 8, paddingHorizontal: 12 }}>
              <View style={[
                s.statusBadge,
                { backgroundColor: statusStyle?.backgroundColor }
              ]}>
                <Text style={[
                  s.statusText,
                  { color: statusStyle?.color }
                ]}>
                  {String(statusStyle?.text || '')}
                </Text>
              </View>
            </View>
          );
        }
        return null;
      })()}

      {/* Action Button - USING SAFE CONDITIONAL RENDERING */}
      {(() => {
        if (role === 'search' && !isOwn && !myRequestStatus) {
          return (
            <View style={{ marginTop: 8, paddingHorizontal: 12 }}>
              <TouchableOpacity
                onPress={handleQuickRequest}
                disabled={loading}
                style={{
                  backgroundColor: '#7C3AED',
                  borderRadius: 8,
                  paddingVertical: 8,
                  alignItems: 'center',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>
                  {loading ? 'Requesting...' : 'Quick Request'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }
        return null;
      })()}
    </View>
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