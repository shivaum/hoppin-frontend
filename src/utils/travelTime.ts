import { GOOGLE_MAPS_API_KEY } from '@env';

export interface TravelTimeResult {
  durationInSeconds: number;
  estimatedArrival: string; // ISO string
}

/**
 * Calculate estimated travel time and arrival time using Google Distance Matrix API
 * @param origin - Start location (address string)
 * @param destination - End location (address string)  
 * @param departureTime - Departure time as ISO string
 * @returns Promise<TravelTimeResult | null>
 */
export async function calculateTravelTime(
  origin: string,
  destination: string,
  departureTime: string
): Promise<TravelTimeResult | null> {
  // Validate inputs
  if (!origin || !destination || !departureTime || !GOOGLE_MAPS_API_KEY) {
    return null;
  }
  try {
    // Convert departure time to timestamp for traffic-aware routing
    const departureTimestamp = Math.floor(new Date(departureTime).getTime() / 1000);
    
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?` +
      `origins=${encodeURIComponent(origin)}&` +
      `destinations=${encodeURIComponent(destination)}&` +
      `departure_time=${departureTimestamp}&` +
      `traffic_model=best_guess&` +
      `key=${GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      console.warn('Distance Matrix API error:', data.status);
      return null;
    }

    const element = data.rows?.[0]?.elements?.[0];
    if (!element || element.status !== 'OK') {
      console.warn('No route found between locations');
      return null;
    }

    // Use duration_in_traffic if available (more accurate), fallback to duration
    const duration = element.duration_in_traffic || element.duration;
    if (!duration) {
      console.warn('No duration information available');
      return null;
    }

    const durationInSeconds = duration.value;
    const departureDate = new Date(departureTime);
    const arrivalDate = new Date(departureDate.getTime() + durationInSeconds * 1000);

    return {
      durationInSeconds,
      estimatedArrival: arrivalDate.toISOString(),
    };
  } catch (error) {
    console.error('Error calculating travel time:', error);
    return null;
  }
}

/**
 * Format duration in seconds to human readable string
 * @param seconds - Duration in seconds
 * @returns Formatted string like "1h 30m" or "45m"
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`.trim();
  }
  return `${minutes}m`;
}