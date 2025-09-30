// src/screens/Chat/hooks/useConversation.ts
import { useState, useEffect } from 'react';
import { fetchUserConversations } from '../../../integrations/hopin-backend/messaging';
import type { MessageConversation } from '../../Messages/components/MessageListItem';

/**
 * Hook to fetch conversation metadata by rideId and otherUserId
 * Fetches all conversations and filters for the matching one
 */
export function useConversation(rideId: string, otherUserId: string) {
  const [conversation, setConversation] = useState<MessageConversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConversation() {
      try {
        setLoading(true);
        setError(null);

        const conversations = await fetchUserConversations();

        // Find the conversation matching both rideId and otherUserId
        const match = conversations.find((c: MessageConversation) =>
          c.ride.id === rideId && c.otherUser.id === otherUserId
        );

        if (!match) {
          setError('Conversation not found');
        } else {
          setConversation(match);
        }
      } catch (err: any) {
        console.error('Failed to fetch conversation:', err);
        setError(err.message || 'Failed to load conversation');
      } finally {
        setLoading(false);
      }
    }

    if (rideId && otherUserId) {
      fetchConversation();
    }
  }, [rideId, otherUserId]);

  return { conversation, loading, error };
}