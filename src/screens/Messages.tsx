import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuth } from '../contexts/AuthContext';
import MessageListItem, { MessageConversation, MessageStatus } from '../components/messages/MessageListItem';
import { fetchUserConversations } from '../integrations/hopin-backend/messaging';
import { colors } from '../constants/colors';
import { MainStackParamList } from '../navigation/types';

type MessagesNavProp = NativeStackNavigationProp<MainStackParamList>;

type FilterType = 'driver' | 'rider';

export default function Messages() {
  const { user } = useAuth();
  const navigation = useNavigation<MessagesNavProp>();
  
  const [conversations, setConversations] = useState<MessageConversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<MessageConversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('driver');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    filterConversations();
  }, [conversations, activeFilter, searchQuery]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await fetchUserConversations();
      
      // Transform the data to match our interface
      const transformedConversations: MessageConversation[] = data.map((conv: any) => {
        // rideDetails.type indicates OTHER user's role, so invert it for current user's role
        const otherUserRole = conv.rideDetails?.type;
        const currentUserRole = otherUserRole === 'driver' ? 'rider' : 'driver';
        
        return {
          id: `${conv.rideId}-${conv.otherUser.id}`,
          otherUser: conv.otherUser,
          ride: {
            id: conv.rideId,
            departure_time: conv.rideDetails?.date ? `${conv.rideDetails.date}T00:00:00.000Z` : new Date().toISOString(),
            start_location: conv.rideDetails?.route?.split(' → ')[0] || 'Unknown',
            end_location: conv.rideDetails?.route?.split(' → ')[1] || 'Unknown',
          },
          lastMessage: {
            content: conv.lastMessage?.content || 'No messages yet',
            created_at: conv.lastMessage?.timestamp || new Date().toISOString(),
          },
          status: (conv.status === 'pending' ? 'pending' : conv.status === 'accepted' ? 'confirmed' : conv.status === 'declined' ? 'cancelled' : 'pending') as MessageStatus,
          userRole: currentUserRole,
        };
      });

      setConversations(transformedConversations);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error loading conversations',
        text2: 'Unable to load your conversations.',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterConversations = () => {
    let filtered = [...conversations];

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(conv => 
        conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.ride.start_location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.ride.end_location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by driver/rider based on user's role in each conversation
    filtered = filtered.filter(conv => conv.userRole === activeFilter);

    setFilteredConversations(filtered);
  };

  const handleConversationPress = (conversation: MessageConversation) => {
    navigation.navigate('Chat', { conversation });
  };

  const handleRideHeaderPress = (conversation: MessageConversation) => {
    // TODO: Navigate to ride details - placeholder for now
    Toast.show({
      type: 'info',
      text1: 'Ride Details',
      text2: `Navigate to ride ${conversation.ride.id} details`,
    });
    // navigation.navigate('RideDetails', { rideId: conversation.ride.id });
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No messages yet</Text>
      <Text style={styles.emptyStateText}>
        {activeFilter === 'driver' 
          ? "Your driver conversations will appear here"
          : "Your rider conversations will appear here"}
      </Text>
    </View>
  );

  const renderConversationItem = ({ item }: { item: MessageConversation }) => (
    <MessageListItem
      conversation={item}
      onPress={() => handleConversationPress(item)}
      onRideHeaderPress={() => handleRideHeaderPress(item)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.neutral.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      {/* Filter Toggle */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'driver' && styles.filterButtonActive
          ]}
          onPress={() => setActiveFilter('driver')}
        >
          <Text style={styles.filterIcon}>🚗</Text>
          <Text style={[
            styles.filterText,
            activeFilter === 'driver' && styles.filterTextActive
          ]}>
            I'm a driver
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'rider' && styles.filterButtonActive
          ]}
          onPress={() => setActiveFilter('rider')}
        >
          <Text style={styles.filterIcon}>👤</Text>
          <Text style={[
            styles.filterText,
            activeFilter === 'rider' && styles.filterTextActive
          ]}>
            I'm a rider
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search messages"
          placeholderTextColor={colors.neutral.gray400}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Conversations List */}
      <FlatList
        data={filteredConversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id}
        style={styles.conversationsList}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={loadConversations}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.neutral.gray900,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.neutral.gray100,
    flex: 1,
  },
  filterButtonActive: {
    backgroundColor: colors.neutral.gray900,
  },
  filterIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  filterText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.neutral.gray700,
  },
  filterTextActive: {
    color: colors.neutral.white,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchInput: {
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.neutral.gray100,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.neutral.gray900,
  },
  conversationsList: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.neutral.gray900,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.neutral.gray500,
    textAlign: 'center',
    lineHeight: 22,
  },
});