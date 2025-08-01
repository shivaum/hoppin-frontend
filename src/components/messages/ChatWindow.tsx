import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from "react-native";
import type { Conversation, Message, User } from "../../types";

type Props = {
  user: User;
  conversation: Conversation;
  messages: Message[];
};

export default function ChatWindow({ user, conversation, messages }: Props) {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <ScrollView
      ref={scrollViewRef}
      contentContainerStyle={styles.scrollContent}
      style={styles.scrollContainer}
    >
      {messages.map((msg, idx) => {
        const isSender = msg.sender_id === user.id;

        return (
          <View
            key={idx}
            style={[
              styles.messageContainer,
              isSender ? styles.alignRight : styles.alignLeft,
            ]}
          >
            <View style={[styles.messageBubble, isSender ? styles.sender : styles.receiver]}>
              <Text style={isSender ? styles.senderText : styles.receiverText}>
                {msg.content}
              </Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageContainer: {
    marginVertical: 4,
    flexDirection: "row",
  },
  alignRight: {
    justifyContent: "flex-end",
  },
  alignLeft: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  sender: {
    backgroundColor: "#2f95dc", // your primary color
  },
  receiver: {
    backgroundColor: "#e5e5ea",
  },
  senderText: {
    color: "white",
    fontSize: 14,
  },
  receiverText: {
    color: "#333",
    fontSize: 14,
  },
});