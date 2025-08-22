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

// MainStack that hosts tabs + RideDetails + Driver Verification
export type MainStackParamList = {
  Tabs: undefined;
  RideDetails: RideDetailsParams;
  DriverVerificationRequirements: undefined;
  DriverVerificationUpload: undefined;
};

// Bottom tabs
export type TabParamList = {
  'Find Ride': undefined;
  'Offer Ride': undefined;
  'My Rides': undefined;
  Messages: undefined;
  Profile: undefined;
};