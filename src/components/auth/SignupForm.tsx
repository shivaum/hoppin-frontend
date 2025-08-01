import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../contexts/AuthContext";
import { RootStackParamList } from "../../navigation/types";
import { StackNavigationProp } from "@react-navigation/stack";

type AuthScreenNavProp = StackNavigationProp<RootStackParamList, "Auth">;

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z
    .string()
    .email("Invalid email")
    .refine((email) => email.endsWith(".edu"), {
      message: "Email must end with .edu",
    }),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(7, "Enter a valid phone number"),
  photo: z
    .any()
    .refine((file) => file && file.uri, { message: "Profile photo is required" }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupForm() {
  const { signUp } = useAuth();
  const navigation = useNavigation<AuthScreenNavProp>();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      photo: null,
    },
  });

  const selectPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Toast.show({
        type: "error",
        text1: "Permission denied",
        text2: "Access to photo library is required.",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const selected = result.assets[0];
      setValue("photo", selected);
      setPhotoPreview(selected.uri);
    }
  };

  const onSubmit = async (data: SignupFormValues) => {
    try {
      await signUp(data.email, data.password, data.name, data.phone, data.photo);
      Toast.show({
        type: "success",
        text1: "Account created!",
        text2: "Welcome to Hopin SLO",
      });
      navigation.replace("Main");
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Signup failed",
        text2: error.message || "Try again with different credentials",
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join the Cal Poly rideshare community</Text>

      <View style={styles.inputGroup}>
        <Text>Name</Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
            />
          )}
        />
        {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text>Email (.edu)</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="you@university.edu"
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={onChange}
              onBlur={onBlur}
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
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
            />
          )}
        />
        {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text>Phone</Text>
        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="(805) 555-0123"
              keyboardType="phone-pad"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
            />
          )}
        />
        {errors.phone && <Text style={styles.error}>{errors.phone.message}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text>Profile Photo</Text>
        <TouchableOpacity style={styles.uploadButton} onPress={selectPhoto}>
          <Text style={{ color: "white" }}>Upload Photo</Text>
        </TouchableOpacity>
        {photoPreview && (
          <Image source={{ uri: photoPreview }} style={styles.preview} />
        )}
        {errors.photo && (
          <Text style={styles.error}>{errors.photo.message?.toString()}</Text>
        )}
      </View>

      <Button title="Create Account" onPress={handleSubmit(onSubmit)} />
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
  uploadButton: {
    backgroundColor: "#3b82f6",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 8,
  },
  preview: { width: 100, height: 100, marginTop: 10, borderRadius: 8 },
  error: { color: "red", fontSize: 12, marginTop: 4 },
});