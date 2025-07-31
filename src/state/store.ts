import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "./chat/chatSlice";
import rideReducer from "./rides/ridesSlice"

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    rides: rideReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;