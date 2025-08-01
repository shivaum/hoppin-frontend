import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  NativeSyntheticEvent,
  TextInputSubmitEditingEventData,
} from "react-native";
import { Feather } from "@expo/vector-icons";

type Props = {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
};

export default function MessageInput({ value, onChange, onSend }: Props) {
  const handleSubmit = (
    e: NativeSyntheticEvent<TextInputSubmitEditingEventData>
  ) => {
    if (value.trim()) {
      onSend();
      Keyboard.dismiss();
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Type a message..."
        style={styles.input}
        onSubmitEditing={handleSubmit}
        blurOnSubmit={false}
        returnKeyType="send"
      />
      <TouchableOpacity
        onPress={onSend}
        disabled={!value.trim()}
        style={styles.button}
      >
        <Feather name="send" size={20} color={value.trim() ? "#007AFF" : "#ccc"} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 12,
    marginRight: 8,
  },
  button: {
    padding: 8,
  },
});