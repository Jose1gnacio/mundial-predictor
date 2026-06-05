const BASE_URL = "http://localhost:3000";

export async function getMatches() {
  try {
    const response = await fetch(`${BASE_URL}/matches`);

    if (!response.ok) {
      throw new Error("Error al obtener partidos");
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error API:", error);

    return {
      finished: [],
      upcoming: [],
    };
  }
}
