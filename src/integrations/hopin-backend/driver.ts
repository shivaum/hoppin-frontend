import { CreateRidePayload, DriverRide } from "../../types";
import { authorizedFetch } from "./utils/authFetch";
import { API_URL } from '@env';

async function safeJson(res: Response): Promise<any> {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

/**
 * Offer a new ride as driver
 */
export async function createRide(data: CreateRidePayload): Promise<{ ride_id: string }> {
  const res = await authorizedFetch(`${API_URL}/driver/offer_ride`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      start_location: data.startLocation,
      end_location: data.endLocation,
      departure_time: data.departureTime,
      available_seats: data.availableSeats,
      price_per_seat: data.pricePerSeat,
      start_lat: data.startLat,
      start_lng: data.startLng,
      end_lat: data.endLat,
      end_lng: data.endLng,
      status: data.status,
    }),
  });
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err.error || "Failed to offer ride");
  }
  return res.json();
}

/**
 * Fetch rides the current user is offering
 */
export async function getMyDriverRides(): Promise<DriverRide[]> {
  const res = await authorizedFetch(
    `${API_URL}/driver/my_scheduled_rides`
  );
  if (!res.ok) throw new Error("Failed to fetch my rides");
  const data = await res.json();
  return data.rides ?? [];
}

/**
 * Accept a pending ride request
 */
export async function acceptRideRequest(
  requestId: string
): Promise<{ message: string }> {
  const res = await authorizedFetch(
    `${API_URL}/driver/ride_request/${requestId}/accept`,
    { method: "POST" }
  );
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err.error || "Failed to accept request");
  }
  return res.json();
}

/**
 * Decline (reject) a pending ride request
 */
export async function declineRideRequest(
  requestId: string
): Promise<{ message: string }> {
  const res = await authorizedFetch(
    `${API_URL}/driver/ride_request/${requestId}/reject`,
    { method: "POST" }
  );
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err.error || "Failed to decline request");
  }
  return res.json();
}

/**
 * Fetch a single ride's current details
 */
export async function getRideDetails(rideId: string): Promise<DriverRide> {
  const res = await authorizedFetch(`${API_URL}/driver/ride/${rideId}/details`);
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err.error || "Failed to fetch ride details");
  }
  const data = await res.json();
  return data.ride || data;
}

/**
 * Update a ride's details
 */
export async function updateRide(rideId: string, updateData: {
  start_location?: string;
  end_location?: string;
  departure_time?: string;
  available_seats?: number;
  price_per_seat?: number;
}): Promise<{ message: string }> {
  const res = await authorizedFetch(`${API_URL}/driver/ride/${rideId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updateData),
  });
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err.error || "Failed to update ride");
  }
  return res.json();
}