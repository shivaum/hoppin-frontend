// src/screens/EditRide/components/RequestsList.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { DriverRideRequest } from '../../../types';
import { formatTimestamp, getRelevantTimestamp, getTimestampLabel } from '../utils/formatting';

interface RequestsListProps {
  requests: DriverRideRequest[];
  processingRequests: Set<string>;
  onAccept: (requestId: string) => void;
  onDecline: (requestId: string) => void;
}

export function RequestsList({
  requests,
  processingRequests,
  onAccept,
  onDecline,
}: RequestsListProps) {
  if (requests.length === 0) {
    return null;
  }

  return (
    <View style={styles.requestsSection}>
      <Text style={styles.label}>Ride Requests</Text>
      {requests.map((r) => {
        const isPending = r.status === 'pending' || !r.status;
        const isProcessing = processingRequests.has(r.id);

        return (
          <View key={r.id} style={styles.riderRow}>
            {r.rider.photo ? (
              <Image source={{ uri: r.rider.photo }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>
                  {r.rider.name.charAt(0)}
                </Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.riderName}>{r.rider.name}</Text>
              <View style={styles.statusRow}>
                {typeof r.rider.rating === 'number' && (
                  <Text style={styles.riderSub}>⭐ {r.rider.rating.toFixed(2)}</Text>
                )}
                <Text
                  style={[
                    styles.statusBadge,
                    r.status === 'accepted'
                      ? styles.acceptedBadge
                      : r.status === 'rejected'
                      ? styles.rejectedBadge
                      : styles.pendingBadge,
                  ]}
                >
                  {r.status === 'accepted'
                    ? 'Confirmed'
                    : r.status === 'rejected'
                    ? 'Rejected'
                    : 'Pending'}
                </Text>
              </View>
              <Text style={styles.timestampText}>
                {getTimestampLabel(r.status)}: {formatTimestamp(getRelevantTimestamp(r))}
              </Text>
            </View>
            {isPending && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.acceptBtn]}
                  onPress={() => onAccept(r.id)}
                  disabled={isProcessing}
                >
                  <Ionicons
                    name={isProcessing ? 'time-outline' : 'checkmark'}
                    size={16}
                    color="#fff"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.declineBtn]}
                  onPress={() => onDecline(r.id)}
                  disabled={isProcessing}
                >
                  <Ionicons
                    name={isProcessing ? 'time-outline' : 'close'}
                    size={16}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  requestsSection: {
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 6,
  },
  riderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  avatarFallback: {
    backgroundColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  riderName: {
    fontWeight: '700',
    color: '#111827',
    fontSize: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  riderSub: {
    color: '#6B7280',
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    fontSize: 11,
    fontWeight: '600',
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  },
  acceptedBadge: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
  },
  rejectedBadge: {
    backgroundColor: '#FEE2E2',
    color: '#B91C1C',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptBtn: {
    backgroundColor: '#10B981',
  },
  declineBtn: {
    backgroundColor: '#EF4444',
  },
  timestampText: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 2,
  },
});