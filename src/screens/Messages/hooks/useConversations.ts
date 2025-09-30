// src/screens/Messages/hooks/useConversations.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { MessageConversation } from '../../../components/messages/MessageListItem';
import { conversationService } from '../services/conversationService';

type FilterType = 'driver' | 'rider';

interface UseConversationsReturn {
  conversations: MessageConversation[];
  filteredConversations: MessageConversation[];
  loading: boolean;
  searchQuery: string;
  activeFilter: FilterType;
  setSearchQuery: (query: string) => void;
  setActiveFilter: (filter: FilterType) => void;
  refresh: () => Promise<void>;
}

/**
 * Custom hook for managing conversations
 * Handles fetching, filtering, and searching conversations
 */
export function useConversations(): UseConversationsReturn {
  const [conversations, setConversations] = useState<MessageConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('driver');

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await conversationService.fetchConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
      // Error is silently handled - could show toast here
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Filter and search conversations
  const filteredConversations = useMemo(() => {
    let filtered = [...conversations];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (conv) =>
          conv.otherUser.name.toLowerCase().includes(query) ||
          conv.ride.start_location.toLowerCase().includes(query) ||
          conv.ride.end_location.toLowerCase().includes(query) ||
          conv.lastMessage.content.toLowerCase().includes(query)
      );
    }

    // Filter by driver/rider based on user's role in each conversation
    filtered = filtered.filter((conv) => conv.userRole === activeFilter);

    return filtered;
  }, [conversations, activeFilter, searchQuery]);

  return {
    conversations,
    filteredConversations,
    loading,
    searchQuery,
    activeFilter,
    setSearchQuery,
    setActiveFilter,
    refresh: loadConversations,
  };
}