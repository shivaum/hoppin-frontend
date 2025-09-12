/** ------------------------------------------------------------------------
 *  Authenticated user
 *  ------------------------------------------------------------------------ */
export interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
  rating: number;
  total_rides: number;
  is_driver: boolean;
  phone?: string;
  is_onboarded?: boolean;
}


/** Matches the raw ride objects returned by /rider/search_rides */
export interface SearchRide {
  ride_id: string;
  driver_id: string;
  start_location: string;
  end_location: string;
  departure_time: string;
  available_seats: number;
  price_per_seat: number;
  status: string;
  my_request_status: string | null; // null | "pending" | "accepted" | "rejected" | "declined"
  driver: {
    id?: string;
    name: string;
    photo: string | null;
    rating: number;
    total_rides?: number;
  };
}

/** ------------------------------------------------------------------------
 *  UI-level Ride (used in SearchRides, RideCard, etc)
 *  ------------------------------------------------------------------------ */
export interface Ride {
  id: string;
  driverId?: string;          // only present on search results
  startLocation: string;
  endLocation: string;
  departureTime: string;
  availableSeats: number;
  pricePerSeat: number;
  status: string;
  requests: any[];            // driver-side requests are rendered in MyRides only
  driver: {
    id?: string;              // if you ever need it
    profileId?: string;
    name: string;
    photo: string | null;
    rating: number;
    totalRides: number;
  };
}

/** ------------------------------------------------------------------------
 *  Payload when offering a ride (driver → POST /driver/offer_ride)
 *  ------------------------------------------------------------------------ */
export interface CreateRidePayload {
  startLocation: string;
  endLocation: string;
  departureTime: string;  // ISO string
  availableSeats: number;
  pricePerSeat: number;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  status: "available" | "full" | "completed" | "cancelled" | "scheduled";
}

/** ------------------------------------------------------------------------
 *  What the driver “my_scheduled_rides” endpoint returns
 *  ------------------------------------------------------------------------ */
export interface DriverRideRequest {
  id: string;
  status: "pending" | "accepted" | "declined" | "rejected";
  message: string | null;
  created_at: string;           // ISO
  rider: {
    id: string;
    name: string;
    photo: string | null;
    rating: number;
    total_rides: number;
  };
}

export interface DriverRide {
  id: string;
  start_location: string;
  end_location: string;
  departure_time: string;       // ISO
  available_seats: number;
  price_per_seat: number;
  status: string;
  requests: DriverRideRequest[];
}

/** ------------------------------------------------------------------------
 *  Payload when requesting a ride (rider → POST /rider/request_ride)
 *  ------------------------------------------------------------------------ */
export interface RequestRidePayload {
  ride_id: string;
  message?: string;
  use_driver_pickup?: boolean;
  use_driver_dropoff?: boolean;
  rider_pickup_location?: string;
  rider_pickup_lat?: number;
  rider_pickup_lng?: number;
  rider_dropoff_location?: string;
  rider_dropoff_lat?: number;
  rider_dropoff_lng?: number;
}

/** ------------------------------------------------------------------------
 *  What rider “ride_requests” returns
 *  ------------------------------------------------------------------------ */
export interface RideRequestItem {
  request_id: string;
  ride_id: string;
  start_location: string;
  end_location: string;
  departure_time: string;       // ISO
  status: "pending" | "accepted" | "declined" | "rejected";
  driver_name: string;
  driver_photo: string | null;
  driver_rating: number;
  driver_total_rides: number;
  price_per_seat: number;
  available_seats: number;
  pickup: {
    use_driver: boolean;
    location: string | null;
    lat: number | null;
    lng: number | null;
  };
  dropoff: {
    use_driver: boolean;
    location: string | null;
    lat: number | null;
    lng: number | null;
  };
}

/** ------------------------------------------------------------------------
 *  (Optional) what “my_pending_rides” returns for a rider
 *  ------------------------------------------------------------------------ */
export interface PendingRide {
  ride_id: string;
  start_location: string;
  end_location: string;
  departure_time: string;       // ISO
  price_per_seat: number;
  status: string;
  driver: {
    name: string;
    phone: string | null;
    photo: string | null;
  };
  pickup: {
    use_driver: boolean;
    location: string | null;
    lat: number | null;
    lng: number | null;
  };
  dropoff: {
    use_driver: boolean;
    location: string | null;
    lat: number | null;
    lng: number | null;
  };
}

/** ------------------------------------------------------------------------
 *  UI-level “ride search” filters (if you ever need them)
 *  ------------------------------------------------------------------------ */
export interface RideSearch {
  startLocation: string;
  endLocation: string;
  departureDate?: string;
  maxPrice?: number;
}

export type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  ride_id: string;
  content: string;
  created_at: string; // ISO timestamp
};

export type Conversation = {
  id: string;
  rideId: string;
  otherUser: {
    id: string;
    name: string;
    photo?: string;
  };
};

/** ------------------------------------------------------------------------
 *  Enhanced Search Types for Phase 4
 *  ------------------------------------------------------------------------ */

/** Advanced search parameters */
export interface AdvancedSearchParams {
  from: string;
  to: string;
  from_lat?: number;
  from_lng?: number;
  to_lat?: number;
  to_lng?: number;
  date?: string;
  max_distance?: number; // miles
  min_seats?: number;
  sort_by?: 'relevance' | 'distance' | 'price' | 'departure_time';
  resolve_aliases?: boolean;
}

