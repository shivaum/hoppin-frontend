// src/screens/SearchRides/utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const MAX_RECENTS = 4;

/**
 * Storage utilities for managing recent searches
 */

/**
 * Get storage key for user's recent searches
 */
export function getRecentsKey(userId: string | undefined): string {
  return `search_recents_v2_${userId || 'guest'}`;
}

/**
 * Load recent searches from AsyncStorage
 */
export async function loadRecentSearches(userId: string | undefined): Promise<string[]> {
  try {
    const key = getRecentsKey(userId);
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Failed to load recent searches:', error);
    return [];
  }
}

/**
 * Save a search term to recent searches
 */
export async function saveRecentSearch(
  value: string,
  userId: string | undefined,
  currentRecents: string[]
): Promise<string[]> {
  const trimmed = value.trim();
  if (!trimmed || !userId) {
    return currentRecents;
  }

  try {
    // Add to top, remove duplicates, limit to MAX_RECENTS
    const updated = [trimmed, ...currentRecents.filter((x) => x !== trimmed)].slice(0, MAX_RECENTS);
    const key = getRecentsKey(userId);
    await AsyncStorage.setItem(key, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Failed to save recent search:', error);
    return currentRecents;
  }
}