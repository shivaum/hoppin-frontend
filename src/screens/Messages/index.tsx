// src/screens/Messages/index.tsx
import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MessageConversation } from './components/MessageListItem';
import { colors } from '../../constants/colors';
import type { MainStackParamList } from '../../navigation/types';

// Components
import { FilterToggle } from './components/FilterToggle';
import { SearchBar } from './components/SearchBar';
import { ConversationList } from './components/ConversationList';

// Hooks
import { useConversations } from './hooks/useConversations';

type MessagesNavProp = NativeStackNavigationProp<MainStackParamList>;

export default function Messages() {
  const navigation = useNavigation<MessagesNavProp>();

  const {
    filteredConversations,
    loading,
    searchQuery,
    activeFilter,
    setSearchQuery,
    setActiveFilter,
    refresh,
  } = useConversations();

  const handleConversationPress = (conversation: MessageConversation) => {
    navigation.navigate('Chat', { conversation });
  };

  const handleRideHeaderPress = (conversation: MessageConversation) => {
    navigation.navigate('RideDetails', {
      rideId: conversation.ride.id,
      source: conversation.userRole === 'driver' ? 'driver' : 'rider',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.neutral.white} />

      {/* Filter Toggle */}
      <FilterToggle activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      {/* Search Bar */}
      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

      {/* Conversations List */}
      <ConversationList
        conversations={filteredConversations}
        loading={loading}
        onRefresh={refresh}
        onConversationPress={handleConversationPress}
        onRideHeaderPress={handleRideHeaderPress}
        activeFilter={activeFilter}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
});