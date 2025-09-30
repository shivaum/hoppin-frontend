// src/screens/OfferRide/components/DateTimeSection.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DateTimePickerRow from '../../../components/common/inputs/DateTimePickerRow';
import CalendarModal from '../../../components/common/modals/CalendarModal';
import { isDateTimeInFuture } from '../utils/validation';

interface DateTimeSectionProps {
  departureDate: Date;
  dateISO: string | null;
  tempDate: Date;
  showCalendar: boolean;
  showTimePicker: boolean;
  onDatePress: () => void;
  onTimePress: () => void;
  onChangeDate: (event: any, date?: Date) => void;
  onChangeTime: (event: any, time?: Date) => void;
  onTimeConfirm: () => void;
  onTimeCancel: () => void;
  onCalendarClose: () => void;
  onCalendarConfirm: (iso: string) => void;
}

export function DateTimeSection({
  departureDate,
  dateISO,
  tempDate,
  showCalendar,
  showTimePicker,
  onDatePress,
  onTimePress,
  onChangeDate,
  onChangeTime,
  onTimeConfirm,
  onTimeCancel,
  onCalendarClose,
  onCalendarConfirm,
}: DateTimeSectionProps) {
  const showWarning = dateISO && !isDateTimeInFuture(departureDate);

  return (
    <>
      <DateTimePickerRow
        date={departureDate}
        onDatePress={onDatePress}
        onTimePress={onTimePress}
        showDate={false}
        showTime={showTimePicker}
        onChangeDate={onChangeDate}
        onChangeTime={onChangeTime}
        tempDate={tempDate}
        onTimeConfirm={onTimeConfirm}
        onTimeCancel={onTimeCancel}
      />

      {/* Date/Time Validation Warning */}
      {showWarning && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            ⚠️ Please select a future date and time to offer your ride.
          </Text>
        </View>
      )}

      {/* Calendar modal */}
      <CalendarModal
        visible={showCalendar}
        initialDate={dateISO || undefined}
        onClose={onCalendarClose}
        onConfirm={onCalendarConfirm}
      />
    </>
  );
}

const styles = StyleSheet.create({
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