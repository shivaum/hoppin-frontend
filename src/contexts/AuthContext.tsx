import React, { createContext, useState, useEffect, ReactNode } from 'react';
import client from '../api/client';

interface AuthContextProps {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>({
  token: null,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  async function login(email: string, password: string) {
    const response = await client.post('/auth/login', { email, password });
    setToken(response.data.access_token);
    client.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
  }

  async function logout() {
    await client.post('/auth/logout');
    setToken(null);
  }

  useEffect(() => {
    if (token) {
      client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}