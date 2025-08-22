import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, PanResponder } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../contexts/AuthContext';
import OnboardingSlide from './OnboardingSlide';
import {
  FindRidesIllustration,
  OfferRidesIllustration,
  SafetyFirstIllustration,
  ReadyIllustration,
} from './OnboardingIllustrations';

const { width } = Dimensions.get('window');

const slides = [
  {
    type: 'offer',
    title: 'Find rides anytime,',
    subtitle: 'anywhere',
    description: 'Sell houses easily with the help of Listenoryx and to make this line big I am writing more.',
    illustration: <FindRidesIllustration />,
  },
  {
    type: 'find',
    title: 'Earn money, offer rides',
    description: 'Sell houses easily with the help of Listenoryx and to make this line big I am writing more.',
    illustration: <OfferRidesIllustration />,
  },
  {
    type: 'safety',
    title: 'Ease and Safety first',
    description: 'Sell houses easily with the help of Listenoryx and to make this line big I am writing more.',
    illustration: <SafetyFirstIllustration />,
  },
  {
    type: 'ready',
    title: 'Are you ready?',
    description: 'Sell houses easily with the help of Listenoryx and to make this line big I am writing more.',
    illustration: <ReadyIllustration />,
  },
];

export default function WelcomeScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { markOnboarded } = useAuth();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const goToAuth = () => {
    const rootNav = nav.getParent()?.getParent();
    rootNav?.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Auth' as never }],
      })
    );
  };

  const completeOnboarding = async () => {
    await markOnboarded();
    const rootNav = nav.getParent()?.getParent();
    rootNav?.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'MainStack' as never }],
      })
    );
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const skipToEnd = () => {
    setCurrentSlide(slides.length - 1);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <View style={styles.container}>
      <OnboardingSlide
        {...currentSlideData}
        showSkip={currentSlide < slides.length - 1}
        showNext={currentSlide < slides.length - 1}
        showGetStarted={currentSlide === slides.length - 1}
        onSkip={skipToEnd}
        onNext={nextSlide}
        onGetStarted={completeOnboarding}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});