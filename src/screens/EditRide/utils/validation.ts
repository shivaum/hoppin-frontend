// src/screens/EditRide/utils/validation.ts

/**
 * Check if selected date/time is in the future
 */
export function isDateTimeInFuture(departureDate: Date): boolean {
  const now = new Date();
  return departureDate > now;
}

/**
 * Check if departure time is at least specified minutes in the future
 */
export function isAtLeastMinutesInFuture(departureDate: Date, minutes: number): boolean {
  const now = new Date();
  const timeDiffMinutes = (departureDate.getTime() - now.getTime()) / (1000 * 60);
  return timeDiffMinutes >= minutes;
}

/**
 * Check if any ride fields have changed from original values
 */
export function hasChanges(
  current: {
    pickup: string;
    dropoff: string;
    departureISO: string;
    availableSeats: string;
    pricePerSeat: string;
  },
  original: {
    pickup: string;
    dropoff: string;
    departureISO: string;
    availableSeats: string;
    pricePerSeat: string;
  }
): boolean {
  return (
    current.pickup !== original.pickup ||
    current.dropoff !== original.dropoff ||
    current.departureISO !== original.departureISO ||
    current.availableSeats !== original.availableSeats ||
    current.pricePerSeat !== original.pricePerSeat
  );
}