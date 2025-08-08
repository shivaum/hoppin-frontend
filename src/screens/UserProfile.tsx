import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import { useRoute } from "@react-navigation/native";

import { useAuth } from "../contexts/AuthContext";
import EditableAvatar from "../components/profile/EditableAvatar";
import EditableField from "../components/profile/EditableField";
import DriverStatusCard from "../components/profile/DriverStatusCard";
import DriverVerificationModal from "../components/profile/DriverVerification/DriverVerificationModal";
import { uploadLicense } from "../components/profile/DriverVerification/utils";
import ProfileActions from "../components/profile/ProfileActions";
import ProfileRating from "../components/profile/ProfileRating";
import { getPublicProfile } from "../integrations/hopin-backend/profile";

type User = {
  name?: string;
  phone?: string;
};

export default function UserProfile() {
  const route = useRoute<any>();
  const requestedProfileId = route.params?.profileId;

  const { user, updateUserProfile, refreshUser, logout } = useAuth(); // make sure signOut exists
  const isCurrentUser = !requestedProfileId || requestedProfileId === user?.id;

  const [profile, setProfile] = useState<any>(null);
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [photoFile, setPhotoFile] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (isCurrentUser) {
          setProfile(user);
          setEditedUser(user);
        } else {
          const publicData = await getPublicProfile(requestedProfileId);
          setProfile(publicData);
        }
      } catch (err: any) {
        Toast.show({
          type: "error",
          text1: "Failed to load profile",
          text2: err.message,
        });
      }
    };

    fetchProfile();
  }, [requestedProfileId, user]);

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

  const handleLogout = async () => {
    await logout();
  };

  if (!profile) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <EditableAvatar
        uri={photoFile?.uri || profile?.photo || "https://placehold.co/100x100"}
        isEditing={isCurrentUser && isEditing}
        onPress={isCurrentUser ? handleChoosePhoto : () => {}}
      />

      {isCurrentUser && isEditing ? (
        <>
          <EditableField
            placeholder="Full Name"
            value={editedUser?.name}
            onChange={(text) => setEditedUser((u: User | null) => (u ? { ...u, name: text } : u))}
          />
          <EditableField
            placeholder="Phone"
            value={editedUser?.phone}
            onChange={(text) => setEditedUser((u: User | null) => (u ? { ...u, phone: text } : u))}
          />
          <ProfileActions
            loading={loading}
            onCancel={() => setIsEditing(false)}
            onSave={handleSave}
          />
        </>
      ) : (
        <>
          <Text style={styles.name}>{profile?.name}</Text>
          {isCurrentUser && <Text style={styles.detail}>{profile?.email}</Text>}
          {isCurrentUser && <Text style={styles.detail}>{profile?.phone}</Text>}
          {isCurrentUser && (
            <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editBtn}>
              <Text style={styles.editText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </>
      )}

      <ProfileRating 
        driverRating={profile.driverRating} 
        riderRating={profile.riderRating} 
      />

      {isCurrentUser && (
        <>
          <DriverStatusCard
            isDriver={!!profile?.is_driver}
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

          {/* Logout button */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </>
      )}
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
  logoutBtn: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#FF3B30",
    borderRadius: 8,
  },
  logoutText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});