/** Enhanced search ride with relevance data */
export interface EnhancedSearchRide extends SearchRide {
  popularity_score: number;
  relevance_score?: number;
  distance_km?: number;
  distance_miles?: number;
  coordinates: {
    start_lat: number | null;
    start_lng: number | null;
    end_lat: number | null;
    end_lng: number | null;
  };
}

/** Advanced search response */
export interface AdvancedSearchResponse {
  rides: EnhancedSearchRide[];
  search_info: {
    total_results: number;
    search_params: {
      from: string;
      to: string;
      sort_by: string;
      max_distance: number;
      use_full_text: boolean;
    };
  };
  location_resolution?: {
    from_resolved: LocationResolution | null;
    to_resolved: LocationResolution | null;
  };
  search_quality?: {
    suggestions: SearchSuggestion[];
  };
}

/** Location resolution from aliases */
export interface LocationResolution {
  canonical_name: string;
  lat: number | null;
  lng: number | null;
  city?: string;
  state?: string;
  suggestions?: LocationSuggestion[];
}

/** Search improvement suggestions */
export interface SearchSuggestion {
  type: string;
  message: string;
  action: string;
}

/** Location autocomplete suggestion */
export interface LocationSuggestion {
  canonical_name: string;
  alias_name: string;
  display_name: string;
  coordinates: {
    lat: number | null;
    lng: number | null;
  };
  city?: string;
  state?: string;
  popularity: number;
  relevance_boost: number;
  user_searched: boolean;
}

/** Popular route */
export interface PopularRoute {
  from_location: string;
  to_location: string;
  search_count: number;
  ride_count: number;
  popularity_score: number;
  avg_price: number | null;
  avg_price_formatted: string;
  coordinates: {
    from_lat: number | null;
    from_lng: number | null;
    to_lat: number | null;
    to_lng: number | null;
  };
  recent_rides: number;
  trend: 'up' | 'stable' | 'down';
}

/** Trending route with metrics */
export interface TrendingRoute extends PopularRoute {
  metrics?: {
    rides_posted: number;
    avg_seats: number;
    price_range: {
      min: number;
      max: number;
    };
    driver_ratings: number[];
    avg_driver_rating: number;
    growth_rate: number;
  };
}

/** Personalized suggestions */
export interface PersonalizedSuggestions {
  frequent_searches: Array<{
    from_location: string;
    to_location: string;
    search_count: number;
    last_searched: string;
    avg_results: number;
  }>;
  trending_for_you: TrendingRoute[];
  quick_actions: Array<{
    type: string;
    title: string;
    from_location: string;
    to_location: string;
    coordinates: {
      from_lat: number | null;
      from_lng: number | null;
      to_lat: number | null;
      to_lng: number | null;
    };
  }>;
}

/** Search analytics */
export interface SearchAnalytics {
  total_searches: number;
  unique_routes: number;
  avg_results_per_search: number;
  popular_routes: Array<{
    route: string;
    count: number;
    avg_results: number;
  }>;
  search_patterns: {
    daily_activity: Array<{ date: string; searches: number }>;
    route_frequency: Array<{ route: string; count: number }>;
    hourly_activity: Array<{ hour: number; searches: number }>;
  };
  insights: Array<{
    type: string;
    message: string;
    icon: string;
  }>;
}

/** Pricing insights */
export interface PricingInsights {
  route: {
    from_location: string;
    to_location: string;
  };
  pricing: {
    average_price: number;
    price_range: {
      min: number;
      max: number;
    };
    price_distribution: {
      low: number;
      medium: number;
      high: number;
    };
    recommended_price: number;
  };
  market_analysis: {
    total_rides_posted: number;
    total_seats_available: number;
    search_demand: number;
    demand_supply_ratio: number;
    market_temperature: string;
    avg_seats_per_ride: number;
  };
  recommendations: Array<{
    type: string;
    message: string;
    confidence: string;
  }>;
  period_analyzed: string;
}

/** Ride optimization */
export interface RideOptimization {
  type: 'existing_ride' | 'route_planning';
  ride_id?: string;
  route?: {
    from_location: string;
    to_location: string;
    departure_date: string;
  };
  overall_score?: number;
  recommendation?: {
    level: string;
    message: string;
    action: string;
  };
  analysis?: {
    optimal_timing: any;
    competition: any;
    demand_forecast: any;
  };
  alternatives?: {
    suggestions: Array<{
      to_location: string;
      popularity_score: number;
      opportunity_score: number;
      search_count: number;
      estimated_price: string;
      competition_level: string;
      recommendation_reason: string;
    }>;
    message: string;
  };
  action_items?: Array<{
    category: string;
    priority: string;
    action: string;
    reason: string;
  }>;
  visibility_score?: number;
  recommendations?: Array<{
    type: string;
    message: string;
    priority: string;
  }>;
  overall_assessment?: string;
}

/** Dashboard summary */
export interface DashboardSummary {
  summary: {
    period_days: number;
    activity: {
      total_searches: number;
      unique_routes: number;
      avg_results: number;
    };
    search_patterns: Array<{
      from_location: string;
      to_location: string;
      search_count: number;
      last_searched: string;
      avg_results: number;
    }>;
    trending_routes: TrendingRoute[];
  };
  recommendations: Array<{
    type: string;
    title: string;
    message: string;
    action_data: {
      from: string;
      to: string;
    };
  }>;
  insights: Array<{
    type: string;
    icon: string;
    message: string;
    action: string;
  }>;
  quick_actions: Array<{
    type: string;
    title: string;
    description: string;
  }>;
}
