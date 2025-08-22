import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';
import { MainStackParamList } from '../navigation/types';

type DriverVerificationRequirementsNavProp = NativeStackNavigationProp<
  MainStackParamList,
  'DriverVerificationRequirements'
>;

export default function DriverVerificationRequirements() {
  const navigation = useNavigation<DriverVerificationRequirementsNavProp>();

  const handleClose = () => {
    navigation.goBack();
  };

  const handleContinue = () => {
    navigation.navigate('DriverVerificationUpload');
  };

  const requirements = [
    'Active Drivers License',
    'Pass a background check',
    'Minimum age 21',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.neutral.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.closeIcon}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleClose} style={styles.exitButton}>
          <Text style={styles.exitIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>
          Grab your materials, we'll make this quick
        </Text>

        <View style={styles.requirementsSection}>
          <Text style={styles.requirementsTitle}>Requirements</Text>
          
          {requirements.map((requirement, index) => (
            <View key={index} style={styles.requirementItem}>
              <Text style={styles.requirementText}>{requirement}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>→</Text>
        </TouchableOpacity>
        
        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressDot} />
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
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.neutral.gray900,
    lineHeight: 38,
    marginBottom: 48,
  },
  requirementsSection: {
    marginTop: 20,
  },
  requirementsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.neutral.gray900,
    marginBottom: 24,
  },
  requirementItem: {
    marginBottom: 20,
  },
  requirementText: {
    fontSize: 18,
    color: colors.neutral.gray700,
    lineHeight: 24,
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