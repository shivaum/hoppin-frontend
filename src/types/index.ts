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
