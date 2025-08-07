import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import Toast from "react-native-toast-message";

import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../hooks/useSocket";
import { useConversationSocket } from "../hooks/useConversationSocket";
import ConversationList from "../components/messages/ConversationList";
import ChatWindow from "../components/messages/ChatWindow";
import MessageInput from "../components/messages/MessageInput";
import { fetchMessagesWith, fetchUserConversations } from "../integrations/hopin-backend/messaging";

export default function Messages() {
  const { user } = useAuth();
  const socket = useSocket();

  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    fetchUserConversations()
      .then(setConversations)
      .catch(() =>
        Toast.show({
          type: "error",
          text1: "Error loading conversations",
          text2: "Unable to load your conversations.",
        })
      );
  }, []);

  useEffect(() => {
    if (!selectedConv || !user) return;

    fetchMessagesWith(selectedConv.otherUser.id, selectedConv.rideId)
      .then(setMessages)
      .catch(() =>
        Toast.show({
          type: "error",
          text1: "Error loading messages",
          text2: "Unable to load conversation history.",
        })
      );
  }, [selectedConv, user]);

  useConversationSocket({
    socket,
    rideId: selectedConv?.rideId ?? undefined,
    userId: user?.id ?? undefined,
    otherUserId: selectedConv?.otherUser?.id ?? undefined,
    onReceive: (msg) => setMessages((prev) => [...prev, msg]),
  });

  const handleSend = () => {
    if (!socket || !user || !selectedConv || !newMessage.trim()) return;

    socket.emit("send_message", {
      to: selectedConv.otherUser.id,
      ride_id: selectedConv.rideId,
      message: newMessage.trim(),
    });
    setNewMessage("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.body}>
        <View style={styles.sidebar}>
          <ConversationList
            conversations={conversations}
            selected={selectedConv}
            onSelect={setSelectedConv}
          />
        </View>
        <KeyboardAvoidingView
          style={styles.chatArea}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {user && selectedConv ? (
            <>
              <ChatWindow user={user} conversation={selectedConv} messages={messages} />
              <MessageInput
                value={newMessage}
                onChange={setNewMessage}
                onSend={handleSend}
              />
            </>
          ) : (
            <View style={styles.empty}>
              <Text style={{ color: "#999" }}>Select a conversation to start messaging.</Text>
            </View>
          )}
        </KeyboardAvoidingView>
      </View>
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  body: { flex: 1, flexDirection: "row" },
  sidebar: { width: 100, borderRightWidth: 1, borderRightColor: "#ddd" },
  chatArea: { flex: 1, justifyContent: "flex-end" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
});