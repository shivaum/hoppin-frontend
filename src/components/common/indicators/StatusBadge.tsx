import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

interface StatusBadgeProps {
  status: string
}

const VARIANTS: Record<
  string,
  { color: string; label: string }
> = {
  pending:    { color: '#d97706', label: 'Pending'      }, // amber-600
  accepted:   { color: '#16a34a', label: 'Accepted'     }, // green-600
  declined:   { color: '#dc2626', label: 'Declined'     }, // red-600
  rejected:   { color: '#dc2626', label: 'Declined'     },
  available:  { color: '#3b82f6', label: 'Available'    }, // blue-500
  full:       { color: '#6b7280', label: 'Full'         }, // gray-500
  scheduled:  { color: '#d97706', label: 'Scheduled'    },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { color, label } = VARIANTS[status] ?? {
    color: '#374151', // gray-700 fallback
    label: status[0]?.toUpperCase() + status.slice(1),
  }

  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
})