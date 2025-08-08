import React from "react";
import { View, Text, TextInput, StyleSheet, Button, Platform } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Toast from "react-native-toast-message";
import { useAuth } from "../../contexts/AuthContext";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/types";
import { StackNavigationProp } from "@react-navigation/stack";

type AuthScreenNavProp = StackNavigationProp<RootStackParamList, "Auth">;

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const { signIn } = useAuth();
  const navigation = useNavigation<AuthScreenNavProp>();

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await signIn(data.email, data.password);
      Toast.show({ type: "success", text1: "Login successful", text2: "Welcome back to Hopin SLO" });
      navigation.getParent()?.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Main' }],
              })
            );
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Login failed",
        text2: error.message || "Check your credentials and try again",
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to your account</Text>

      <View style={styles.inputGroup}>
        <Text>Email</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="you@calpoly.edu"
              keyboardType="email-address"
              autoCapitalize="none"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text>Password</Text>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}
      </View>

      <Button title="Sign In" onPress={handleSubmit(onSubmit)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 10 },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  subtitle: { fontSize: 16, textAlign: "center", marginBottom: 20 },
  inputGroup: { marginBottom: 15 },
  input: {
    height: 48,
    borderColor: "#ccc",
    borderWidth: 1,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  error: { color: "red", fontSize: 12, marginTop: 4 },
});