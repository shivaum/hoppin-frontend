import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../../constants/colors';

interface ProfileStatsProps {
  totalRides: number;
  asDriver: number;
  asRider: number;
  isCurrentUser?: boolean;
}

export default function ProfileStats({ 
  totalRides, 
  asDriver, 
  asRider, 
  isCurrentUser = false 
}: ProfileStatsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Ride Stats</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <View style={styles.statCircle}>
            <Text style={styles.statNumber}>{totalRides}</Text>
          </View>
          <Text style={styles.statLabel}>Total rides</Text>
        </View>
        
        <View style={styles.statItem}>
          <View style={styles.statCircle}>
            <Text style={styles.statNumber}>{asDriver}</Text>
          </View>
          <Text style={styles.statLabel}>As driver</Text>
        </View>
        
        <View style={styles.statItem}>
          <View style={styles.statCircle}>
            <Text style={styles.statNumber}>{asRider}</Text>
          </View>
          <Text style={styles.statLabel}>As rider</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: colors.neutral.white,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.gray700,
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary.purple,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.neutral.white,
  },
  statLabel: {
    fontSize: 12,
    color: colors.neutral.gray600,
    textAlign: 'center',
  },
});