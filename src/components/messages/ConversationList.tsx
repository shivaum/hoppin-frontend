import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import type { Conversation } from "../../types";

type Props = {
  conversations: Conversation[];
  selected: Conversation | null;
  onSelect: (conv: Conversation) => void;
};

function getConvId(conv: Conversation) {
  return `${conv.rideId}-${conv.otherUser.id}`;
}

export default function ConversationList({ conversations, selected, onSelect }: Props) {
  const selectedId = selected ? getConvId(selected) : null;

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.listContainer}>
        {conversations.map((conv) => {
          const id = getConvId(conv);
          const isSelected = selectedId === id;
          const initial = conv.otherUser.name.charAt(0);

          return (
            <TouchableOpacity
              key={id}
              style={[styles.button, isSelected && styles.selectedButton]}
              onPress={() => onSelect(conv)}
            >
              <View style={styles.avatar}>
                {conv.otherUser.photo ? (
                  <Image
                    source={{ uri: conv.otherUser.photo }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarInitial}>{initial}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.name}>{conv.otherUser.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    paddingRight: 8,
  },
  listContainer: {
    paddingVertical: 8,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "transparent",
  },
  selectedButton: {
    backgroundColor: "#e0e0e0",
  },
  avatar: {
    height: 24,
    width: 24,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 12,
    backgroundColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    height: 24,
    width: 24,
    resizeMode: "cover",
  },
  avatarFallback: {
    alignItems: "center",
    justifyContent: "center",
    height: 24,
    width: 24,
  },
  avatarInitial: {
    fontSize: 12,
    color: "#fff",
  },
  name: {
    fontSize: 14,
  },
});