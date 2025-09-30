// src/screens/EditRide/services/rideService.ts
import {
  getRideDetails as apiGetRideDetails,
  updateRide as apiUpdateRide,
  acceptRideRequest as apiAcceptRideRequest,
  declineRideRequest as apiDeclineRideRequest,
} from '../../../integrations/hopin-backend/driver';
import type { DriverRide, DriverRideRequest } from '../../../types';

/**
 * Service layer for EditRide screen
 * Handles all ride-related API calls
 */

export const rideService = {
  /**
   * Fetch fresh ride details from API
   */
  fetchRideDetails: async (rideId: string): Promise<DriverRide> => {
    try {
      const rideData = await apiGetRideDetails(rideId);
      return rideData;
    } catch (error) {
      console.error('Failed to fetch ride details:', error);
      throw error;
    }
  },

  /**
   * Update ride details
   */
  updateRide: async (
    rideId: string,
    updates: {
      start_location: string;
      end_location: string;
      departure_time: string;
      available_seats: number;
      price_per_seat: number;
    }
  ): Promise<void> => {
    try {
      await apiUpdateRide(rideId, updates);
    } catch (error) {
      console.error('Failed to update ride:', error);
      throw error;
    }
  },

  /**
   * Accept a ride request
   */
  acceptRequest: async (requestId: string): Promise<void> => {
    try {
      await apiAcceptRideRequest(requestId);
    } catch (error) {
      console.error('Failed to accept request:', error);
      throw error;
    }
  },

  /**
   * Decline a ride request
   */
  declineRequest: async (requestId: string): Promise<void> => {
    try {
      await apiDeclineRideRequest(requestId);
    } catch (error) {
      console.error('Failed to decline request:', error);
      throw error;
    }
  },
};