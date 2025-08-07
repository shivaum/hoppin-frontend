// src/components/myRides/DriverRidesTab.tsx
import React from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { DriverRide } from '../../types'
import { formatDepartureTime } from './utils'
import { StatusBadge } from './StatusBadge'
import { useNavigation } from '@react-navigation/native'
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import type { TabParamList } from '../../navigation/types'

type Props = {
  driverRides: DriverRide[]
  onAction: (requestId: string, action: 'accepted' | 'declined') => void
}

export default function DriverRidesTab({ driverRides, onAction }: Props) {
  const navigation =
    useNavigation<BottomTabNavigationProp<TabParamList, 'Offer Ride'>>()

  // Empty state
  if (driverRides.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="car-outline" size={48} color="#9CA3AF" />
        <Text style={styles.emptyTitle}>No rides offered yet</Text>
        <Text style={styles.emptySubtitle}>
          Start offering rides to help fellow students.
        </Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => navigation.navigate('Offer Ride')}
        >
          <Text style={styles.emptyButtonText}>Offer a Ride</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.listContainer}>
      {driverRides.map((ride) => {
        const { date, time } = formatDepartureTime(ride.departure_time)
        return (
          <View key={ride.id} style={styles.card}>
            {/* Header */}
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Your Ride Offer</Text>
              <StatusBadge status={ride.status} />
            </View>

            {/* Route */}
            <View style={styles.routeContainer}>
              <View style={styles.routeRow}>
                <View style={[styles.dot, { backgroundColor: '#3b82f6' }]} />
                <Text style={styles.routeText}>{ride.start_location}</Text>
              </View>
              <View style={styles.routeLine} />
              <View style={styles.routeRow}>
                <View style={[styles.dot, { backgroundColor: '#ef4444' }]} />
                <Text style={styles.routeText}>{ride.end_location}</Text>
              </View>
            </View>

            {/* Details */}
            <View style={styles.detailsRow}>
              <Ionicons name="time-outline" size={16} color="#6B7280" />
              <Text style={styles.detailsText}>
                {date} at {time}
              </Text>
              <Ionicons
                name="people-outline"
                size={16}
                color="#6B7280"
                style={{ marginLeft: 16 }}
              />
              <Text style={styles.detailsText}>
                {ride.available_seats} seats • ${ride.price_per_seat}/seat
              </Text>
            </View>

            {/* Requests */}
            {ride.requests.length > 0 && (
              <View style={styles.requestsSection}>
                <View style={styles.requestsHeader}>
                  <Ionicons name="alert-circle-outline" size={16} color="#6B7280" />
                  <Text style={styles.requestsTitle}>
                    Ride Requests ({ride.requests.length})
                  </Text>
                </View>
                {ride.requests.map((r) => (
                  <View key={r.id} style={styles.requestCard}>
                    {/* Rider Info */}
                    <View style={styles.requestHeader}>
                      <View style={styles.requestUser}>
                        {r.rider.photo ? (
                          <Image
                            source={{ uri: r.rider.photo }}
                            style={styles.avatarImage}
                          />
                        ) : (
                          <View style={styles.avatarFallback}>
                            <Text style={styles.avatarFallbackText}>
                              {r.rider.name.charAt(0)}
                            </Text>
                          </View>
                        )}
                        <View>
                          <Text style={styles.requesterName}>{r.rider.name}</Text>
                          <Text style={styles.requesterInfo}>
                            ⭐ {r.rider.rating ? r.rider.rating.toFixed(1) : 'N/A'} ({r.rider.total_rides ?? 0} rides)
                          </Text>
                        </View>
                      </View>
                      <StatusBadge status={r.status} />
                    </View>

                    {/* Message */}
                    {r.message ? (
                      <View style={styles.messageContainer}>
                        <Text style={styles.messageText}>“{r.message}”</Text>
                      </View>
                    ) : null}

                    {/* Actions */}
                    {r.status === 'pending' ? (
                      <View style={styles.actionRow}>
                        <TouchableOpacity
                          style={styles.acceptButton}
                          onPress={() => onAction(r.id, 'accepted')}
                        >
                          <Ionicons
                            name="checkmark-circle-outline"
                            size={16}
                            color="#10B981"
                          />
                          <Text style={styles.acceptText}>Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.declineButton}
                          onPress={() => onAction(r.id, 'declined')}
                        >
                          <Ionicons
                            name="close-circle-outline"
                            size={16}
                            color="#EF4444"
                          />
                          <Text style={styles.declineText}>Decline</Text>
                        </TouchableOpacity>
                      </View>
                    ) : r.status === 'accepted' ? (
                      <TouchableOpacity style={styles.messageButton}>
                        <Ionicons name="chatbubble-outline" size={16} color="#3b82f6" />
                        <Text style={styles.messageButtonText}>Message Rider</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                ))}
              </View>
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
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  detailsText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6B7280',
  },
  requestsSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  requestsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestsTitle: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  requestCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  avatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarFallbackText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  requesterName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  requesterInfo: {
    fontSize: 12,
    color: '#6B7280',
  },
  messageContainer: {
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 8,
    marginTop: 8,
  },
  messageText: {
    fontStyle: 'italic',
    color: '#374151',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
    justifyContent: 'center',
  },
  acceptText: {
    marginLeft: 6,
    color: '#047857',
    fontWeight: '500',
  },
  declineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 8,
    borderRadius: 6,
    justifyContent: 'center',
  },
  declineText: {
    marginLeft: 6,
    color: '#B91C1C',
    fontWeight: '500',
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