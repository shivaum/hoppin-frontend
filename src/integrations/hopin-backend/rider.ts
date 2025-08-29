import { authorizedFetch } from "./utils/authFetch";
import {
  SearchRide,
  RequestRidePayload,
  RideRequestItem,
} from "../../types";
import { API_URL } from '@env'

async function safeJson(res: Response): Promise<any> {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

/**
 * Search for available rides matching from/to and date
 */
export async function searchRides(
  from: string,
  to: string,
  date?: string
): Promise<SearchRide[]> {
  let url = `${API_URL}/rider/search_rides?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
  if (date) {
    url += `&date=${encodeURIComponent(date)}`;
  }
  
  const res = await authorizedFetch(url);
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err.error || "Failed to search rides");
  }
  const data = await res.json();
  return (data.rides ?? []) as SearchRide[];
}

/**
 * Request to join an existing ride
 */
export async function requestRide(
  payload: RequestRidePayload
): Promise<{ request_id: string }> {
  const res = await authorizedFetch(`${API_URL}/rider/request_ride`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err.error || "Failed to request ride");
  }
  return res.json();
}

/**
 * Fetch all ride requests made by the current user
 */
export async function getMyRideRequests(): Promise<RideRequestItem[]> {
  const res = await authorizedFetch(
    `${API_URL}/rider/ride_requests`
  );
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err.error || "Failed to fetch ride requests");
  }
  const data = await res.json();
  return (data.requests ?? []) as RideRequestItem[];
}