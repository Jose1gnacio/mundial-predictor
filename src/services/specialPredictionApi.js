import { auth } from "../firebase";

const BASE_URL = import.meta.env.VITE_API_URL;

export async function getSpecialPrediction() {
  const token = await auth.currentUser.getIdToken();

  const response = await fetch(`${BASE_URL}/special-predictions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error);
  }

  return data.prediction;
}

export async function saveSpecialPrediction(prediction) {
  const token = await auth.currentUser.getIdToken();

  const response = await fetch(`${BASE_URL}/special-predictions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(prediction),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error);
  }

  return data;
}
