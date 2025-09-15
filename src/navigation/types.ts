export type RootStackParamList = {
  Auth: undefined;
  Login: undefined;
  Signup: undefined;
  Onboarding: undefined;
  Splash: undefined;
  MainStack: undefined; // contains tabs + RideDetails
};

// Simplified params for RideDetails - now fetches data via API
export type RideDetailsParams = {
  rideId: string;
  source?: 'search' | 'rider' | 'driver'; // Context of where user navigated from
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
  available_seats?: number;
  requests?: Array<{
    id: string;
    rider: { name: string; photo?: string; rating?: number };
  }>;
};

// MainStack that hosts tabs + RideDetails + Driver Verification
export type MainStackParamList = {
  Tabs: undefined;
  RideDetails: RideDetailsParams;
  Chat: {
    conversation: {
      id: string;
      otherUser: {
        id: string;
        name: string;
        photo?: string;
      };
      ride: {
        id: string;
        departure_time: string;
        start_location: string;
        end_location: string;
      };
      lastMessage: {
        content: string;
        created_at: string;
      };
      status: 'confirmed' | 'pending' | 'cancelled';
      userRole: 'driver' | 'rider';
    };
  };
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