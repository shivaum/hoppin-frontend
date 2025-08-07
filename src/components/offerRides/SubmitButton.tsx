import React from 'react';
import { View, Button, StyleSheet } from 'react-native';

type Props = {
  title: string;
  onPress: () => void;
  disabled: boolean;
};

export default function SubmitButton({ title, onPress, disabled }: Props) {
  return (
    <View style={styles.wrapper}>
      <Button title={title} onPress={onPress} disabled={disabled} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: 20 },
});