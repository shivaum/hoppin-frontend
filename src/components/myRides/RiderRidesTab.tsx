import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { RideRequestItem } from '../../types'
import { formatDepartureTime } from './utils'
import { StatusBadge } from './StatusBadge'
import { useNavigation } from '@react-navigation/native'
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import type { TabParamList } from '../../navigation/types'

type Props = {
  rideRequests: RideRequestItem[]
}

export default function RiderRidesTab({ rideRequests }: Props) {
  const navigation =
    useNavigation<BottomTabNavigationProp<TabParamList, 'Find Ride'>>()

  if (rideRequests.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="person-outline" size={48} color="#9CA3AF" />
        <Text style={styles.emptyTitle}>No ride requests yet</Text>
        <Text style={styles.emptySubtitle}>
          Search for rides to get around with fellow students.
        </Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => navigation.navigate('Find Ride')}
        >
          <Text style={styles.emptyButtonText}>Find a Ride</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.listContainer}>
      {rideRequests.map((b) => {
        const { date, time } = formatDepartureTime(b.departure_time)
        return (
          <View key={b.request_id} style={styles.card}>
            {/* Header */}
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Your Request</Text>
              <StatusBadge status={b.status} />
            </View>

            {/* Route */}
            <View style={styles.routeContainer}>
              <View style={styles.routeRow}>
                <View style={[styles.dot, { backgroundColor: '#3b82f6' }]} />
                <Text style={styles.routeText}>{b.start_location}</Text>
              </View>
              <View style={styles.routeLine} />
              <View style={styles.routeRow}>
                <View style={[styles.dot, { backgroundColor: '#ef4444' }]} />
                <Text style={styles.routeText}>{b.end_location}</Text>
              </View>
            </View>

            {/* Details */}
            <View style={styles.detailsRow}>
              <Ionicons name="time-outline" size={16} color="#6B7280" />
              <Text style={styles.detailsText}>
                {date} at {time}
              </Text>
            </View>

            {/* Pickup/Dropoff */}
            {b.pickup && (
              <Text style={styles.extraText}>
                <Text style={styles.extraLabel}>Pickup: </Text>
                {b.pickup.location}
              </Text>
            )}
            {b.dropoff && (
              <Text style={styles.extraText}>
                <Text style={styles.extraLabel}>Dropoff: </Text>
                {b.dropoff.location}
              </Text>
            )}

            {/* Message button */}
            {b.status === 'accepted' && (
              <TouchableOpacity style={styles.messageButton}>
                <Ionicons name="chatbubble-outline" size={16} color="#3b82f6" />
                <Text style={styles.messageButtonText}>Message Driver</Text>
              </TouchableOpacity>
            )}
          </View>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 12,
    color: '#111827',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginVertical: 8,
  },
  emptyButton: {
    marginTop: 12,
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  routeContainer: {
    marginBottom: 12,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  routeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  routeLine: {
    height: 24,
    width: 1,
    backgroundColor: '#E5E7EB',
    marginLeft: 3.5,
    marginVertical: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailsText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6B7280',
  },
  extraText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  extraLabel: {
    fontWeight: '600',
  },
  messageButton: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 6,
  },
  messageButtonText: {
    marginLeft: 6,
    color: '#3b82f6',
    fontWeight: '500',
  },
})