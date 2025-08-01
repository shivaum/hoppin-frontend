import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Performs a fetch request with the Authorization header set using the stored JWT access token.
 * If the request returns a 401, the token is assumed invalid and the caller should handle re-auth.
 */
export async function authorizedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await AsyncStorage.getItem("access_token");

  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  if (response.status === 401) {
    await AsyncStorage.removeItem("access_token");
    // Optionally: trigger a logout or show a toast here
    throw new Error("Unauthorized. Please log in again.");
  }

  return response;
}