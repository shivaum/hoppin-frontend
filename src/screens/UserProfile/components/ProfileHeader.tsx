import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '../../../constants/colors';

interface ProfileHeaderProps {
  name: string;
  email: string;
  photo?: string;
  driverRating: number | null;
  riderRating: number | null;
  isDriver: boolean;
  showVerificationBadge?: boolean;
}

export default function ProfileHeader({ 
  name, 
  email, 
  photo, 
  driverRating, 
  riderRating, 
  isDriver, 
  showVerificationBadge = false 
}: ProfileHeaderProps) {
  const renderStars = (rating: number | null) => {
    const stars = [];
    const ratingValue = rating || 0;
    
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= Math.floor(ratingValue);
      const isPartial = i === Math.ceil(ratingValue) && ratingValue % 1 !== 0;
      
      if (isPartial) {
        // For partial stars, we'll use a filled star but with reduced opacity
        const fillPercentage = ratingValue % 1;
        stars.push(
          <Text key={i} style={[styles.star, styles.starPartial, { opacity: 0.3 + (fillPercentage * 0.7) }]}>
            ★
          </Text>
        );
      } else {
        stars.push(
          <Text key={i} style={[styles.star, isFilled ? styles.starFilled : styles.starEmpty]}>
            ★
          </Text>
        );
      }
    }
    return stars;
  };

  const renderRatingSection = () => {
    if (isDriver && driverRating !== null && riderRating !== null) {
      // Driver with both ratings - show both
      return (
        <View style={styles.dualRatingsContainer}>
          <View style={styles.ratingItem}>
            <Text style={styles.ratingLabel}>Rating</Text>
            <View style={styles.starsContainer}>
              {renderStars(driverRating)}
            </View>
            <Text style={styles.ratingValue}>{driverRating.toFixed(2)}</Text>
            <Text style={styles.ratingSubLabel}>As driver</Text>
          </View>
          
          <View style={styles.ratingItem}>
            <Text style={styles.ratingLabel}>Rating</Text>
            <View style={styles.starsContainer}>
              {renderStars(riderRating)}
            </View>
            <Text style={styles.ratingValue}>{riderRating.toFixed(2)}</Text>
            <Text style={styles.ratingSubLabel}>As rider</Text>
          </View>
        </View>
      );
    } else {
      // Single rating (either rider only, or driver with only one rating)
      const displayRating = isDriver && driverRating !== null ? driverRating : riderRating;
      const ratingType = isDriver && driverRating !== null ? 'As driver' : 'As rider';
      
      if (displayRating === null) {
        return (
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingLabel}>Rating</Text>
            <Text style={styles.noRatingText}>Not rated yet</Text>
          </View>
        );
      }

      return (
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingLabel}>Rating</Text>
          <View style={styles.starsContainer}>
            {renderStars(displayRating)}
          </View>
          <Text style={styles.ratingValue}>{displayRating.toFixed(2)}</Text>
          <Text style={styles.ratingSubLabel}>{ratingType}</Text>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <Image 
          source={{ uri: photo || 'https://placehold.co/120x120' }} 
          style={styles.avatar}
        />
        {showVerificationBadge && isDriver && (
          <View style={styles.verificationBadge}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.email}>{email}</Text>
      
      {showVerificationBadge && isDriver && (
        <View style={styles.driverBadge}>
          <Text style={styles.driverBadgeText}>Verified driver ✓</Text>
        </View>
      )}
      
      {renderRatingSection()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  verificationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 32,
    height: 32,
    backgroundColor: colors.success,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.neutral.white,
  },
  checkmark: {
    color: colors.neutral.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.neutral.gray900,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: colors.neutral.gray600,
    marginBottom: 12,
  },
  driverBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 20,
  },
  driverBadgeText: {
    color: colors.neutral.white,
    fontSize: 14,
    fontWeight: '600',
  },
  dualRatingsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    width: '100%',
    marginTop: 20,
  },
  ratingItem: {
    alignItems: 'center',
    flex: 1,
  },
  ratingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  ratingLabel: {
    fontSize: 14,
    color: colors.neutral.gray500,
    marginBottom: 4,
  },
  ratingSubLabel: {
    fontSize: 12,
    color: colors.neutral.gray400,
    marginTop: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  star: {
    fontSize: 16,
    marginHorizontal: 1,
  },
  starFilled: {
    color: colors.secondary.yellow,
  },
  starEmpty: {
    color: colors.neutral.gray300,
  },
  starPartial: {
    color: colors.secondary.yellow,
  },
  ratingValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary.purple,
    marginTop: 4,
  },
  noRatingText: {
    fontSize: 16,
    color: colors.neutral.gray400,
    fontStyle: 'italic',
    marginTop: 8,
  },
});