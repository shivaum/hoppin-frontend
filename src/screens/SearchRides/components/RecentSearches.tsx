// src/screens/SearchRides/components/RecentSearches.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RecentSearchesProps {
  recents: string[];
  onSelectRecent: (value: string) => void;
}

export function RecentSearches({ recents, onSelectRecent }: RecentSearchesProps) {
  if (recents.length === 0) {
    return null;
  }

  return (
    <View style={styles.recentsWrap}>
      <Text style={styles.recentsTitle}>Recents</Text>
      {recents.slice(0, 4).map((r) => (
        <TouchableOpacity key={r} style={styles.recentRow} onPress={() => onSelectRecent(r)}>
          <Ionicons name="time-outline" size={18} color="#6B7280" style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={styles.recentTitle}>
              {r || ''}
            </Text>
            <Text style={styles.recentSub}>Saved place</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  recentsWrap: {
    marginTop: 6,
  },
  recentsTitle: {
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  recentTitle: {
    color: '#111827',
    fontWeight: '600',
  },
  recentSub: {
    color: '#9CA3AF',
    fontSize: 12,
  },
});