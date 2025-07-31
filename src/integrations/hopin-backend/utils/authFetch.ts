import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

let accessToken: string | null = null;

export function setAccessToken(token: string) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export async function authorizedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 401) {
    // Try to refresh the access token
    const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
    });

    if (refreshResponse.ok) {
      const { access_token } = await refreshResponse.json();
      setAccessToken(access_token);
      AsyncStorage.setItem("access_token", access_token);
      // Retry the original request with new access token
      return await fetch(url, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${access_token}`,
        },
      });
    } else {
      throw new Error("Session expired. Please log in again.");
    }
  }

  return response;
}