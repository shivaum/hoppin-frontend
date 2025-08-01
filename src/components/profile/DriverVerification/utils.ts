import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@env";

export async function uploadLicense(photo: { uri: string; name: string; type: string }) {
  const formData = new FormData();
  formData.append("file", {
    uri: photo.uri,
    name: photo.name,
    type: photo.type,
  } as any);

  const token = await AsyncStorage.getItem("access_token");

  const res = await fetch(`${API_URL}/validate/license`, {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${token || ""}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(errorText || "License validation failed");
  }
}