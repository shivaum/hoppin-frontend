import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

// Simple SVG-like illustrations using React Native components
export const FindRidesIllustration = () => (
  <View style={styles.container}>
    {/* Car body */}
    <View style={[styles.car, { backgroundColor: colors.secondary.yellow }]}>
      {/* Car windows */}
      <View style={styles.window} />
      <View style={[styles.window, { right: 20 }]} />
      {/* Car wheels */}
      <View style={[styles.wheel, { left: 10, bottom: -10 }]} />
      <View style={[styles.wheel, { right: 10, bottom: -10 }]} />
    </View>
    
    {/* Route line */}
    <View style={styles.routeLine} />
    
    {/* Location pins */}
    <View style={[styles.pin, { top: 20, left: 50, backgroundColor: colors.secondary.yellow }]} />
    <View style={[styles.pin, { top: 20, right: 50, backgroundColor: colors.secondary.yellow }]} />
    <View style={[styles.pin, { bottom: 20, right: 30, backgroundColor: colors.secondary.yellow }]} />
    
    {/* Person figure */}
    <View style={[styles.person, { left: 20, bottom: 40 }]}>
      <View style={styles.personHead} />
      <View style={styles.personBody} />
    </View>
  </View>
);

export const OfferRidesIllustration = () => (
  <View style={styles.container}>
    {/* Phone/map interface */}
    <View style={styles.phone}>
      <View style={styles.phoneScreen}>
        {/* Map elements */}
        <View style={styles.mapElement} />
        <View style={[styles.mapElement, { top: 40, left: 60 }]} />
        <View style={[styles.mapElement, { bottom: 30, right: 20 }]} />
      </View>
    </View>
    
    {/* Car */}
    <View style={[styles.smallCar, { bottom: 20, right: 30 }]}>
      <View style={styles.smallWheel} />
      <View style={[styles.smallWheel, { right: 0 }]} />
    </View>
  </View>
);

export const SafetyFirstIllustration = () => (
  <View style={styles.container}>
    {/* Shield/safety icon */}
    <View style={styles.shield}>
      <View style={styles.checkmark} />
    </View>
    
    {/* Person figures */}
    <View style={[styles.person, { left: 40, bottom: 50 }]}>
      <View style={styles.personHead} />
      <View style={styles.personBody} />
    </View>
    <View style={[styles.person, { right: 40, bottom: 50 }]}>
      <View style={styles.personHead} />
      <View style={styles.personBody} />
    </View>
    
    {/* Stars for rating */}
    <View style={[styles.star, { top: 40, left: 60 }]} />
    <View style={[styles.star, { top: 60, right: 70 }]} />
    <View style={[styles.star, { bottom: 80, left: 80 }]} />
  </View>
);

export const ReadyIllustration = () => (
  <View style={styles.container}>
    {/* Phone */}
    <View style={[styles.phone, { transform: [{ rotate: '15deg' }] }]}>
      <View style={styles.phoneScreen}>
        <View style={styles.appInterface} />
      </View>
    </View>
    
    {/* Car */}
    <View style={[styles.car, { backgroundColor: colors.secondary.yellow, bottom: 30 }]}>
      <View style={[styles.wheel, { left: 10, bottom: -10 }]} />
      <View style={[styles.wheel, { right: 10, bottom: -10 }]} />
    </View>
    
    {/* Buildings/cityscape */}
    <View style={styles.cityscape}>
      <View style={[styles.building, { height: 60, left: 0 }]} />
      <View style={[styles.building, { height: 80, left: 25 }]} />
      <View style={[styles.building, { height: 50, left: 50 }]} />
      <View style={[styles.building, { height: 70, right: 50 }]} />
      <View style={[styles.building, { height: 90, right: 25 }]} />
      <View style={[styles.building, { height: 40, right: 0 }]} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 200,
    position: 'relative',
  },
  car: {
    width: 100,
    height: 50,
    borderRadius: 25,
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -25 }],
  },
  window: {
    position: 'absolute',
    width: 20,
    height: 15,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 8,
    top: 8,
    left: 20,
  },
  wheel: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: colors.neutral.gray800,
    borderRadius: 10,
  },
  routeLine: {
    position: 'absolute',
    width: 2,
    height: 120,
    backgroundColor: colors.secondary.yellow,
    left: '50%',
    top: 20,
    transform: [{ translateX: -1 }],
  },
  pin: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  person: {
    position: 'absolute',
  },
  personHead: {
    width: 16,
    height: 16,
    backgroundColor: colors.secondary.yellow,
    borderRadius: 8,
    marginBottom: 4,
  },
  personBody: {
    width: 20,
    height: 24,
    backgroundColor: colors.secondary.yellow,
    borderRadius: 10,
  },
  phone: {
    width: 80,
    height: 120,
    backgroundColor: colors.neutral.gray800,
    borderRadius: 12,
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -40 }, { translateY: -60 }],
    padding: 4,
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: colors.neutral.gray300,
    borderRadius: 8,
    position: 'relative',
  },
  mapElement: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: colors.secondary.yellow,
    borderRadius: 4,
    top: 20,
    left: 20,
  },
  smallCar: {
    position: 'absolute',
    width: 40,
    height: 20,
    backgroundColor: colors.secondary.yellow,
    borderRadius: 10,
  },
  smallWheel: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: colors.neutral.gray800,
    borderRadius: 4,
    bottom: -4,
    left: 6,
  },
  shield: {
    position: 'absolute',
    width: 60,
    height: 70,
    backgroundColor: colors.primary.purple,
    borderRadius: 30,
    top: '50%',
    left: '50%',
    transform: [{ translateX: -30 }, { translateY: -35 }],
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    width: 20,
    height: 20,
    backgroundColor: colors.text.primary,
    borderRadius: 10,
  },
  star: {
    position: 'absolute',
    width: 12,
    height: 12,
    backgroundColor: colors.secondary.yellow,
    borderRadius: 6,
  },
  appInterface: {
    margin: 8,
    height: 20,
    backgroundColor: colors.primary.purple,
    borderRadius: 4,
  },
  cityscape: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 100,
  },
  building: {
    position: 'absolute',
    width: 20,
    backgroundColor: colors.neutral.gray600,
    bottom: 0,
    borderRadius: 2,
  },
});