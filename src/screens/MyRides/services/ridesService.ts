// src/screens/MyRides/services/ridesService.ts
import type { DriverRide, RideRequestItem } from '../../../types';
import {
  getMyDriverRides as apiGetMyDriverRides,
  acceptRideRequest as apiAcceptRideRequest,
  declineRideRequest as apiDeclineRideRequest,
} from '../../../integrations/hopin-backend/driver';
import { getMyRideRequests as apiGetMyRideRequests } from '../../../integrations/hopin-backend/rider';

/**
 * Service layer for MyRides screen
 * Handles all API calls and data transformations
 */

export const ridesService = {
  /**
   * Fetch all rides offered by the current driver
   */
  fetchDriverRides: async (): Promise<DriverRide[]> => {
    try {
      const rides = await apiGetMyDriverRides();
      return sortByDepartureTime(rides);
    } catch (error) {
      console.error('Failed to fetch driver rides:', error);
      throw error;
    }
  },

  /**
   * Fetch all ride requests made by the current rider
   */
  fetchRiderRides: async (): Promise<RideRequestItem[]> => {
    try {
      const requests = await apiGetMyRideRequests();
      return sortByDepartureTime(requests);
    } catch (error) {
      console.error('Failed to fetch rider rides:', error);
      throw error;
    }
  },

  /**
   * Accept a pending ride request
   */
  acceptRequest: async (requestId: string): Promise<void> => {
    try {
      await apiAcceptRideRequest(requestId);
    } catch (error) {
      console.error('Failed to accept ride request:', error);
      throw error;
    }
  },

  /**
   * Decline a pending ride request
   */
  declineRequest: async (requestId: string): Promise<void> => {
    try {
      await apiDeclineRideRequest(requestId);
    } catch (error) {
      console.error('Failed to decline ride request:', error);
      throw error;
    }
  },
};

/**
 * Sort rides/requests by departure time (earliest first)
 */
function sortByDepartureTime<T extends { departure_time: string }>(items: T[]): T[] {
  return items.sort((a, b) => {
    const aTime = new Date(a.departure_time).getTime();
    const bTime = new Date(b.departure_time).getTime();
    return aTime - bTime;
  });
}