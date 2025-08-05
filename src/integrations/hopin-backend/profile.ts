import { API_URL } from "@env";
import { authorizedFetch } from "./utils/authFetch";
import { User } from "../../types";

export async function getCurrentUser() {
    const res = await authorizedFetch(`${API_URL}/user/profile`);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error || "User profile retrieval failed.");
    }
    return await res.json();
  }
  
export async function updateProfile(data: Partial<User> | FormData) {
  const isFormData = data instanceof FormData;

  const headers: Record<string, string> = {};
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const res = await authorizedFetch(`${API_URL}/user/profile`, {
    method: "PATCH",
    headers,
    body: isFormData ? data : JSON.stringify(data),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error || "Profile update failed");
  }

  return await res.json();
}

export async function getPublicProfile(profileId: string) {
  const res = await authorizedFetch(`${API_URL}/user/public/${profileId}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to load profile.");
  }
  return await res.json();
}
