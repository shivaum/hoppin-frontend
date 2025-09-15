// src/components/OfferRide/DateTimePickerRow.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

type Props = {
  date: Date;
  onDatePress: () => void;
  onTimePress: () => void;
  showDate: boolean;
  showTime: boolean;
  onChangeDate: (_: any, d?: Date) => void;
  onChangeTime: (_: any, d?: Date) => void;
  tempDate?: Date;
  onTimeConfirm?: () => void;
  onTimeCancel?: () => void;
};

export default function DateTimePickerRow({
  date, onDatePress, onTimePress,
  showDate, showTime, onChangeDate, onChangeTime,
  tempDate, onTimeConfirm, onTimeCancel
}: Props) {
  return (
    <View style={styles.row}>
      {/** Date column **/}
      <View style={styles.half}>
        <Text style={styles.label}>Date</Text>
        <TouchableOpacity style={styles.button} onPress={onDatePress}>
          <Text>{date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
        </TouchableOpacity>
        {showDate && <DateTimePicker value={date} mode="date" display="default" onChange={onChangeDate} />}
      </View>

      {/** Time column **/}
      <View style={styles.half}>
        <Text style={styles.label}>Time</Text>
        <TouchableOpacity style={styles.button} onPress={onTimePress}>
          <Text>
            {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>
        {showTime && (
          Platform.OS === 'ios' ? (
            <Modal visible={showTime} transparent animationType="slide">
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={onTimeCancel} style={styles.modalButton}>
                      <Text style={styles.modalButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Select Time</Text>
                    <TouchableOpacity onPress={onTimeConfirm} style={styles.modalButton}>
                      <Text style={[styles.modalButtonText, styles.confirmText]}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker 
                    value={tempDate || date} 
                    mode="time" 
                    display="spinner" 
                    onChange={onChangeTime} 
                    style={styles.picker}
                  />
                </View>
              </View>
            </Modal>
          ) : (
            <DateTimePicker 
              value={tempDate || date} 
              mode="time" 
              display="default" 
              onChange={(event, selectedTime) => {
                onChangeTime(event, selectedTime);
                if (event.type === 'set' && onTimeConfirm) {
                  onTimeConfirm();
                } else if (event.type === 'dismissed' && onTimeCancel) {
                  onTimeCancel();
                }
              }} 
            />
          )
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  half: { flex: 1, marginRight: 8 },
  label: { marginBottom: 4, fontWeight: '500' },
  button: {
    borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 6,
    padding: 12, backgroundColor: '#F9FAFB', justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 34, // Space for iOS home indicator
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modalButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
  confirmText: {
    color: '#7C3AED',
    fontWeight: '600',
  },
  picker: {
    height: 200,
  },
});