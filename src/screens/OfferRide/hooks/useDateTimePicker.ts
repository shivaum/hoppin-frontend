// src/screens/OfferRide/hooks/useDateTimePicker.ts
import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { getNextHour, formatDateToISO } from '../utils/validation';

interface UseDateTimePickerReturn {
  departureDate: Date;
  dateISO: string | null;
  tempDate: Date;
  showCalendar: boolean;
  showDatePicker: boolean;
  showTimePicker: boolean;
  setShowCalendar: (show: boolean) => void;
  setShowDatePicker: (show: boolean) => void;
  setShowTimePicker: (show: boolean) => void;
  handleDateChange: (event: any, selectedDate?: Date) => void;
  handleTimeChange: (event: any, selectedTime?: Date) => void;
  handleTimeConfirm: () => void;
  handleTimeCancel: () => void;
  handleCalendarConfirm: (iso: string) => void;
  openTimePicker: () => void;
}

/**
 * Custom hook for managing date/time picker state and logic
 */
export function useDateTimePicker(): UseDateTimePickerReturn {
  const [departureDate, setDepartureDate] = useState<Date>(getNextHour());
  const [dateISO, setDateISO] = useState<string | null>(null);
  const [tempDate, setTempDate] = useState<Date>(getNextHour());

  const [showCalendar, setShowCalendar] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Reset to next hour
  const resetToCurrentTime = useCallback(() => {
    const nextHour = getNextHour();
    setDepartureDate(nextHour);
    setTempDate(nextHour);
    setDateISO(formatDateToISO(nextHour));
  }, []);

  // Date picker change handler
  const handleDateChange = useCallback(
    (_: any, selectedDate?: Date) => {
      setShowDatePicker(false);
      if (selectedDate) {
        const newDate = new Date(departureDate);
        newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
        setDepartureDate(newDate);
        setTempDate(newDate);
        setDateISO(formatDateToISO(newDate));
      }
    },
    [departureDate]
  );

  // Time picker change handler (updates temp only)
  const handleTimeChange = useCallback((_: any, selectedTime?: Date) => {
    if (selectedTime) {
      setTempDate(selectedTime);
    }
  }, []);

  // Time picker confirm
  const handleTimeConfirm = useCallback(() => {
    const now = new Date();
    if (tempDate <= now) {
      Alert.alert('Invalid Time', 'Please select a time in the future.', [
        {
          text: 'OK',
          onPress: resetToCurrentTime,
        },
      ]);
      setShowTimePicker(false);
      return;
    }

    const newDate = new Date(departureDate);
    newDate.setHours(tempDate.getHours(), tempDate.getMinutes(), 0, 0);
    setDepartureDate(newDate);
    setShowTimePicker(false);
  }, [tempDate, departureDate, resetToCurrentTime]);

  // Time picker cancel
  const handleTimeCancel = useCallback(() => {
    setTempDate(departureDate);
    setShowTimePicker(false);
  }, [departureDate]);

  // Calendar confirm
  const handleCalendarConfirm = useCallback(
    (iso: string) => {
      setDateISO(iso);
      const [y, m, d] = iso.split('-').map(Number);
      const newDate = new Date(departureDate);
      newDate.setFullYear(y, m - 1, d);
      setDepartureDate(newDate);
      setShowCalendar(false);
    },
    [departureDate]
  );

  // Open time picker with temp date set
  const openTimePicker = useCallback(() => {
    setTempDate(departureDate);
    setShowTimePicker(true);
  }, [departureDate]);

  return {
    departureDate,
    dateISO,
    tempDate,
    showCalendar,
    showDatePicker,
    showTimePicker,
    setShowCalendar,
    setShowDatePicker,
    setShowTimePicker,
    handleDateChange,
    handleTimeChange,
    handleTimeConfirm,
    handleTimeCancel,
    handleCalendarConfirm,
    openTimePicker,
  };
}