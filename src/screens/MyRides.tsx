import React, { useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { useAuth } from '../contexts/AuthContext'
import { getMyDriverRides, acceptRideRequest, declineRideRequest } from '../integrations/hopin-backend/driver'
import { getMyRideRequests } from '../integrations/hopin-backend/rider'
import DriverRidesTab from '../components/myRides/DriverRidesTab'
import RiderRidesTab from '../components/myRides/RiderRidesTab'
import Toast from "react-native-toast-message";
import type { DriverRide, RideRequestItem } from '../types'

type Tab = 'driver' | 'rider'

export default function MyRides() {
  const { user } = useAuth()
  const isDriver = !!user?.is_driver

  const [activeTab, setActiveTab] = useState<Tab>(isDriver ? 'driver' : 'rider')
  const [driverRides, setDriverRides] = useState<DriverRide[]>([])
  const [riderBookings, setRiderBookings] = useState<RideRequestItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setActiveTab(isDriver ? 'driver' : 'rider')
  }, [isDriver])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      try {
        const [driverData, riderData] = await Promise.all([
          isDriver ? getMyDriverRides() : Promise.resolve([]),
          getMyRideRequests(),
        ])
        if (!mounted) return
        setDriverRides(driverData)
        setRiderBookings(riderData)
      } catch (err: any) {
        console.error(err)
        Toast.show({
          type: 'error',
          text1: 'Error Loading Rides',
          text2: 'Could not fetch your rides or bookings.',
        })
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [isDriver])

  const handleRequestAction = async (
    requestId: string,
    action: 'accepted' | 'declined'
  ) => {
    try {
      if (action === 'accepted') {
        await acceptRideRequest(requestId)
      } else {
        await declineRideRequest(requestId)
      }
      setDriverRides((prev) =>
        prev.map((ride) => ({
          ...ride,
          requests: ride.requests.map((r) =>
            r.id === requestId ? { ...r, status: action } : r
          ),
        }))
      )
      Toast.show({
        type: 'success',
        text1: `Request ${action}`,
        text2: `You have ${action} this request.`,
      })
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: `Couldn't ${action} the request.`,
      })
    }
  }

  const orderedDriverRides = useMemo(
    () =>
      [...driverRides].sort(
        (a, b) =>
          new Date(a.departure_time).getTime() -
          new Date(b.departure_time).getTime()
      ),
    [driverRides]
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading your rides…</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerIcon}>🚗</Text>
        <Text style={styles.headerTitle}>My Rides</Text>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabs}>
        {isDriver && (
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'driver' && styles.tabActive,
            ]}
            onPress={() => setActiveTab('driver')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'driver' && styles.tabTextActive,
              ]}
            >
              As Driver
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'rider' && styles.tabActive,
          ]}
          onPress={() => setActiveTab('rider')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'rider' && styles.tabTextActive,
            ]}
          >
            As Rider
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'driver' && isDriver ? (
        <DriverRidesTab
          driverRides={orderedDriverRides}
          onAction={handleRequestAction}
        />
      ) : (
        <RiderRidesTab rideRequests={riderBookings} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { marginTop: 8, color: '#6B7280' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  headerIcon: { fontSize: 24, marginRight: 8 },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderColor: '#3b82f6',
  },
  tabText: { color: '#6B7280', fontSize: 16 },
  tabTextActive: { color: '#111827', fontWeight: '600' },
})