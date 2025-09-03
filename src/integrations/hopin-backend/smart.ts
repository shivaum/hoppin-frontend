import { authorizedFetch } from "./utils/authFetch";
import {
  LocationSuggestion,
  PopularRoute,
  PersonalizedSuggestions,
  SearchAnalytics,
  TrendingRoute,
  PricingInsights,
  RideOptimization,
  DashboardSummary,
} from "../../types";
import { API_URL } from '@env';

async function safeJson(res: Response): Promise<any> {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

/**
 * Get location autocomplete suggestions with personalization
 */
export async function getLocationSuggestions(
  query: string,
  limit: number = 10
): Promise<{ suggestions: LocationSuggestion[]; query: string; total_results: number }> {
  const url = `${API_URL}/smart/locations/autocomplete?q=${encodeURIComponent(query)}&limit=${limit}`;
  
  const res = await authorizedFetch(url);
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err.error || "Failed to get location suggestions");
  }
  
  return res.json();
}

/**
 * Get popular routes with optional filtering
 */
export async function getPopularRoutes(
  limit: number = 10,
  days: number = 30,
  fromLocation?: string
): Promise<{ popular_routes: PopularRoute[]; filters: any; total_results: number }> {
  let url = `${API_URL}/smart/routes/popular?limit=${limit}&days=${days}`;
  if (fromLocation) {
    url += `&from=${encodeURIComponent(fromLocation)}`;
  }
  
  const res = await authorizedFetch(url);
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err.error || "Failed to get popular routes");
  }
  
  return res.json();
}

/**
 * Get personalized search suggestions based on user history
 */
export async function getPersonalizedSuggestions(
  limit: number = 5
): Promise<PersonalizedSuggestions> {
  const url = `${API_URL}/smart/suggestions/personal?limit=${limit}`;
  
  const res = await authorizedFetch(url);
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err.error || "Failed to get personalized suggestions");
  }
  
  return res.json();
}

/**
 * Get user search analytics
 */
export async function getSearchAnalytics(
  days: number = 30
): Promise<SearchAnalytics> {
  const url = `${API_URL}/smart/analytics/search?days=${days}`;
  
  const res = await authorizedFetch(url);
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err.error || "Failed to get search analytics");
  }
  
  return res.json();
}

/**
 * Get trending routes with advanced analytics
 */
export async function getTrendingRoutes(
  limit: number = 10,
  days: number = 7,
  includeMetrics: boolean = false
): Promise<{ trending_routes: TrendingRoute[]; period_days: number; total_results: number }> {
  const url = `${API_URL}/smart/routes/trending?limit=${limit}&days=${days}&include_metrics=${includeMetrics}`;
  
  const res = await authorizedFetch(url);
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err.error || "Failed to get trending routes");
  }
  
  return res.json();
}

/**
 * Get dynamic pricing insights for a route
 */
export async function getPricingInsights(
  fromLocation: string,
  toLocation: string,
  days: number = 30
): Promise<PricingInsights> {
  const params = new URLSearchParams({
    from: fromLocation,
    to: toLocation,
    days: days.toString(),
  });
  
  const url = `${API_URL}/smart/pricing/insights?${params}`;
  
  const res = await authorizedFetch(url);
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err.error || "Failed to get pricing insights");
  }
  
  return res.json();
}

/**
 * Get ride optimization recommendations (for drivers and route planning)
 */
export async function optimizeRide(params: {
  from: string;
  to?: string;
  departure_date?: string;
  ride_id?: string;
}): Promise<RideOptimization> {
  const res = await authorizedFetch(`${API_URL}/smart/rides/optimize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err.error || "Failed to get ride optimization");
  }
  
  return res.json();
}

/**
 * Get comprehensive dashboard summary
 */
export async function getDashboardSummary(
  days: number = 7
): Promise<DashboardSummary> {
  const url = `${API_URL}/smart/dashboard/summary?days=${days}`;
  
  const res = await authorizedFetch(url);
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err.error || "Failed to get dashboard summary");
  }
  
  return res.json();
}