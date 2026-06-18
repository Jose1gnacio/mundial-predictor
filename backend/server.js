import express from "express";
import cors from "cors";

import { getWorldCupMatches } from "./scraper.js";
import { db } from "./firebase.js";

const app = express();

// 🔥 permitir conexión desde React
app.use(cors());

// 🔥 permitir recibir JSON
app.use(express.json());

// 🌎 Mundial 2026
const MATCHES_URL =
  "https://www.flashscore.cl/futbol/mundial/copa-del-mundo/partidos/";

// 🔥 separar partidos jugados y próximos
const splitMatches = (matches) => {
  const finished = matches.filter(
    (m) =>
      m.score && m.score !== "-" && m.score !== "---" && m.score.includes("-"),
  );

  const upcoming = matches.filter((m) => m.score === "-" || m.score === "---");

  return {
    finished,
    upcoming,
  };
};

// ⚽ endpoint principal (NO SE TOCA)
app.get("/matches", async (req, res) => {
  try {
    const data = await getWorldCupMatches(MATCHES_URL);

    const result = splitMatches(data);

    res.json({
      source: "flashscore",
      tournament: "world-cup",
      ...result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error scraping matches",
    });
  }
});

// 🔥 sincronizar scraping → Firestore
app.get("/sync-matches", async (req, res) => {
  try {
    const matches = await getWorldCupMatches(MATCHES_URL);

    let saved = 0;

    for (const match of matches) {
      await db.collection("matches").doc(match.id).set(match, {
        merge: true,
      });

      saved++;
    }

    res.json({
      success: true,
      saved,
      message: "Partidos sincronizados correctamente",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Error sincronizando partidos",
    });
  }
});

// 🔥 guardar predicción
app.post("/predictions", async (req, res) => {
  try {
    const { userId, matchId, homeGoals, awayGoals } = req.body;

    const matchDoc = await db.collection("matches").doc(matchId).get();

    if (!matchDoc.exists) {
      return res.status(404).json({
        success: false,
        error: "Partido no encontrado",
      });
    }

    const match = matchDoc.data();

    const matchDate = new Date(`${match.matchDate}T00:00:00`);

    const limitDate = new Date(matchDate);

    limitDate.setDate(limitDate.getDate() - 1);

    limitDate.setHours(23, 59, 59, 999);

    const nowChile = new Date(
      new Date().toLocaleString("en-US", {
        timeZone: "America/Santiago",
      }),
    );

    if (nowChile > limitDate) {
      return res.status(403).json({
        success: false,
        error: "El plazo para realizar esta predicción ya expiró",
      });
    }

    const predictionId = `${userId}_${matchId}`;

    await db.collection("predictions").doc(predictionId).set(
      {
        userId,
        matchId,
        homeGoals,
        awayGoals,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    res.json({
      success: true,
      predictionId,
      message: "Predicción guardada correctamente",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Error guardando predicción",
    });
  }
});

// 🔥 ADMIN - actualizar resultado de partido
app.post("/admin/update-match", async (req, res) => {
  try {
    const { matchId, homeGoals, awayGoals } = req.body;

    if (!matchId || homeGoals === undefined || awayGoals === undefined) {
      return res.status(400).json({
        success: false,
        error: "Datos incompletos",
      });
    }

    const score = `${homeGoals}-${awayGoals}`;

    await db.collection("matches").doc(matchId).update({
      score,
      updatedAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: "Resultado actualizado correctamente",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Error actualizando resultado",
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
