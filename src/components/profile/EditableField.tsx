import React from "react";
import { TextInput, StyleSheet } from "react-native";

export default function EditableField({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string | undefined;
  onChange: (text: string) => void;
}) {
  return (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      value={value}
      onChangeText={onChange}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 12,
    marginVertical: 8,
  },
});