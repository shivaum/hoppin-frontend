// src/screens/Messages/components/ConversationList.tsx
import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import MessageListItem, { MessageConversation } from '../../../components/messages/MessageListItem';
import { colors } from '../../../constants/colors';

interface ConversationListProps {
  conversations: MessageConversation[];
  loading: boolean;
  onRefresh: () => void;
  onConversationPress: (conversation: MessageConversation) => void;
  onRideHeaderPress: (conversation: MessageConversation) => void;
  activeFilter: 'driver' | 'rider';
}

export function ConversationList({
  conversations,
  loading,
  onRefresh,
  onConversationPress,
  onRideHeaderPress,
  activeFilter,
}: ConversationListProps) {
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No messages yet</Text>
      <Text style={styles.emptyStateText}>
        {activeFilter === 'driver'
          ? 'Your driver conversations will appear here'
          : 'Your rider conversations will appear here'}
      </Text>
    </View>
  );

  const renderConversationItem = ({ item }: { item: MessageConversation }) => (
    <MessageListItem
      conversation={item}
      onPress={() => onConversationPress(item)}
      onRideHeaderPress={() => onRideHeaderPress(item)}
    />
  );

  return (
    <FlatList
      data={conversations}
      renderItem={renderConversationItem}
      keyExtractor={(item) => item.id}
      style={styles.conversationsList}
      showsVerticalScrollIndicator={false}
      refreshing={loading}
      onRefresh={onRefresh}
      ListEmptyComponent={renderEmptyState}
    />
  );
}

const styles = StyleSheet.create({
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