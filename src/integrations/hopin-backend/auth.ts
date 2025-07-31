import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../../types";
import { authorizedFetch } from "./utils/authFetch";
import { setAccessToken } from "./utils/authFetch";
import { API_URL } from '@env';

export async function signUpWithEmail(
  email: string,
  password: string,
  name: string,
  phone: string,
  photo: File
) {
  const formData = new FormData();
  formData.append("email", email);
  formData.append("password", password);
  formData.append("name", name);
  formData.append("phone", phone);
  formData.append("photo", photo);

  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!res.ok) throw new Error("Signup failed");

  const { access_token } = await res.json();
  AsyncStorage.setItem("access_token", access_token);
  setAccessToken(access_token);

  const user = await getCurrentUser();

  return { access_token, user };
}

export async function signInWithEmail(email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include"
    });
    if (!res.ok) throw new Error("Login failed");
  
    const { access_token } = await res.json();
  
    AsyncStorage.setItem("access_token", access_token);
    setAccessToken(access_token);

    const user = await getCurrentUser();
  
    return { access_token, user };
  }

export async function signOut() {
  await authorizedFetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include"
  });
  setAccessToken("");
}

export async function getCurrentUser() {
    const res = await authorizedFetch(`${API_URL}/user/profile`, {
      credentials: "include"
    });
    if (!res.ok) return null;
    return await res.json();
  }
  
  export async function updateProfile(data: Partial<User>) {
    const res = await authorizedFetch(`${API_URL}/user/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data),
      credentials: "include"
    });
    if (!res.ok) throw new Error("Update failed");
    return await res.json();
  }
