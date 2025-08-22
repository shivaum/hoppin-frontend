import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { colors } from '../../constants/colors';

export type MessageStatus = 'confirmed' | 'pending' | 'cancelled';

export interface MessageConversation {
  id: string;
  otherUser: {
    id: string;
    name: string;
    photo?: string;
  };
  ride: {
    id: string;
    departure_time: string;
    start_location: string;
    end_location: string;
  };
  lastMessage: {
    content: string;
    created_at: string;
  };
  status: MessageStatus;
  userRole: 'driver' | 'rider';
}

interface MessageListItemProps {
  conversation: MessageConversation;
  onPress: () => void;
  onRideHeaderPress: () => void;
}

export default function MessageListItem({
  conversation,
  onPress,
  onRideHeaderPress,
}: MessageListItemProps) {
  const { otherUser, ride, lastMessage, status } = conversation;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    }
  };

  const getStatusStyle = (status: MessageStatus) => {
    switch (status) {
      case 'confirmed':
        return { backgroundColor: colors.success, color: colors.neutral.white };
      case 'pending':
        return { backgroundColor: colors.secondary.yellow, color: colors.neutral.gray900 };
      case 'cancelled':
        return { backgroundColor: colors.error, color: colors.neutral.white };
      default:
        return { backgroundColor: colors.neutral.gray400, color: colors.neutral.white };
    }
  };

  const getStatusText = (status: MessageStatus) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending 🕐';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {otherUser.photo ? (
          <Image source={{ uri: otherUser.photo }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarText}>{getInitials(otherUser.name)}</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Header with name and ride info */}
        <TouchableOpacity onPress={onRideHeaderPress}>
          <View style={styles.header}>
            <Text style={styles.name}>{otherUser.name}</Text>
          </View>
          <View style={styles.rideInfo}>
            <Text style={styles.rideTime}>
              {formatDate(ride.departure_time)}
            </Text>
            <Text style={styles.rideSeparator}> | </Text>
            <Text style={styles.rideRoute}>
              {ride.start_location} to {ride.end_location}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Message preview */}
        <Text style={styles.messagePreview} numberOfLines={1}>
          {lastMessage.content}
        </Text>

        {/* Status badge */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, getStatusStyle(status)]}>
            <Text style={[styles.statusText, { color: getStatusStyle(status).color }]}>
              {getStatusText(status)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.neutral.gray900,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.neutral.white,
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral.gray900,
  },
  rideInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rideTime: {
    fontSize: 14,
    color: colors.neutral.gray600,
  },
  rideSeparator: {
    fontSize: 14,
    color: colors.neutral.gray400,
  },
  rideRoute: {
    fontSize: 14,
    color: colors.neutral.gray600,
    flex: 1,
  },
  messagePreview: {
    fontSize: 14,
    color: colors.neutral.gray500,
    marginBottom: 8,
    lineHeight: 18,
  },
  statusContainer: {
    flexDirection: 'row',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});