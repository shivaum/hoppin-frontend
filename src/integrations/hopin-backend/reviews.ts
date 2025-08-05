import { API_URL } from "@env";
import { authorizedFetch } from "./utils/authFetch";

export async function createReview({
  revieweeId,
  rideId,
  rating,
  comment,
  role, // "driver" or "rider"
}: {
  revieweeId: string;
  rideId: string;
  rating: number;
  comment?: string;
  role: "driver" | "rider";
}) {
  const res = await authorizedFetch(`${API_URL}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reviewee_id: revieweeId, ride_id: rideId, rating, comment, role }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to submit review.");
  }

  return await res.json(); // contains { message, review_id }
}

export async function updateReview(reviewId: string, data: { rating?: number; comment?: string }) {
  const res = await authorizedFetch(`${API_URL}/reviews/${reviewId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to update review.");
  }

  return await res.json(); // contains { message }
}

export async function deleteReview(reviewId: string) {
  const res = await authorizedFetch(`${API_URL}/reviews/${reviewId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to delete review.");
  }

  return await res.json(); // contains { message }
}

export async function getProfileRating(profileId: string) {
  const res = await authorizedFetch(`${API_URL}/reviews/${profileId}/ratings`);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to load profile rating.");
  }

  return await res.json(); // { driver_rating: number | null, rider_rating: number | null }
}

export async function getProfileReviews(profileId: string, role?: "driver" | "rider") {
  const url = new URL(`${API_URL}/reviews/${profileId}`);
  if (role) url.searchParams.append("role", role);

  const res = await authorizedFetch(url.toString());

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to load profile reviews.");
  }

  return await res.json(); // list of reviews
}