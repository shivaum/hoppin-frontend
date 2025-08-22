import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { colors } from '../constants/colors';
import { MainStackParamList } from '../navigation/types';
import { uploadLicense } from '../components/profile/DriverVerification/utils';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

type DriverVerificationUploadNavProp = NativeStackNavigationProp<
  MainStackParamList,
  'DriverVerificationUpload'
>;

export default function DriverVerificationUpload() {
  const navigation = useNavigation<DriverVerificationUploadNavProp>();
  const { refreshUser } = useAuth();
  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleClose = () => {
    navigation.goBack();
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSelectImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant camera roll permissions to upload your license.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to select image. Please try again.',
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      Toast.show({
        type: 'error',
        text1: 'No Image Selected',
        text2: 'Please select a license image first.',
      });
      return;
    }

    setIsUploading(true);
    try {
      await uploadLicense({
        uri: selectedImage.uri,
        name: selectedImage.fileName || 'license.jpg',
        type: selectedImage.type || 'image/jpeg',
      });

      Toast.show({
        type: 'success',
        text1: 'License Uploaded',
        text2: 'Your license has been submitted for verification.',
      });

      await refreshUser();
      
      // Navigate back to profile
      navigation.navigate('Tabs', { screen: 'Profile' });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: error.message || 'Please try again.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.neutral.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleClose} style={styles.exitButton}>
          <Text style={styles.exitIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View style={styles.progressFill} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>
          Upload a picture of the front of your license
        </Text>

        <TouchableOpacity 
          style={styles.uploadArea} 
          onPress={handleSelectImage}
          disabled={isUploading}
        >
          {selectedImage ? (
            <View style={styles.selectedImageContainer}>
              <Image 
                source={{ uri: selectedImage.uri }} 
                style={styles.selectedImage}
                resizeMode="cover"
              />
              <View style={styles.imageOverlay}>
                <View style={styles.cameraIconContainer}>
                  <Text style={styles.cameraIcon}>📷</Text>
                </View>
                <Text style={styles.tapToChangeText}>Tap to change</Text>
              </View>
            </View>
          ) : (
            <View style={styles.uploadPlaceholder}>
              <View style={styles.cameraIconContainer}>
                <Text style={styles.cameraIcon}>📷</Text>
              </View>
              <Text style={styles.uploadText}>Upload a photo</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.continueButton, 
            (!selectedImage || isUploading) && styles.continueButtonDisabled
          ]} 
          onPress={handleUpload}
          disabled={!selectedImage || isUploading}
        >
          {isUploading ? (
            <LoadingSpinner size={24} color={colors.neutral.white} />
          ) : (
            <Text style={styles.continueButtonText}>→</Text>
          )}
        </TouchableOpacity>
        
        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressDot} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: colors.neutral.gray900,
    fontWeight: '300',
  },
  exitButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitIcon: {
    fontSize: 20,
    color: colors.neutral.gray900,
    fontWeight: '300',
  },
  progressBar: {
    height: 2,
    backgroundColor: colors.neutral.gray200,
    marginHorizontal: 24,
    marginBottom: 32,
  },
  progressFill: {
    height: '100%',
    width: '100%',
    backgroundColor: colors.neutral.gray900,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.neutral.gray900,
    lineHeight: 38,
    marginBottom: 48,
  },
  uploadArea: {
    flex: 1,
    backgroundColor: colors.neutral.gray100,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.neutral.gray300,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    minHeight: 300,
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  selectedImageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  cameraIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cameraIcon: {
    fontSize: 24,
  },
  uploadText: {
    fontSize: 18,
    color: colors.neutral.gray600,
    fontWeight: '500',
  },
  tapToChangeText: {
    fontSize: 16,
    color: colors.neutral.white,
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  continueButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.neutral.gray900,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: colors.neutral.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonDisabled: {
    backgroundColor: colors.neutral.gray400,
    opacity: 0.6,
  },
  continueButtonText: {
    color: colors.neutral.white,
    fontSize: 24,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral.gray300,
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: colors.neutral.gray900,
  },
});