import { authorizedFetch } from "./utils/authFetch";
import { API_URL } from '@env'

export async function fetchMessagesWith(userId: string, rideId: string) {
  console.log('function called');
  const url = `${API_URL}/messages/history?with=${userId}&ride_id=${rideId}`;
  const res = await authorizedFetch(url);
  if (!res.ok) throw new Error("Failed to fetch message history");
  return res.json();
}

export async function fetchUserConversations() {
  const res = await authorizedFetch(`${API_URL}/messages/conversations`);
  if (!res.ok) throw new Error("Failed to fetch conversations");
  return res.json();
}