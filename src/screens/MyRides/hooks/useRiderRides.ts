// src/screens/MyRides/hooks/useRiderRides.ts
import { useState, useEffect, useCallback } from 'react';
import type { RideRequestItem } from '../../../types';
import { ridesService } from '../services/ridesService';

interface UseRiderRidesReturn {
  requests: RideRequestItem[];
  loading: boolean;
  refreshing: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Custom hook for managing rider ride requests
 * Handles fetching and refreshing ride requests
 */
export function useRiderRides(): UseRiderRidesReturn {
  const [requests, setRequests] = useState<RideRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setError(null);
      const data = await ridesService.fetchRiderRides();
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch ride requests'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Refresh handler for pull-to-refresh
  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchRequests();
    } finally {
      setRefreshing(false);
    }
  }, [fetchRequests]);

  return {
    requests,
    loading,
    refreshing,
    error,
    refresh,
  };
}