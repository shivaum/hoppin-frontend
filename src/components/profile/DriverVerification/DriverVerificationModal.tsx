import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";

type Props = {
  visible: boolean;
  onClose: () => void;
  onUpload: (file: ImagePicker.ImagePickerAsset) => void;
};

export default function DriverVerificationModal({ visible, onClose, onUpload }: Props) {
  const handleChooseLicense = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      onUpload(result.assets[0]);
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Verify Your Driver Status</Text>
          <Text style={styles.subtitle}>Upload a photo of your driver’s license.</Text>
          <TouchableOpacity onPress={handleChooseLicense} style={styles.uploadBtn}>
            <Text style={styles.uploadText}>Choose License Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 24,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  uploadBtn: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 12,
  },
  uploadText: {
    color: "white",
    fontWeight: "bold",
  },
  cancelBtn: {
    alignItems: "center",
    padding: 8,
  },
  cancelText: {
    color: "#007AFF",
  },
});