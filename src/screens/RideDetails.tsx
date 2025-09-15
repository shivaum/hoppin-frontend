import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../navigation/types';
import Map from '../components/common/map/Map';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { requestRide, getRideDetails } from '../integrations/hopin-backend/rider';
import { declineRideRequest } from '../integrations/hopin-backend/driver';
import type { LatLng } from 'react-native-maps';
import { GOOGLE_MAPS_API_KEY } from '@env';
import { calculateTravelTime } from '../utils/travelTime';
import { formatDateShort, formatTime } from '../utils/dateTime';
import { useAuth } from '../contexts/AuthContext';

type Route = RouteProp<MainStackParamList, 'RideDetails'>;
type Nav = NativeStackNavigationProp<MainStackParamList, 'RideDetails'>;

// ---- helpers ----
function toLatLng(
  maybe:
    | { latitude?: number; longitude?: number }
    | { lat?: number; lng?: number }
    | undefined,
  lat?: number,
  lng?: number
): LatLng | null {
  if (maybe && typeof maybe === 'object') {
    const ll = maybe as any;
    if (Number.isFinite(ll.latitude) && Number.isFinite(ll.longitude)) {
      return { latitude: ll.latitude, longitude: ll.longitude };
    }
    if (Number.isFinite(ll.lat) && Number.isFinite(ll.lng)) {
      return { latitude: ll.lat, longitude: ll.lng };
    }
  }
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return { latitude: lat as number, longitude: lng as number };
  }
  return null;
}
const extractShort = (addr?: string) => {
  if (!addr) return '';
  const short = addr.split(',')[0].trim();
  return short || addr.slice(0, 20);
};
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const purple = '#7C3AED';
const scrH = Dimensions.get('window').height;
const MAP_H = Math.round(scrH);
const SHEET_EXPANDED = Math.round(scrH * 0.70);
const SHEET_COLLAPSED = Math.round(scrH * 0.42);

