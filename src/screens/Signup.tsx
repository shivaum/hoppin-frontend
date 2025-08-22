import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Toast from "react-native-toast-message";
import { CommonActions, useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../contexts/AuthContext";
import { RootStackParamList } from "../navigation/types";
import { StackNavigationProp } from "@react-navigation/stack";
import { colors } from "../constants/colors";
import LoadingSpinner from "../components/ui/LoadingSpinner";

type SignupScreenNavProp = StackNavigationProp<RootStackParamList, "Signup">;

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

export default function Signup() {
  const { signUp } = useAuth();
  const navigation = useNavigation<SignupScreenNavProp>();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
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
      Toast.show({ type: 'success', text1: 'Account created!', text2: 'Welcome to Hoppin' });
      navigation.getParent()?.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Onboarding' }],
        })
      );
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Signup failed', text2: error?.message ?? 'Try again' });
    }
  };

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={goBack}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join the student rideshare community</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.name && styles.inputError]}
                    placeholder="John Doe"
                    placeholderTextColor={colors.text.muted}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                )}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>School Email</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.email && styles.inputError]}
                    placeholder="you@university.edu"
                    placeholderTextColor={colors.text.muted}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                )}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.password && styles.inputError]}
                    placeholder="••••••••"
                    placeholderTextColor={colors.text.muted}
                    secureTextEntry
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                )}
              />
              {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.phone && styles.inputError]}
                    placeholder="(805) 555-0123"
                    placeholderTextColor={colors.text.muted}
                    keyboardType="phone-pad"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                )}
              />
              {errors.phone && <Text style={styles.errorText}>{errors.phone.message}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Profile Photo</Text>
              <TouchableOpacity style={styles.photoButton} onPress={selectPhoto}>
                {photoPreview ? (
                  <View style={styles.photoContainer}>
                    <Image source={{ uri: photoPreview }} style={styles.photoPreview} />
                    <View style={styles.photoOverlay}>
                      <Text style={styles.photoOverlayText}>Tap to change</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Text style={styles.photoPlaceholderText}>+</Text>
                    <Text style={styles.photoButtonText}>Add Profile Photo</Text>
                  </View>
                )}
              </TouchableOpacity>
              {errors.photo && (
                <Text style={styles.errorText}>{errors.photo.message?.toString()}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.signupButton, isSubmitting && styles.buttonDisabled]} 
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <View style={styles.buttonContent}>
                <LoadingSpinner size={20} color={colors.text.primary} />
                <Text style={[styles.signupButtonText, styles.loadingText]}>
                  Creating Account...
                </Text>
              </View>
            ) : (
              <Text style={styles.signupButtonText}>
                Create Account
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.text.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 40,
    paddingTop: 20,
  },
  titleContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 4,
  },
  input: {
    height: 52,
    borderColor: colors.border.dark,
    borderWidth: 1,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: colors.background.card,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginTop: 4,
  },
  photoButton: {
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border.dark,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.card,
  },
  photoContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  photoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  photoOverlayText: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  photoPlaceholder: {
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 36,
    color: colors.text.muted,
    marginBottom: 8,
  },
  photoButtonText: {
    fontSize: 16,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 40,
    paddingBottom: 60,
    paddingTop: 20,
  },
  signupButton: {
    backgroundColor: colors.primary.purple,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.primary.lightPurple,
    opacity: 0.7,
  },
  signupButtonText: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: 12,
  },
});