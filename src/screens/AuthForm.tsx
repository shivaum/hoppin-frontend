import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import OnboardingSlide from './Onboarding/OnboardingSlide';

const { width } = Dimensions.get('window');

export default function AuthForm() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const goToLogin = () => {
    nav.navigate('Login' as never);
  };

  const goToSignup = () => {
    nav.navigate('Signup' as never);
  };

  return (
    <View style={styles.container}>
      <OnboardingSlide
        isWelcome={true}
        onGetStarted={goToLogin} // Login button
        onNext={goToSignup} // "I'm new to Hoppin" button
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});