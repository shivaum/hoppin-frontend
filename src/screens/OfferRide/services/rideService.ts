// src/screens/OfferRide/services/rideService.ts
import { createRide as apiCreateRide } from '../../../integrations/hopin-backend/driver';
import type { CreateRidePayload } from '../../../types';
import type { LatLng } from '../../../components/common/inputs/UnifiedLocationInput';

interface CreateRideParams {
  pickupText: string;
  dropoffText: string;
  pickup: LatLng;
  dropoff: LatLng;
  departureISO: string;
  availableSeats: number;
  pricePerSeat: number;
}

/**
 * Service layer for OfferRide screen
 * Handles ride creation API calls
 */
export const rideService = {
  /**
   * Create a new ride offering
   */
  createRide: async (params: CreateRideParams): Promise<{ ride_id: string }> => {
    const payload: CreateRidePayload = {
      startLocation: params.pickupText,
      endLocation: params.dropoffText,
      departureTime: params.departureISO,
      availableSeats: params.availableSeats,
      pricePerSeat: params.pricePerSeat,
      startLat: params.pickup.lat,
      startLng: params.pickup.lng,
      endLat: params.dropoff.lat,
      endLng: params.dropoff.lng,
      status: 'available',
    };

    try {
      const result = await apiCreateRide(payload);
      return result;
    } catch (error) {
      console.error('Failed to create ride:', error);
      throw error;
    }
  },
};