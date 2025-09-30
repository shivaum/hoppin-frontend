// src/screens/EditRide/index.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, TextInput } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import type { MainStackParamList } from '../../navigation/types';
import Map from '../../components/common/map/Map';
import UnifiedLocationInput from '../../components/common/inputs/UnifiedLocationInput';
import DateTimePickerRow from '../../components/common/inputs/DateTimePickerRow';
import CalendarModal from '../../components/common/modals/CalendarModal';

// Components
import { RequestsList } from './components/RequestsList';
import { ActionButtons } from './components/ActionButtons';

// Hooks
import { useEditRide } from './hooks/useEditRide';
import { useBottomSheet } from './hooks/useBottomSheet';

type Route = RouteProp<MainStackParamList, 'EditRide'>;
type Nav = NativeStackNavigationProp<MainStackParamList, 'EditRide'>;

export default function EditRide() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const apiKey = Constants.expoConfig?.extra?.googleMapsApiKey as string;

  // Bottom sheet hook
  const { sheetH, pan } = useBottomSheet();

  // Edit ride hook
  const editRide = useEditRide(params);

  // Map coordinates
  const start = useMemo(() => {
    if (params.start_lat && params.start_lng)
      return { latitude: params.start_lat, longitude: params.start_lng };
    return undefined;
  }, [params]);

  const end = useMemo(() => {
    if (params.end_lat && params.end_lng)
      return { latitude: params.end_lat, longitude: params.end_lng };
    return undefined;
  }, [params]);

  const handleSave = async () => {
    const success = await editRide.saveChanges();
    if (success) navigation.goBack();
  };

  return (
    <View style={styles.root}>
      {/* Map */}
      <View style={styles.mapWrap}>
        <Map
          start={start || { latitude: 0, longitude: 0 }}
          end={end || { latitude: 0, longitude: 0 }}
          startAddress={editRide.pickup || params.start_address}
          endAddress={editRide.dropoff || params.end_address}
        />
      </View>

      {/* Back button */}
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} color="#111827" />
      </TouchableOpacity>

      {/* Draggable sheet */}
      <Animated.View style={[styles.sheet, { height: sheetH }]} {...pan.panHandlers}>
        <View style={styles.handle} />
        <ScrollView
          style={styles.sheetContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sheetTitle}>Edit ride</Text>

          <Text style={styles.label}>Pick up</Text>
          <UnifiedLocationInput
            apiKey={apiKey}
            value={editRide.pickup}
            placeholder="Enter pick-up location"
            onChange={editRide.setPickup}
            onSelect={(addr) => editRide.setPickup(addr)}
          />

          <Text style={[styles.label, { marginTop: 12 }]}>Drop off</Text>
          <UnifiedLocationInput
            apiKey={apiKey}
            value={editRide.dropoff}
            placeholder="Enter drop-off location"
            onChange={editRide.setDropoff}
            onSelect={(addr) => editRide.setDropoff(addr)}
          />

          <Text style={[styles.label, { marginTop: 12 }]}>Available seats</Text>
          <View style={styles.fakeInput}>
            <TextInput
              style={styles.textInput}
              value={editRide.availableSeats}
              onChangeText={editRide.setAvailableSeats}
              placeholder="Number of seats"
              keyboardType="numeric"
              maxLength={1}
            />
          </View>

          <Text style={[styles.label, { marginTop: 12 }]}>Price per seat ($)</Text>
          <View style={styles.fakeInput}>
            <TextInput
              style={styles.textInput}
              value={editRide.pricePerSeat}
              onChangeText={editRide.setPricePerSeat}
              placeholder="Price in dollars"
              keyboardType="numeric"
            />
          </View>

          <View style={{ height: 12 }} />

          <DateTimePickerRow
            date={editRide.departureDate}
            onDatePress={() => editRide.setShowCalendar(true)}
            onTimePress={() => {
              editRide.setTempDate(editRide.departureDate);
              editRide.setShowTimePicker(true);
            }}
            showDate={false}
            showTime={editRide.showTimePicker}
            onChangeDate={() => {}}
            onChangeTime={(_, time) => time && editRide.setTempDate(time)}
            tempDate={editRide.tempDate}
            onTimeConfirm={editRide.handleTimeConfirm}
            onTimeCancel={() => {
              editRide.setTempDate(editRide.departureDate);
              editRide.setShowTimePicker(false);
            }}
          />

          {/* Loading/Error states */}
          {editRide.isLoading && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading ride details...</Text>
            </View>
          )}

          {editRide.error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{editRide.error}</Text>
            </View>
          )}

          {/* Validation warning */}
          {!editRide.isDateTimeInFuture() && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>
                ⚠️ Please select a future date and time for your ride.
              </Text>
            </View>
          )}

          {/* Ride requests */}
          {!editRide.isLoading && (
            <RequestsList
              requests={editRide.visibleRequests}
              processingRequests={editRide.processingRequests}
              onAccept={editRide.handleAcceptRequest}
              onDecline={editRide.handleDeclineRequest}
            />
          )}

          {/* Action buttons */}
          <ActionButtons
            hasChanges={editRide.hasFormChanges()}
            isSaving={editRide.isSaving}
            isValid={editRide.isDateTimeInFuture()}
            onCancel={() => navigation.goBack()}
            onSave={handleSave}
          />
        </ScrollView>
      </Animated.View>

      {/* Calendar Modal */}
      <CalendarModal
        visible={editRide.showCalendar}
        initialDate={editRide.departureISO ? editRide.departureISO.split('T')[0] : undefined}
        onClose={() => editRide.setShowCalendar(false)}
        onConfirm={editRide.handleCalendarConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  mapWrap: { flex: 1 },
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
  sheet: {
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
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  handle: {
    alignSelf: 'center',
    width: 72,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  sheetContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  fakeInput: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  textInput: {
    color: '#111827',
    fontSize: 16,
    padding: 0,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 14,
  },
  errorContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    marginVertical: 8,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  warningContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  warningText: {
    color: '#92400E',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});