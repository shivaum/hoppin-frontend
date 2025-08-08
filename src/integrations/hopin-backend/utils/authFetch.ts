import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface HttpErrorOptions {
  status: number;
  code?: string;
  body?: any;
  url?: string;
  wwwAuthenticate?: string | null; // <— add this
}

export class HttpError extends Error {
  status: number;
  code?: string;
  body?: any;
  url?: string;
  wwwAuthenticate?: string | null;    // <— add this

  constructor(message: string, opts: HttpErrorOptions) {
    super(message);
    this.name = "HttpError";
    this.status = opts.status;
    this.code = opts.code;
    this.body = opts.body;
    this.url = opts.url;
    this.wwwAuthenticate = opts.wwwAuthenticate ?? null;  // <— add this
  }
}

// keep this helper in same file if you want
export async function safeParse(res: Response) {
  const text = await res.text();
  try { return { parsed: JSON.parse(text), raw: text }; }
  catch { return { parsed: null, raw: text }; }
}

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

  if (!response.ok) {
    // Try to parse the error body
    const errorText = await response.text();
    let errorJson: any = null;
    try {
      errorJson = JSON.parse(errorText);
    } catch {
      // non-JSON response
    }

    // Build a full error object for logging
    const logData = {
      status: response.status,
      statusText: response.statusText,
      url,
      method: options.method || "GET",
      headers: Object.fromEntries(response.headers.entries()),
      body: errorJson ?? errorText,
    };

    // Log to Metro console
    console.log("API Request Failed:", JSON.stringify(logData, null, 2));

    // You could also surface this in a toast:
    // Toast.show({ type: 'error', text1: `Error ${response.status}`, text2: errorJson?.error || 'Request failed' });

    if (response.status === 401) {
      await AsyncStorage.removeItem("access_token");
      throw new Error(errorJson?.error || "Unauthorized. Please log in again.");
    }

    throw new Error(errorJson?.error || "API request failed");
  }

  return response;
}