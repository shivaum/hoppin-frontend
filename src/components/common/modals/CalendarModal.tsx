import React, { useMemo, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions, ScrollView } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (isoDate: string) => void; // 'YYYY-MM-DD'
  initialDate?: string;
};

export default function CalendarModal({ visible, onClose, onConfirm, initialDate }: Props) {
  const today = useMemo(() => new Date(), []);
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  const [selected, setSelected] = useState<string>(initialDate || todayStr);

  const marked = useMemo(
    () => ({
      [selected]: { selected: true, disableTouchEvent: true },
      [todayStr]: { marked: true, dotColor: '#8B5CF6' },
    }),
    [selected, todayStr]
  );

  const handleDayPress = (d: DateData) => setSelected(d.dateString);

  const headerLabel = useMemo(() => {
    // Parse 'YYYY-MM-DD' as a local date (avoid UTC parsing that shifts a day)
    const [y, m, d] = selected.split('-').map(Number);
    const localDate = new Date(y, m - 1, d);
    return localDate.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }, [selected]);

  const SHEET_MAX_H = Math.round(Dimensions.get('window').height * 0.8);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { maxHeight: SHEET_MAX_H }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{headerLabel}</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Scroll area (leave space for the fixed footer) */}
          <ScrollView contentContainerStyle={{ paddingBottom: 92 }}>
            <Calendar
              onDayPress={handleDayPress}
              markedDates={marked}
              initialDate={selected}
              minDate={todayStr}
              theme={{
                todayTextColor: '#8B5CF6',
                selectedDayBackgroundColor: '#8B5CF6',
                selectedDayTextColor: '#fff',
                textMonthFontWeight: '600',
              }}
              style={{ borderRadius: 12 }}
            />
          </ScrollView>

          {/* Fixed footer */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={[styles.btn, styles.btnGhost]}>
              <Text style={styles.btnGhostText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onConfirm(selected)}
              style={[styles.btn, styles.btnPrimary]}
            >
              <Text style={styles.btnPrimaryText}>Use this date</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 12,
    paddingHorizontal: 16,
    // leave room for iOS home indicator
    paddingBottom: Platform.select({ ios: 10, android: 0 }),
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 8,
  },
  close: { fontSize: 20, color: '#6B7280' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },

  footer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: Platform.select({ ios: 16, android: 16 }),
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  btn: { paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12 },
  btnGhost: { backgroundColor: '#F3F4F6' },
  btnGhostText: { color: '#111827', fontWeight: '600' },
  btnPrimary: { backgroundColor: '#8B5CF6' },
  btnPrimaryText: { color: '#fff', fontWeight: '700' },
});