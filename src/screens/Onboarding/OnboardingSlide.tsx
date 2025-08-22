import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { colors } from '../../constants/colors';

const { width, height } = Dimensions.get('window');

interface OnboardingSlideProps {
  title?: string;
  subtitle?: string;
  description?: string;
  illustration?: React.ReactNode;
  showSkip?: boolean;
  showNext?: boolean;
  showGetStarted?: boolean;
  onSkip?: () => void;
  onNext?: () => void;
  onGetStarted?: () => void;
  isWelcome?: boolean;
}

export default function OnboardingSlide({
  title,
  subtitle,
  description,
  illustration,
  showSkip = true,
  showNext = false,
  showGetStarted = false,
  onSkip,
  onNext,
  onGetStarted,
  isWelcome = false,
}: OnboardingSlideProps) {
  return (
    <View style={styles.container}>
      {/* Skip Button */}
      {showSkip && !isWelcome && (
        <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Content */}
      <View style={styles.content}>
        {isWelcome ? (
          <>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>hoppin</Text>
              <View style={styles.logoIcon}>
                <Text style={styles.logoArrow}>↗</Text>
              </View>
            </View>
            <Text style={styles.welcomeSubtitle}>safe travel for students</Text>
          </>
        ) : (
          <>
            {illustration && (
              <View style={styles.illustrationContainer}>
                {illustration}
              </View>
            )}
            
            {title && <Text style={styles.title}>{title}</Text>}
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            {description && <Text style={styles.description}>{description}</Text>}
          </>
        )}
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomContainer}>
        {showNext && (
          <TouchableOpacity style={styles.nextButton} onPress={onNext}>
            <Text style={styles.nextButtonText}>→</Text>
          </TouchableOpacity>
        )}
        
        {showGetStarted && (
          <TouchableOpacity style={styles.getStartedButton} onPress={onGetStarted}>
            <Text style={styles.getStartedText}>Get started</Text>
          </TouchableOpacity>
        )}

        {isWelcome && (
          <View style={styles.welcomeButtons}>
            <TouchableOpacity style={styles.loginButton} onPress={onGetStarted}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.signupButton} onPress={onNext}>
              <Text style={styles.signupButtonText}>I'm new to Hoppin</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    justifyContent: 'space-between',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
  },
  skipText: {
    color: colors.text.primary,
    fontSize: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginRight: 8,
  },
  logoIcon: {
    width: 32,
    height: 32,
    backgroundColor: colors.primary.purple,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoArrow: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  welcomeSubtitle: {
    color: colors.text.secondary,
    fontSize: 18,
    textAlign: 'center',
  },
  illustrationContainer: {
    marginBottom: 40,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  bottomContainer: {
    paddingHorizontal: 40,
    paddingBottom: 60,
    alignItems: 'center',
  },
  nextButton: {
    width: 60,
    height: 60,
    backgroundColor: colors.primary.purple,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    color: colors.text.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  getStartedButton: {
    width: width - 80,
    height: 56,
    backgroundColor: colors.primary.purple,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  getStartedText: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  welcomeButtons: {
    width: '100%',
    gap: 16,
  },
  loginButton: {
    width: '100%',
    height: 56,
    backgroundColor: colors.primary.purple,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  signupButton: {
    width: '100%',
    height: 56,
    backgroundColor: 'transparent',
    borderRadius: 28,
    borderWidth: 2,
    borderColor: colors.neutral.gray600,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupButtonText: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '600',
  },
});