// Utility functions for consistent date/time handling across the app
// All functions handle local timezone properly to avoid UTC conversion issues

/**
 * Parse ISO string as local time (not UTC)
 * Handles both timezone-aware and timezone-naive ISO strings
 */
export const parseAsLocalTime = (isoString: string): Date => {
  // If the ISO string doesn't have timezone info, treat it as local time
  if (!isoString.includes('Z') && !isoString.includes('+') && !isoString.includes('-', 10)) {
    // Parse as local time by treating it as if it's in local timezone
    return new Date(isoString);
  }
  // If it has timezone info, we want to display it as the time it represents locally
  // So we just parse it normally - the browser will handle timezone conversion
  return new Date(isoString);
};

/**
 * Format date for API - creates ISO string that represents local time
 */
export const formatDateForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  // Return local time in ISO format (without timezone offset)
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

/**
 * Format date from ISO string for display (short format: "Jan 15")
 */
export const formatDateShort = (iso: string): string => {
  const date = parseAsLocalTime(iso);
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

/**
 * Format time from ISO string for display (24-hour format: "14:30" or "2:30 PM")
 */
export const formatTime = (iso: string): string => {
  const date = parseAsLocalTime(iso);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Format date from ISO string for display (long format: "January 15")  
 */
export const formatDateLong = (iso: string): string => {
  const date = parseAsLocalTime(iso);
  return date.toLocaleDateString([], { month: 'long', day: 'numeric' });
};

/**
 * Format time from ISO string for display (12-hour format: "2:30 pm")
 */
export const formatTime12Hour = (iso: string): string => {
  const date = parseAsLocalTime(iso);
  return date.toLocaleTimeString([], { 
    hour: 'numeric', 
    minute: '2-digit'
  }).toLowerCase();
};