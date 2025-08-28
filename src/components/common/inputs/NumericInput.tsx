import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

type Props = {
  label: string;
  value: string;
  keyboardType: 'number-pad' | 'decimal-pad';
  onChange: (v: string) => void;
  maxLength?: number;
};

export default function NumericInput({ label, value, keyboardType, onChange, maxLength }: Props) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        keyboardType={keyboardType}
        value={value}
        onChangeText={onChange}
        maxLength={maxLength}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { marginBottom: 4, fontWeight: '500' },
  input: {
    borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 6,
    paddingHorizontal: 12, height: 44, backgroundColor: '#FFF',
  },
});