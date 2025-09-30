import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, TouchableOpacity, Text } from "react-native";
import Toast from "react-native-toast-message";
import { useRoute, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useAuth } from "../contexts/AuthContext";
import ProfileHeader from "./UserProfile/components/ProfileHeader";
import ProfileStats from "./UserProfile/components/ProfileStats";
import ProfileMenuList from "./UserProfile/components/ProfileMenuList";
import BecomeDriverButton from "./UserProfile/components/BecomeDriverButton";
import EditAccountModal, { EditAccountData } from "./UserProfile/components/EditAccountModal";
import { getPublicProfile } from "../integrations/hopin-backend/profile";
import { colors } from "../constants/colors";
import { MainStackParamList } from "../navigation/types";

type UserProfileNavProp = NativeStackNavigationProp<MainStackParamList>;

export default function UserProfile() {
  const route = useRoute<any>();
  const navigation = useNavigation<UserProfileNavProp>();
  const requestedProfileId = route.params?.profileId;

  const { user, updateUserProfile, refreshUser, logout } = useAuth();
  const isCurrentUser = !requestedProfileId || requestedProfileId === user?.id;

  const [profile, setProfile] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (isCurrentUser) {
          setProfile(user);
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

  const handleEditAccount = async (data: EditAccountData) => {
    try {
      const updateData = {
        name: `${data.firstName} ${data.lastName}`,
        phone: data.phone,
        email: data.email,
      };
      
      await updateUserProfile(updateData);
      Toast.show({ type: "success", text1: "Profile updated successfully" });
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Update failed", text2: err.message });
      throw err; // Re-throw to keep modal open
    }
  };

  const handleBecomeDriver = () => {
    navigation.navigate('DriverVerificationRequirements');
  };

  const handleLogout = async () => {
    try {
      await logout();
      Toast.show({ type: "success", text1: "Logged out successfully" });
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Logout failed", text2: err.message });
    }
  };

  const menuItems = [
    {
      id: 'account',
      title: 'Account details',
      icon: 'account',
      onPress: () => setShowEditModal(true),
    },
    {
      id: 'reviews',
      title: 'Reviews',
      icon: 'reviews',
      onPress: () => {
        // Navigate to reviews screen
        Toast.show({ type: 'info', text1: 'Reviews screen coming soon' });
      },
    },
    {
      id: 'payment',
      title: 'Payment',
      icon: 'payment',
      onPress: () => {
        // Navigate to payment screen
        Toast.show({ type: 'info', text1: 'Payment screen coming soon' });
      },
    },
    {
      id: 'security',
      title: 'Security',
      icon: 'security',
      onPress: () => {
        // Navigate to security screen
        Toast.show({ type: 'info', text1: 'Security screen coming soon' });
      },
    },
    {
      id: 'help',
      title: 'Help',
      icon: 'help',
      onPress: () => {
        // Navigate to help screen
        Toast.show({ type: 'info', text1: 'Help screen coming soon' });
      },
    },
  ];

  if (!profile) return null;

  const firstName = profile?.name?.split(' ')[0] || '';
  const lastName = profile?.name?.split(' ').slice(1).join(' ') || '';
  const driverRating = profile?.driver_rating;
  const riderRating = profile?.rider_rating;
  const isDriver = !!profile?.is_driver;
  const totalRides = profile?.total_rides || 0;
  
  // For demo purposes, split total rides between driver and rider
  const asDriver = isDriver ? Math.floor(totalRides * 0.6) : 0;
  const asRider = totalRides - asDriver;

  return (
    <View style={styles.container}>
      {/* Logout button at top - only show for current user */}
      {isCurrentUser && (
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ProfileHeader
          name={profile?.name || 'Unknown User'}
          email={profile?.email || ''}
          photo={profile?.photo}
          driverRating={driverRating}
          riderRating={riderRating}
          isDriver={isDriver}
          showVerificationBadge={isCurrentUser}
        />

        <ProfileStats
          totalRides={totalRides}
          asDriver={asDriver}
          asRider={asRider}
          isCurrentUser={isCurrentUser}
        />

        {isCurrentUser && !isDriver && (
          <BecomeDriverButton onPress={handleBecomeDriver} />
        )}

        {isCurrentUser && (
          <ProfileMenuList items={menuItems} />
        )}
      </ScrollView>

      {/* Edit Account Modal */}
      {isCurrentUser && (
        <EditAccountModal
          visible={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditAccount}
          initialData={{
            firstName,
            lastName,
            email: profile?.email || '',
            phone: profile?.phone || '',
            homeCity: 'Oklahoma City, Oklahoma', // Default for now
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.gray50,
  },
  topRow: {
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#FEE2E2', // Light red background
  },
  logoutButtonText: {
    color: '#DC2626', // Red text
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
});