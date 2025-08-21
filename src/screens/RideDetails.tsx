import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../navigation/types';
import Map from '../components/map/Map';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { requestRide } from '../integrations/hopin-backend/rider';
import { declineRideRequest } from '../integrations/hopin-backend/driver';
import type { LatLng } from 'react-native-maps';

type Route = RouteProp<MainStackParamList, 'RideDetails'>;
type Nav = NativeStackNavigationProp<MainStackParamList, 'RideDetails'>;

// Normalize various coordinate shapes to { latitude, longitude }
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

export default function RideDetails() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const [loading, setLoading] = useState(false);

  // Departure time (support camelCase and snake_case)
  const departureISO =
    (params as any).departureISO ?? (params as any).departure_time;

  const { dateLabel, timeLabel } = useMemo(() => {
    const d = new Date(departureISO);
    return {
      dateLabel: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      timeLabel: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }, [departureISO]);

  // Coords (accept embedded objects or flat lat/lng fields)
  const start = useMemo(() => {
    const p: any = params;
    return toLatLng(p.start, p.start_lat, p.start_lng);
  }, [params]);

  const end = useMemo(() => {
    const p: any = params;
    return toLatLng(p.end, p.end_lat, p.end_lng);
  }, [params]);

  const hasCoords =
    !!start &&
    !!end &&
    Number.isFinite(start.latitude) &&
    Number.isFinite(start.longitude) &&
    Number.isFinite(end.latitude) &&
    Number.isFinite(end.longitude);

  // Role/Status/Meta (support both naming styles)
  const role: 'search' | 'rider' | 'driver' =
    (params as any).role ?? (params as any).mode ?? 'rider';

  const status: string =
    (params as any).status ?? (params as any).ride_status ?? 'available';

  const availableSeats: number =
    (params as any).availableSeats ?? (params as any).available_seats ?? 0;

  const pricePerSeat: number | undefined =
    (params as any).pricePerSeat ?? (params as any).price_per_seat;

  const driverName: string =
    (params as any).driverName ?? (params as any).driver_name ?? 'Driver';

  const startAddress: string =
    (params as any).start?.address ??
    (params as any).start_address ??
    (params as any).start_location ??
    '';

  const endAddress: string =
    (params as any).end?.address ??
    (params as any).end_address ??
    (params as any).end_location ??
    '';

  const rideId: string = (params as any).rideId ?? (params as any).ride_id;
  const requestId: string | undefined =
    (params as any).requestId ?? (params as any).request_id;

  // Permissions
  const canRequest = role === 'search' && status === 'available' && availableSeats > 0;
  const canCancel  = role === 'rider' && (status === 'pending' || status === 'accepted');
  const canContact = role === 'rider' && status === 'accepted';

  // Actions
  const handleRequest = async () => {
    try {
      setLoading(true);
      await requestRide({
        ride_id: rideId,
        message: 'Hey! Can I hoppin your ride?',
      });
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
      // Using "decline" as a cancel for now; replace with an explicit cancel endpoint if you add one
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
    // Wire up to your conversation/thread screen later
    Toast.show({ type: 'info', text1: 'Open chat', text2: 'Route to your messages screen.' });
  };

  return (
    <View style={styles.root}>
      {/* Map */}
      {hasCoords ? (
        <Map start={start!} end={end!} />
      ) : (
        <View style={styles.mapFallback}>
          <Text style={{ color: '#6B7280' }}>No map coordinates</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.sheet}>
        {/* Header row */}
        <View style={styles.rowBetween}>
          <Text style={styles.title}>{driverName}</Text>

          {/* Chips on the right */}
          <View style={styles.chips}>
            {typeof pricePerSeat === 'number' && (
              <View style={styles.chip}>
                <Text style={styles.chipMain}>${pricePerSeat}</Text>
                <Text style={styles.chipSub}>per seat</Text>
              </View>
            )}
            <View style={styles.chip}>
              <Text style={styles.chipMain}>{availableSeats}</Text>
              <Text style={styles.chipSub}>spots</Text>
            </View>
          </View>
        </View>

        {/* Date/time */}
        <Text style={styles.datetime}>{dateLabel}, {timeLabel}</Text>

        {/* Route */}
        <View style={styles.routeBlock}>
          <View style={styles.routeRow}>
            <View style={[styles.dot, { backgroundColor: '#111827' }]} />
            <View style={styles.routeTextWrap}>
              <Text style={styles.routeLabel}>From</Text>
              <Text style={styles.routeValue}>{startAddress}</Text>
            </View>
          </View>

          <View style={styles.routeDivider}>
            <View style={styles.routeDividerDot} />
            <View style={styles.routeDividerLine} />
          </View>

          <View style={styles.routeRow}>
            <Ionicons name="location" size={16} color="#6B7280" />
            <View style={styles.routeTextWrap}>
              <Text style={styles.routeLabel}>To</Text>
              <Text style={styles.routeValue}>{endAddress}</Text>
            </View>
          </View>
        </View>

        {/* Footer actions */}
        {role === 'search' && (
          <TouchableOpacity
            style={[styles.cta, (loading || !canRequest) && { opacity: 0.6 }]}
            onPress={handleRequest}
            disabled={loading || !canRequest}
          >
            <Text style={styles.ctaText}>{loading ? 'Requesting…' : 'Request'}</Text>
          </TouchableOpacity>
        )}

        {role === 'rider' && (
          <View style={styles.rowGap}>
            <TouchableOpacity
              style={[styles.secondary, (loading || !canCancel) && { opacity: 0.6 }]}
              onPress={handleCancel}
              disabled={loading || !canCancel}
            >
              <Text style={styles.secondaryText}>Cancel ride</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primary, (loading || !canContact) && { opacity: 0.6 }]}
              onPress={handleContact}
              disabled={loading || !canContact}
            >
              <Text style={styles.primaryText}>Contact</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Back button in header area */}
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={28} color="#6B7280" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  mapFallback: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  sheet: { padding: 16, paddingBottom: 32, backgroundColor: '#fff' },

  back: {
    position: 'absolute',
    top: 50,
    left: 12,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
  },

  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 12 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', flexShrink: 1, paddingRight: 12 },

  chips: { gap: 10 },
  chip: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 92,
  },
  chipMain: { fontSize: 18, fontWeight: '700', color: '#111827' },
  chipSub: { fontSize: 12, color: '#6B7280' },

  datetime: { marginTop: 8, fontSize: 16, fontWeight: '600', color: '#111827' },

  routeBlock: { marginTop: 16, gap: 12 },
  routeRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  routeTextWrap: { marginLeft: 4, flexShrink: 1 },
  routeLabel: { fontSize: 12, color: '#6B7280' },
  routeValue: { fontSize: 16, color: '#111827', marginTop: 2 },

  routeDivider: { marginLeft: 3, height: 18, alignItems: 'center' },
  routeDividerDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#9CA3AF', marginBottom: 2 },
  routeDividerLine: { width: 2, flex: 1, backgroundColor: '#E5E7EB' },

  rowGap: { flexDirection: 'row', gap: 12, marginTop: 24 },
  secondary: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#FFE4E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: { color: '#DC2626', fontSize: 16, fontWeight: '700' },

  primary: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { color: '#5B21B6', fontSize: 16, fontWeight: '700' },

  cta: {
    marginTop: 24,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});