// src/screens/Messages/services/conversationService.ts
import { fetchUserConversations as apiFetchUserConversations } from '../../../integrations/hopin-backend/messaging';
import type { MessageConversation, MessageStatus } from '../components/MessageListItem';

/**
 * Service layer for Messages screen
 * Handles all API calls and data transformations
 */

export const conversationService = {
  /**
   * Fetch all conversations for the current user
   * Transforms raw API data into MessageConversation format
   */
  fetchConversations: async (): Promise<MessageConversation[]> => {
    try {
      const data = await apiFetchUserConversations();

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
            departure_time: conv.ride?.departure_time || new Date().toISOString(),
            start_location: conv.ride?.start_location || 'Unknown',
            end_location: conv.ride?.end_location || 'Unknown',
            start_lat: conv.ride?.start_lat,
            start_lng: conv.ride?.start_lng,
            end_lat: conv.ride?.end_lat,
            end_lng: conv.ride?.end_lng,
            price_per_seat: conv.ride?.price_per_seat,
            available_seats: conv.ride?.available_seats,
          },
          lastMessage: {
            content: conv.lastMessage?.content || 'No messages yet',
            created_at: conv.lastMessage?.timestamp || new Date().toISOString(),
          },
          status: transformStatus(conv.status),
          userRole: currentUserRole,
        };
      });

      return transformedConversations;
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      throw error;
    }
  },
};

/**
 * Transform API status to MessageStatus
 */
function transformStatus(status: string): MessageStatus {
  switch (status) {
    case 'pending':
      return 'pending';
    case 'accepted':
      return 'confirmed';
    case 'declined':
      return 'cancelled';
    default:
      return 'pending';
  }
}