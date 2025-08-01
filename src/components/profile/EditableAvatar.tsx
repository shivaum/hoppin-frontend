import React from "react";
import { Image, TouchableOpacity, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function EditableAvatar({
  uri,
  isEditing,
  onPress,
}: {
  uri: string;
  isEditing: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Image source={{ uri }} style={styles.avatar} />
      {isEditing && (
        <View style={styles.cameraIcon}>
          <Ionicons name="camera" size={20} color="white" />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 60,
    marginBottom: 16,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "black",
    borderRadius: 10,
    padding: 4,
  },
});