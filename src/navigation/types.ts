export type RootStackParamList = {
  Auth: undefined;
  Login: undefined;
  Signup: undefined;
  Onboarding: undefined;
  Splash: undefined;
  MainStack: undefined; // contains tabs + RideDetails
};

// Normalized, single source-of-truth params for RideDetails
export type RideDetailsParams = {
  mode: 'search' | 'rider' | 'driver';
  rideId: string;

  driverName: string;
  start: { latitude: number; longitude: number; address: string };
  end:   { latitude: number; longitude: number; address: string };

  departureISO: string;
  pricePerSeat: number;
  availableSeats: number;

  status?: 'pending' | 'accepted' | 'declined' | 'available';
  requestId?: string;
};


export type EditRide = {
  rideId: string;
  start_address: string;
  end_address: string;
  start_lat?: number;
  start_lng?: number;
  end_lat?: number;
  end_lng?: number;
  departureISO: string;
  price_per_seat?: number;
  requests?: Array<{
    id: string;
    rider: { name: string; photo?: string; rating?: number };
  }>;
};

// MainStack that hosts tabs + RideDetails + Driver Verification
export type MainStackParamList = {
  Tabs: undefined;
  RideDetails: RideDetailsParams;
  DriverVerificationRequirements: undefined;
  DriverVerificationUpload: undefined;
  OfferRide: undefined;
  EditRide: EditRide;
}

// Bottom tabs
export type TabParamList = {
  'Find Ride': undefined;
  'My Rides': undefined;
  Messages: undefined;
  Profile: undefined;
};