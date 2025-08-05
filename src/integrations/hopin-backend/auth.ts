import AsyncStorage from "@react-native-async-storage/async-storage";
import { authorizedFetch } from "./utils/authFetch";
import { API_URL } from '@env';
import { getCurrentUser } from "./profile";

export async function signUpWithEmail(
  email: string,
  password: string,
  name: string,
  phone: string,
  photo: {
    uri: string;
    type?: string;
    fileName?: string;
}
) {
  const formData = new FormData();
  formData.append("email", email);
  formData.append("password", password);
  formData.append("name", name);
  formData.append("phone", phone);
  formData.append("photo", {
    uri: photo.uri,
    type: photo.type || "image/jpeg",
    name: photo.fileName || "profile.jpg",
  } as any);

  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error || "Signup failed");
  }

  const { access_token } = await res.json();
  await AsyncStorage.setItem("access_token", access_token);

  const user = await getCurrentUser();

  return { access_token, user };
}

export async function signInWithEmail(email: string, password: string) {
    console.log('calling');
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error || "Login failed");
    }
  
    const { access_token } = await res.json();
  
    await AsyncStorage.setItem("access_token", access_token);

    const user = await getCurrentUser();
  
    return { access_token, user };
  }

export async function signOut() {
  await authorizedFetch(`${API_URL}/auth/logout`, {
    method: "POST",
  });
}