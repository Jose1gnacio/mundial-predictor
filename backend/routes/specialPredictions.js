import express from "express";
import { db } from "../firebase.js";
import { verifyUser } from "../middleware/verifyUser.js";

const router = express.Router();

// 🔒 Fecha límite
const SPECIAL_PREDICTION_LIMIT = new Date("2026-07-02T23:59:59-04:00");

// ===========================================
// GUARDAR PRONÓSTICO ESPECIAL
// ===========================================

router.post("/special-predictions", verifyUser, async (req, res) => {
  try {
    const { finalist1, finalist2, champion } = req.body;

    if (!finalist1 || !finalist2 || !champion) {
      return res.status(400).json({
        success: false,
        error: "Todos los campos son obligatorios",
      });
    }

    if (finalist1 === finalist2) {
      return res.status(400).json({
        success: false,
        error: "Los dos finalistas deben ser diferentes",
      });
    }

    const nowChile = new Date(
      new Date().toLocaleString("en-US", {
        timeZone: "America/Santiago",
      }),
    );

    if (nowChile > SPECIAL_PREDICTION_LIMIT) {
      return res.status(403).json({
        success: false,
        error: "El plazo para realizar este pronóstico ya terminó",
      });
    }

    const userId = req.user.uid;

    await db.collection("specialPredictions").doc(userId).set(
      {
        userId,
        finalist1,
        finalist2,
        champion,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    res.json({
      success: true,
      message: "Pronóstico especial guardado correctamente",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Error guardando pronóstico especial",
    });
  }
});

// ===========================================
// OBTENER MI PRONÓSTICO
// ===========================================

router.get("/special-predictions", verifyUser, async (req, res) => {
  try {
    const userId = req.user.uid;

    const doc = await db.collection("specialPredictions").doc(userId).get();

    if (!doc.exists) {
      return res.json({
        success: true,
        prediction: null,
      });
    }

    res.json({
      success: true,
      prediction: doc.data(),
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Error obteniendo pronóstico especial",
    });
  }
});

// ===========================================
// OBTENER TODOS LOS PRONÓSTICOS ESPECIALES
// ===========================================

router.get("/special-predictions/all", verifyUser, async (req, res) => {
  try {
    const snapshot = await db.collection("specialPredictions").get();

    const predictions = snapshot.docs.map((doc) => doc.data());

    res.json({
      success: true,
      predictions,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Error obteniendo pronósticos especiales",
    });
  }
});

export default router;
