import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getCurrentUser,
  signInWithEmail,
  signUpWithEmail,
  signOut,
  updateProfile,
} from "../integrations/hopin-backend/auth";
import type { User } from "../types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    name: string,
    phone: string,
    photo: any
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<User> | FormData) => Promise<void>;
  refreshUser: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        refreshUser();
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { access_token, user } = await signInWithEmail(email, password);
    await AsyncStorage.setItem("access_token", access_token);
    setUser(user);
  };

  const signUp = async (email: string, password: string, name: string, phone: string, photo: any) => {
    const { access_token, user } = await signUpWithEmail(email, password, name, phone, photo);
    await AsyncStorage.setItem("access_token", access_token);
    setUser(user);
  };

  const logout = async () => {
    await signOut();
    await AsyncStorage.removeItem("access_token");
    setUser(null);
  };

  const updateUserProfile = async (data: Partial<User> | FormData) => {
    await updateProfile(data);
    refreshUser();
  };

  const refreshUser = async () => {
    const latest = await getCurrentUser();
    setUser(latest);
  };
  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, logout, updateUserProfile, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}