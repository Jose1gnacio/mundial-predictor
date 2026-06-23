import { auth } from "../firebase";

const BASE_URL = import.meta.env.VITE_API_URL;

export async function savePrediction(predictionData) {
  try {
    const token = await auth.currentUser.getIdToken();

    const response = await fetch(`${BASE_URL}/predictions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(predictionData),
    });

    if (!response.ok) {
      throw new Error("Error guardando predicción");
    }

    return await response.json();
  } catch (error) {
    console.error("Error API:", error);

    throw error;
  }
}
