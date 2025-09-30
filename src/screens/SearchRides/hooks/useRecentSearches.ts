// src/screens/SearchRides/hooks/useRecentSearches.ts
import { useState, useEffect, useCallback } from 'react';
import { loadRecentSearches, saveRecentSearch } from '../utils/storage';

interface UseRecentSearchesReturn {
  recents: string[];
  showRecents: boolean;
  setShowRecents: (show: boolean) => void;
  saveRecent: (value: string) => Promise<void>;
}

/**
 * Custom hook for managing recent searches with AsyncStorage
 */
export function useRecentSearches(userId: string | undefined): UseRecentSearchesReturn {
  const [recents, setRecents] = useState<string[]>([]);
  const [showRecents, setShowRecents] = useState(true);

  // Load recents on mount and when user changes
  useEffect(() => {
    if (!userId) return;

    (async () => {
      const loaded = await loadRecentSearches(userId);
      setRecents(loaded);
    })();
  }, [userId]);

  // Clear recents when user changes
  useEffect(() => {
    setRecents([]);
  }, [userId]);

  // Save a new recent search
  const saveRecent = useCallback(
    async (value: string) => {
      if (!userId) return;
      const updated = await saveRecentSearch(value, userId, recents);
      setRecents(updated);
    },
    [userId, recents]
  );

  return {
    recents,
    showRecents,
    setShowRecents,
    saveRecent,
  };
}