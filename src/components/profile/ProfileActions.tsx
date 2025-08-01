import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View, StyleSheet } from "react-native";

export default function ProfileActions({
  loading,
  onCancel,
  onSave,
}: {
  loading: boolean;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <View style={styles.buttonRow}>
      <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onSave} style={styles.saveBtn} disabled={loading}>
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.saveText}>Save</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 16,
  },
  cancelBtn: {
    padding: 12,
    backgroundColor: "#ccc",
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  cancelText: {
    textAlign: "center",
    color: "#333",
  },
  saveBtn: {
    padding: 12,
    backgroundColor: "#28a745",
    borderRadius: 8,
    flex: 1,
  },
  saveText: {
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
  },
});