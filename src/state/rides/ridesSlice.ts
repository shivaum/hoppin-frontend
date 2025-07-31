import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getMyDriverRides } from '../../integrations/hopin-backend/driver';
import type { DriverRide, RideRequestItem } from '../../types';
import { getMyRideRequests } from '../../integrations/hopin-backend/rider';

export interface RidesState {
  driverRides: DriverRide[];
  riderRequests: RideRequestItem[];
  loading: boolean;
  error: string | null;
}

const initialState: RidesState = {
  driverRides: [],
  riderRequests: [],
  loading: false,
  error: null,
};

export const fetchDriverRides = createAsyncThunk('rides/fetchDriverRides', async () => {
  return await getMyDriverRides();
});

export const fetchRiderRequests = createAsyncThunk('rides/fetchRiderRequests', async () => {
  return await getMyRideRequests();
});

const ridesSlice = createSlice({
  name: 'rides',
  initialState,
  reducers: {
    updateRequestStatus: (state, action) => {
      const { requestId, newStatus } = action.payload;
      state.driverRides = state.driverRides.map((ride) => ({
        ...ride,
        requests: ride.requests.map((r) =>
          r.id === requestId ? { ...r, status: newStatus } : r
        ),
      }));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDriverRides.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDriverRides.fulfilled, (state, action) => {
        state.driverRides = action.payload;
        state.loading = false;
      })
      .addCase(fetchDriverRides.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Error loading driver rides';
      })
      .addCase(fetchRiderRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRiderRequests.fulfilled, (state, action) => {
        state.riderRequests = action.payload;
        state.loading = false;
      })
      .addCase(fetchRiderRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Error loading rider requests';
      });
  },
});

export const { updateRequestStatus } = ridesSlice.actions;
export default ridesSlice.reducer;