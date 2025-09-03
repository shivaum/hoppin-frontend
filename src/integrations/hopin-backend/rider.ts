import { authorizedFetch } from "./utils/authFetch";
import {
  SearchRide,
  RequestRidePayload,
  RideRequestItem,
  AdvancedSearchParams,
  AdvancedSearchResponse,
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

/**
 * Advanced search with geospatial, relevance scoring, and analytics
 */
export async function advancedSearchRides(
  params: AdvancedSearchParams
): Promise<AdvancedSearchResponse> {
  const res = await authorizedFetch(`${API_URL}/rider/search_rides/advanced`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err.error || "Failed to perform advanced search");
  }
  
  return res.json();
}

/**
 * Get detailed information about a specific ride
 */
export async function getRideDetails(rideId: string): Promise<{
  ride: {
    id: string;
    driver_id: string;
    start_location: string;
    end_location: string;
    departure_time: string;
    available_seats: number;
    price_per_seat: number;
    status: string;
    start_lat?: number;
    start_lng?: number;
    end_lat?: number;
    end_lng?: number;
    created_at: string;
  };
  driver: {
    id: string;
    name: string;
    photo: string | null;
    rating: number;
    total_rides: number;
    phone?: string | null;
  };
  user_request?: {
    id: string;
    status: string;
    message: string;
    created_at: string;
    pickup?: {
      use_driver: boolean;
      location: string | null;
      lat: number | null;
      lng: number | null;
    };
    dropoff?: {
      use_driver: boolean;
      location: string | null;
      lat: number | null;
      lng: number | null;
    };
  };
}> {
  const res = await authorizedFetch(`${API_URL}/rider/ride/${rideId}/details`);
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to get ride details');
  }
  
  return res.json();
}