// src/screens/OfferRide/utils/validation.ts
import type { LatLng } from '../../../components/common/inputs/UnifiedLocationInput';

/**
 * Validation utilities for OfferRide form
 */

/**
 * Check if selected date/time is in the future
 */
export function isDateTimeInFuture(departureDate: Date): boolean {
  const now = new Date();
  return departureDate > now;
}

/**
 * Validate that all required ride fields are filled and valid
 */
export function canSubmitRide(
  pickup: LatLng | null,
  dropoff: LatLng | null,
  dateISO: string | null,
  pickupText: string,
  dropoffText: string,
  availableSeats: string,
  pricePerSeat: string,
  departureDate: Date
): boolean {
  // Check all fields are present
  if (!pickup || !dropoff || !dateISO || !pickupText || !dropoffText || !availableSeats || !pricePerSeat) {
    return false;
  }

  // Validate numeric fields
  const seats = Number(availableSeats);
  const price = Number(pricePerSeat);
  if (seats <= 0 || price <= 0) {
    return false;
  }

  // Validate date is in future
  return isDateTimeInFuture(departureDate);
}

/**
 * Get next closest hour from current time
 */
export function getNextHour(): Date {
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setHours(now.getHours() + 1, 0, 0, 0);
  return nextHour;
}

/**
 * Format date to ISO string for date field (YYYY-MM-DD)
 */
export function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}