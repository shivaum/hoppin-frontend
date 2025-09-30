// src/screens/MyRides/hooks/useDriverRides.ts
import { useState, useEffect, useCallback } from 'react';
import type { DriverRide } from '../../../types';
import { ridesService } from '../services/ridesService';

interface UseDriverRidesReturn {
  rides: DriverRide[];
  loading: boolean;
  refreshing: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  handleAcceptRequest: (requestId: string) => Promise<void>;
  handleDeclineRequest: (requestId: string) => Promise<void>;
}

/**
 * Custom hook for managing driver rides
 * Handles fetching, refreshing, and request actions
 */
export function useDriverRides(refreshTrigger?: number): UseDriverRidesReturn {
  const [rides, setRides] = useState<DriverRide[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRides = useCallback(async () => {
    try {
      setError(null);
      const data = await ridesService.fetchDriverRides();
      setRides(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch rides'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchRides();
  }, [fetchRides, refreshTrigger]);

  // Refresh handler for pull-to-refresh
  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchRides();
    } finally {
      setRefreshing(false);
    }
  }, [fetchRides]);

  // Accept a ride request and refresh data
  const handleAcceptRequest = useCallback(async (requestId: string) => {
    try {
      await ridesService.acceptRequest(requestId);
      await fetchRides();
    } catch (err) {
      console.error('Failed to accept request:', err);
      throw err;
    }
  }, [fetchRides]);

  // Decline a ride request and refresh data
  const handleDeclineRequest = useCallback(async (requestId: string) => {
    try {
      await ridesService.declineRequest(requestId);
      await fetchRides();
    } catch (err) {
      console.error('Failed to decline request:', err);
      throw err;
    }
  }, [fetchRides]);

  return {
    rides,
    loading,
    refreshing,
    error,
    refresh,
    handleAcceptRequest,
    handleDeclineRequest,
  };
}