export type RootStackParamList = {
  Auth: undefined;
  Login: undefined;
  Signup: undefined;
  Onboarding: undefined;
  Splash: undefined;
  MainStack: undefined; // contains tabs + RideDetails
};

// Strict navigation contracts - screens fetch their own data
// Only IDs and minimal context should be passed via navigation

export type RideDetailsParams = {
  rideId: string;
  source?: 'search' | 'rider' | 'driver'; // Context of where user navigated from
};

export type EditRideParams = {
  rideId: string; // Only ID - screen fetches all data
};

export type ChatParams = {
  rideId: string;
  otherUserId: string; // Only IDs - screen fetches conversation metadata
};

// MainStack that hosts tabs + RideDetails + Driver Verification
export type MainStackParamList = {
  Tabs: undefined;
  RideDetails: RideDetailsParams;
  Chat: ChatParams;
  DriverVerificationRequirements: undefined;
  DriverVerificationUpload: undefined;
  OfferRide: undefined;
  EditRide: EditRideParams;
}

// Bottom tabs
export type TabParamList = {
  'Find Ride': undefined;
  'My Rides': undefined;
  Messages: undefined;
  Profile: undefined;
};