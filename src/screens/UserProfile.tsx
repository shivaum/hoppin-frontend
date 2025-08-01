import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import { useAuth } from "../contexts/AuthContext";
import EditableAvatar from "../components/profile/EditableAvatar";
import EditableField from "../components/profile/EditableField";
import DriverStatusCard from "../components/profile/DriverStatusCard";
import DriverVerificationModal from "../components/profile/DriverVerification/DriverVerificationModal";
import { uploadLicense } from "../components/profile/DriverVerification/utils";
import ProfileActions from "../components/profile/ProfileActions";

export default function UserProfile() {
  const { user, updateUserProfile, refreshUser } = useAuth();
  const [editedUser, setEditedUser] = useState(user);
  const [isEditing, setIsEditing] = useState(false);
  const [photoFile, setPhotoFile] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEditedUser(user);
  }, [user]);

  const handleChoosePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhotoFile(result.assets[0]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      if (editedUser?.name) formData.append("name", editedUser.name);
      if (editedUser?.phone) formData.append("phone", editedUser.phone);
      if (photoFile) {
        formData.append("photo", {
          uri: photoFile.uri,
          name: photoFile.fileName || "profile.jpg",
          type: photoFile.type || "image/jpeg",
        } as any);
      }

      await updateUserProfile(formData);
      setIsEditing(false);
      setPhotoFile(null);

      Toast.show({ type: "success", text1: "Profile updated successfully" });
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Update failed", text2: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <EditableAvatar
        uri={photoFile?.uri || user?.photo || "https://placehold.co/100x100"}
        isEditing={isEditing}
        onPress={handleChoosePhoto}
      />

      {isEditing ? (
        <>
          <EditableField
            placeholder="Full Name"
            value={editedUser?.name}
            onChange={(text) => setEditedUser((u) => (u ? { ...u, name: text } : u))}
          />
          <EditableField
            placeholder="Phone"
            value={editedUser?.phone}
            onChange={(text) => setEditedUser((u) => (u ? { ...u, phone: text } : u))}
          />
          <ProfileActions
            loading={loading}
            onCancel={() => setIsEditing(false)}
            onSave={handleSave}
          />
        </>
      ) : (
        <>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.detail}>{user?.email}</Text>
          <Text style={styles.detail}>{user?.phone}</Text>
          <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editBtn}>
            <Text style={styles.editText}>Edit Profile</Text>
          </TouchableOpacity>
        </>
      )}

      <DriverStatusCard
        isDriver={!!user?.is_driver}
        onStartVerification={() => setShowVerificationModal(true)}
      />
      <DriverVerificationModal
        visible={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onUpload={async (file) => {
        try {
          await uploadLicense({
            uri: file.uri,
            name: file.fileName || "license.jpg",
            type: file.type || "image/jpeg",
          });

          Toast.show({
            type: "success",
            text1: "License uploaded successfully",
          });

          await refreshUser();
          setShowVerificationModal(false);
        } catch (err: any) {
          Toast.show({
            type: "error",
            text1: "Verification failed",
            text2: err.message,
          });
        }
      }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 24,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  detail: {
    fontSize: 16,
    color: "#555",
    marginBottom: 4,
  },
  editBtn: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  editText: {
    color: "white",
    fontWeight: "bold",
  },
});