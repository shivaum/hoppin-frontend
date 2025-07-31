import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchMessagesWith, fetchUserConversations } from "../../integrations/hopin-backend/messaging";
import type { Message, Conversation } from "../../types";

export const loadConversations = createAsyncThunk("chat/loadConversations", async () => {
  return await fetchUserConversations();
});

export const loadMessages = createAsyncThunk(
  "chat/loadMessages",
  async ({ userId, rideId }: { userId: string; rideId: string }) => {
    return await fetchMessagesWith(userId, rideId);
  }
);

interface ChatState {
  conversations: Conversation[];
  messages: Message[];
  activeConversation: Conversation | null;
  loading: boolean;
}

const initialState: ChatState = {
  conversations: [],
  messages: [],
  activeConversation: null,
  loading: false,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setActiveConversation(state, action) {
      state.activeConversation = action.payload;
    },
    appendMessage(state, action) {
      state.messages.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadConversations.fulfilled, (state, action) => {
        state.conversations = action.payload;
      })
      .addCase(loadMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadMessages.fulfilled, (state, action) => {
        state.messages = action.payload;
        state.loading = false;
      })
      .addCase(loadMessages.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { setActiveConversation, appendMessage } = chatSlice.actions;
export default chatSlice.reducer;