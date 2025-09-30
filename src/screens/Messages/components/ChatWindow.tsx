import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from "react-native";
import { colors } from '../../../constants/colors';
import type { Conversation, Message, User } from "../../../types";

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
    backgroundColor: colors.primary.purple,
  },
  receiver: {
    backgroundColor: colors.neutral.gray100,
  },
  senderText: {
    color: colors.neutral.white,
    fontSize: 16,
  },
  receiverText: {
    color: colors.neutral.gray900,
    fontSize: 16,
  },
});