export default function RideDetails() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [rideData, setRideData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract ride ID from params
  const rideId = (params as any).rideId;

  // Fetch ride details when component mounts
  useEffect(() => {
    const fetchRideDetails = async () => {
      if (!rideId) {
        setError('No ride ID provided');
        setLoadingData(false);
        return;
      }

      try {
        setLoadingData(true);
        setError(null);
        const data = await getRideDetails(rideId);
        setRideData(data);
      } catch (err: any) {
        console.error('Failed to fetch ride details:', err);
        setError(err.message || 'Failed to load ride details');
      } finally {
        setLoadingData(false);
      }
    };

    fetchRideDetails();
  }, [rideId]);

  // Calculate estimated arrival time when ride data is available
  useEffect(() => {
    const calculateETA = async () => {
      if (!rideData?.ride) return;

      try {
        const result = await calculateTravelTime(
          rideData.ride.start_location,
          rideData.ride.end_location,
          rideData.ride.departure_time
        );
        
        if (result) {
          // Store the calculated arrival time for use in the component
          setRideData((prev: any) => ({
            ...prev!,
            calculated_arrival: result.estimatedArrival
          }));
        }
      } catch (err) {
        console.log('Failed to calculate ETA:', err);
      }
    };

    calculateETA();
  }, [rideData?.ride.start_location, rideData?.ride.end_location, rideData?.ride.departure_time]);

  // TIME - computed from API data
  const { dateLabel, timeLabel, arrTimeLabel, departureISO, arrivalISO } = useMemo(() => {
    if (!rideData) {
      return { dateLabel: '', timeLabel: '', arrTimeLabel: undefined, departureISO: '', arrivalISO: '' };
    }

    const departureTime = rideData.ride.departure_time;
    const arrivalTime = (rideData as any).calculated_arrival;
    
    return {
      dateLabel: formatDateShort(departureTime),
      timeLabel: formatTime(departureTime),
      arrTimeLabel: arrivalTime ? formatTime(arrivalTime) : undefined,
      departureISO: departureTime,
      arrivalISO: arrivalTime || '',
    };
  }, [rideData]);

  // COORDS - computed from API data
  const start = useMemo(() => {
    if (!rideData) return null;
    return toLatLng(undefined, rideData.ride.start_lat, rideData.ride.start_lng);
  }, [rideData]);
  
  const end = useMemo(() => {
    if (!rideData) return null;
    return toLatLng(undefined, rideData.ride.end_lat, rideData.ride.end_lng);
  }, [rideData]);

  const startAddress: string = rideData?.ride.start_location ?? '';
  const endAddress: string = rideData?.ride.end_location ?? '';

  const [geoStart, setGeoStart] = useState<LatLng | null>(null);
  const [geoEnd, setGeoEnd] = useState<LatLng | null>(null);

  useEffect(() => {
    const geocode = async (address: string): Promise<LatLng | null> => {
      if (!address) return null;
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            address
          )}&key=${GOOGLE_MAPS_API_KEY}`
        );
        const data = await res.json();
        const loc = data?.results?.[0]?.geometry?.location;
        if (loc && Number.isFinite(loc.lat) && Number.isFinite(loc.lng)) {
          return { latitude: loc.lat, longitude: loc.lng };
        }
      } catch {}
      return null;
    };

    if (!start && startAddress) geocode(startAddress).then(setGeoStart);
    else setGeoStart(start);

    if (!end && endAddress) geocode(endAddress).then(setGeoEnd);
    else setGeoEnd(end);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startAddress, endAddress]);

  const startFinal = start || geoStart;
  const endFinal = end || geoEnd;

  const hasCoords =
    !!startFinal &&
    !!endFinal &&
    Number.isFinite(startFinal.latitude) &&
    Number.isFinite(startFinal.longitude) &&
    Number.isFinite(endFinal.latitude) &&
    Number.isFinite(endFinal.longitude);

  // META - from API data and params
  const role: 'search' | 'rider' | 'driver' = (params as any).source === 'search' ? 'search' : 'rider';
  const status: string = rideData?.ride.status ?? 'available';
  const availableSeats: number = rideData?.ride.available_seats ?? 0;
  const pricePerSeat: number | string | undefined = rideData?.ride.price_per_seat;

  const driverName: string = rideData?.driver.name ?? 'Driver';
  const driverPhoto: string | undefined = rideData?.driver.photo;
  const driverRating: number | undefined = rideData?.driver.rating;


  const startShort = extractShort(startAddress) || 'Start';
  const endShort = extractShort(endAddress) || 'End';

  const requestId: string | undefined = rideData?.user_request?.id;
  const myRequestStatus: string | null = rideData?.user_request?.status ?? null;

  // Check if current user is the driver of this ride
  const isOwnRide = !!user?.id && !!rideData?.ride?.driver_id && user.id === rideData.ride.driver_id;

  const baseFare = pricePerSeat ? Number(pricePerSeat) : 0;
  const fee = baseFare ? Number((baseFare * 0.1).toFixed(2)) : 0;
  const discount = 0; // No discount system for now
  const total = Math.max(baseFare + fee - discount, 0);


  // PERMISSIONS
  const canRequest = role === 'search' && status === 'available' && availableSeats > 0 && !myRequestStatus;
  const canCancel  = role === 'rider' && (status === 'pending' || status === 'accepted');
  const canContact = role === 'rider' && status === 'accepted';

  // Helper functions for request status styling
  const getRequestStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return { backgroundColor: '#FEF3C7' };
      case 'accepted':
        return { backgroundColor: '#D1FAE5' };
      case 'declined':
      case 'rejected':
        return { backgroundColor: '#FEE2E2' };
      default:
        return { backgroundColor: '#F3F4F6' };
    }
  };

  const getRequestStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#92400E';
      case 'accepted':
        return '#065F46';
      case 'declined':
      case 'rejected':
        return '#991B1B';
      default:
        return '#6B7280';
    }
  };

  const getRequestStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return 'time-outline' as const;
      case 'accepted':
        return 'checkmark-circle-outline' as const;
      case 'declined':
      case 'rejected':
        return 'close-circle-outline' as const;
      default:
        return 'help-circle-outline' as const;
    }
  };

  const getRequestStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Request pending - waiting for driver response';
      case 'accepted':
        return 'Request accepted! You can contact the driver';
      case 'declined':
        return 'Request declined - try another ride';
      case 'rejected':
        return 'Request rejected - try another ride';
      default:
        return 'Request status unknown';
    }
  };

  // ACTIONS
  const handleRequest = async () => {
    try {
      setLoading(true);
      await requestRide({ ride_id: rideId, message: 'Hey! Can I hoppin your ride?' });
      Toast.show({ type: 'success', text1: 'Request sent', text2: 'Driver will respond soon.' });
      navigation.goBack();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Request failed', text2: e?.message || 'Try again.' });
    } finally {
      setLoading(false);
    }
  };
  const handleCancel = async () => {
    if (!requestId) return;
    try {
      setLoading(true);
      await declineRideRequest(requestId);
      Toast.show({ type: 'success', text1: 'Request cancelled' });
      navigation.goBack();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Cancel failed', text2: e?.message || 'Try again.' });
    } finally {
      setLoading(false);
    }
  };
  const handleContact = () => {
    Toast.show({ type: 'info', text1: 'Open chat', text2: 'Wire this to your messages screen.' });
  };

  // ---- Bottom sheet (no extra libs) ----
  const sheetH = useRef(new Animated.Value(SHEET_EXPANDED)).current;
  const sheetStartH = useRef(SHEET_EXPANDED);

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 8,
      onPanResponderGrant: () => {
        sheetStartH.current = (sheetH as any)._value ?? SHEET_EXPANDED;
      },
      onPanResponderMove: (_, g) => {
        const next = clamp(sheetStartH.current - g.dy, SHEET_COLLAPSED, SHEET_EXPANDED);
        sheetH.setValue(next);
      },
      onPanResponderRelease: (_, g) => {
        // snap to nearest
        const mid = (SHEET_EXPANDED + SHEET_COLLAPSED) / 2;
        const dest = (sheetStartH.current - g.dy) > mid ? SHEET_EXPANDED : SHEET_COLLAPSED;
        Animated.spring(sheetH, { toValue: dest, useNativeDriver: false, tension: 140, friction: 18 }).start();
      },
    })
  ).current;

  // Loading state
  if (loadingData) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 16, color: '#6B7280' }}>Loading ride details...</Text>
      </View>
    );
  }

  // Error state
  if (error || !rideData) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={{ fontSize: 16, color: '#DC2626', textAlign: 'center', marginBottom: 16 }}>
          {error || 'Failed to load ride details'}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ 
            backgroundColor: '#7C3AED', 
            paddingHorizontal: 16, 
            paddingVertical: 8, 
            borderRadius: 8 
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Map (kept interactive; sheet sits on top) */}
      <View style={styles.mapWrap}>
        {hasCoords ? (
          <Map 
            start={startFinal!} 
            end={endFinal!} 
            startAddress={startAddress}
            endAddress={endAddress}
          />
        ) : (
          <View style={styles.mapFallback}>
            <Text style={{ color: '#6B7280' }}>No map coordinates</Text>
          </View>
        )}
      </View>

      {/* Floating back button */}
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} color="#111827" />
      </TouchableOpacity>

      {/* Draggable sheet */}
      <Animated.View
        style={[styles.sheetWrap, { height: sheetH }]}
        {...pan.panHandlers}
      >
        <View style={styles.handle} />

        <ScrollView
          contentContainerStyle={styles.sheetScroll}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
        >
          {/* Driver row */}
          <View style={styles.driverRow}>
            {driverPhoto ? (
              <Image 
                source={{ uri: driverPhoto }} 
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.avatarInitial}>
                  {driverName?.charAt(0) ?? 'D'}
                </Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.driverName}>{driverName}</Text>
              {driverRating !== undefined && (
                <View style={styles.ratingPill}>
                  <Ionicons name="star" size={12} color="#111827" />
                  <Text style={styles.ratingText}>{driverRating.toFixed(1)}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Title & date */}
          <Text style={styles.routeTitle}>
            {startShort} <Text style={styles.arrow}>→</Text> {endShort}
          </Text>
          <Text style={styles.dateTimeLite}>{dateLabel}, {timeLabel}</Text>

          {/* Itinerary */}
          <View style={styles.itineraryBox}>
            <Text style={styles.itineraryTitle}>Itinerary</Text>

            <View style={styles.itinRow}>
              <View style={styles.itinLeft}>
                <Ionicons name="location" size={14} color="#6B7280" style={{ marginRight: 6 }} />
                <Text style={styles.itinLabel}>From</Text>
              </View>
              <Text style={styles.itinTime}>{timeLabel}</Text>
            </View>
            <Text style={styles.itinAddress}>{startAddress}</Text>

            <View style={styles.itinRow}>
              <View style={styles.itinLeft}>
                <Ionicons name="location" size={14} color="#6B7280" style={{ marginRight: 6 }} />
                <Text style={styles.itinLabel}>To</Text>
              </View>
              <Text style={styles.itinTime}>{arrTimeLabel ?? '—'}</Text>
            </View>
            <Text style={styles.itinAddress}>{endAddress}</Text>
          </View>

          {/* Price */}
          <Text style={styles.sectionHeader}>Price</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Base Fare</Text>
            <Text style={styles.priceValue}>${baseFare.toFixed(2)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Estimated fee</Text>
            <Text style={styles.priceValue}>${fee.toFixed(2)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Discounts</Text>
            <Text style={[styles.priceValue, { color: purple }]}>
              {discount ? `-$${Number(discount).toFixed(2)}` : '$0.00'}
            </Text>
          </View>
          <View style={[styles.priceRow, { marginTop: 4 }]}>
            <Text style={[styles.priceLabel, { fontWeight: '700' }]}>Total</Text>
            <Text style={[styles.priceValue, { fontWeight: '700' }]}>${total.toFixed(2)}</Text>
          </View>

          {/* Cancellation */}
          <Text style={[styles.sectionHeader, { marginTop: 16 }]}>Cancellation Policy</Text>
          <Text style={styles.policyText}>
            Insert policy here. Insert policy here. Insert policy here. Insert policy here.
          </Text>

          {/* CTAs - Show different content based on ownership */}
          {isOwnRide ? (
            /* Show owner message when viewing own ride */
            <View style={[styles.statusContainer, { backgroundColor: '#EDF2F7', borderWidth: 1, borderColor: '#7C3AED' }]}>
              <Ionicons 
                name="car-outline" 
                size={20} 
                color="#7C3AED" 
              />
              <Text style={[styles.statusText, { color: '#7C3AED', fontWeight: '600' }]}>
                This is your ride. Manage it from the "My Rides" tab.
              </Text>
            </View>
          ) : (
            /* Show normal request/status content for non-owners */
            <>
              {/* Show request status if user has already requested */}
              {myRequestStatus && (
                <View style={[styles.statusContainer, getRequestStatusStyle(myRequestStatus)]}>
                  <Ionicons 
                    name={getRequestStatusIcon(myRequestStatus)} 
                    size={20} 
                    color={getRequestStatusColor(myRequestStatus)} 
                  />
                  <Text style={[styles.statusText, { color: getRequestStatusColor(myRequestStatus) }]}>
                    {getRequestStatusMessage(myRequestStatus)}
                  </Text>
                </View>
              )}
              
              {/* Show buttons unless request has been rejected/declined */}
              {myRequestStatus !== 'rejected' && myRequestStatus !== 'declined' && (
                <>
                  {/* Request button - only show if no existing request */}
                  {!myRequestStatus && (
                    <TouchableOpacity
                      style={[styles.cta, (loading || !canRequest) && { opacity: 0.6 }]}
                      onPress={handleRequest}
                      disabled={loading || !canRequest}
                    >
                      <Text style={styles.ctaText}>{loading ? 'Requesting…' : 'Request ride'}</Text>
                    </TouchableOpacity>
                  )}

                  {/* Message and Cancel buttons - shown for all existing requests except rejected */}
                  {myRequestStatus && (
                    <View style={styles.rowGap}>
                      <TouchableOpacity
                        style={[styles.secondary, loading && { opacity: 0.6 }]}
                        onPress={handleCancel}
                        disabled={loading}
                      >
                        <Text style={styles.secondaryText}>Cancel ride</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.primary}
                        onPress={() => {
                          const driverId = rideData?.driver?.id || rideData?.ride?.driver_id;
                          const conversation = {
                            id: `${rideId}-${driverId || 'unknown'}`,
                            otherUser: {
                              id: driverId || '',
                              name: driverName,
                              photo: driverPhoto,
                            },
                            ride: {
                              id: rideId,
                              departure_time: departureISO,
                              start_location: startAddress,
                              end_location: endAddress,
                              start_lat: startFinal?.latitude,
                              start_lng: startFinal?.longitude,
                              end_lat: endFinal?.latitude,
                              end_lng: endFinal?.longitude,
                              price_per_seat: pricePerSeat,
                              available_seats: availableSeats,
                            },
                            lastMessage: {
                              content: 'No messages yet',
                              created_at: new Date().toISOString(),
                            },
                            status: (status === 'accepted' ? 'confirmed' : status === 'pending' ? 'pending' : 'cancelled') as 'confirmed' | 'pending' | 'cancelled',
                            userRole: 'rider' as 'rider' | 'driver',
                          };
                          navigation.navigate('Chat', { conversation });
                        }}
                      >
                        <Text style={styles.primaryText}>Message Driver</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },

  mapWrap: { flex: 1 },
  mapFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },

  // floating back button
  back: {
    position: 'absolute',
    top: 44,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },

  // bottom sheet
  sheetWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  handle: {
    alignSelf: 'center',
    width: 72,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    marginTop: 8,
    marginBottom: 8,
  },
  sheetScroll: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  // header/driver
  driverRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  avatarFallback: { backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontWeight: '700', color: '#6B7280' },
  driverName: { fontWeight: '700', color: '#111827' },
  ratingPill: {
    alignSelf: 'flex-start',
    marginTop: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: { fontSize: 12, color: '#111827', fontWeight: '600' },

  routeTitle: { marginTop: 6, fontSize: 16, fontWeight: '700', color: '#111827' },
  arrow: { color: '#6B7280' },
  dateTimeLite: { marginTop: 2, color: '#6B7280', fontSize: 12 },

  itineraryBox: {
    marginTop: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  itineraryTitle: { fontWeight: '700', color: '#111827', marginBottom: 8 },

  itinRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itinLeft: { flexDirection: 'row', alignItems: 'center' },
  bullet: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  itinLabel: { color: '#6B7280', fontWeight: '600' },
  itinTime: { color: '#6B7280' },
  itinAddress: { marginTop: 4, color: '#111827' },

  vertDividerWrap: { alignItems: 'center', marginVertical: 8 },
  vertDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#D1D5DB', marginBottom: 3 },
  vertLine: { width: 2, height: 14, backgroundColor: '#E5E7EB' },

  sectionHeader: { marginTop: 14, fontWeight: '700', color: '#111827' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  priceLabel: { color: '#6B7280' },
  priceValue: { color: '#111827' },

  policyText: { color: '#6B7280', fontSize: 14, lineHeight: 20 },

  cta: {
    marginTop: 16,
    height: 48,
    borderRadius: 10,
    backgroundColor: purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  statusContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },

  rowGap: { flexDirection: 'row', gap: 12, marginTop: 16 },
  secondary: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#FFE4E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: { color: '#DC2626', fontSize: 16, fontWeight: '700' },
  primary: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { color: '#5B21B6', fontSize: 16, fontWeight: '700' },
});