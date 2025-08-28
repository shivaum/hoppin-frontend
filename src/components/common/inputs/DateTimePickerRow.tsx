// src/components/OfferRide/DateTimePickerRow.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

type Props = {
  date: Date;
  onDatePress: () => void;
  onTimePress: () => void;
  showDate: boolean;
  showTime: boolean;
  onChangeDate: (_: any, d?: Date) => void;
  onChangeTime: (_: any, d?: Date) => void;
};

export default function DateTimePickerRow({
  date, onDatePress, onTimePress,
  showDate, showTime, onChangeDate, onChangeTime
}: Props) {
  return (
    <View style={styles.row}>
      {/** Date column **/}
      <View style={styles.half}>
        <Text style={styles.label}>Date</Text>
        <TouchableOpacity style={styles.button} onPress={onDatePress}>
          <Text>{date.toLocaleDateString()}</Text>
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
        {showTime && <DateTimePicker value={date} mode="time" display="default" onChange={onChangeTime} />}
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
});