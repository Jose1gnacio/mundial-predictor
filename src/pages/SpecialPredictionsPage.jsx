import { useEffect, useState } from "react";
import {
  saveSpecialPrediction,
  getSpecialPrediction,
} from "../services/specialPredictionApi";
import { worldCupGroups } from "../assets/worldCupGroups";

export default function SpecialPredictionsPage() {
  const countries = Object.values(worldCupGroups)
    .flat()
    .sort((a, b) => a.localeCompare(b));

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [finalist1, setFinalist1] = useState("");

  const [finalist2, setFinalist2] = useState("");

  const [champion, setChampion] = useState("");

  const [predictionExists, setPredictionExists] = useState(false);

  useEffect(() => {
    loadPrediction();
  }, []);

  async function loadPrediction() {
    try {
      const prediction = await getSpecialPrediction();

      if (prediction) {
        setFinalist1(prediction.finalist1);

        setFinalist2(prediction.finalist2);

        setChampion(prediction.champion);

        setPredictionExists(true);
      }
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  }

  async function handleSave() {
    if (saving) {
      return;
    }

    try {
      if (!finalist1 || !finalist2 || !champion) {
        alert("Debes completar todas las selecciones");
        return;
      }

      if (finalist1 === finalist2) {
        alert("Los dos finalistas deben ser diferentes");
        return;
      }

      setSaving(true);

      await saveSpecialPrediction({
        finalist1,
        finalist2,
        champion,
      });

      setPredictionExists(true);

      alert(
        predictionExists
          ? "Pronóstico especial actualizado correctamente"
          : "Pronóstico especial guardado correctamente",
      );
    } catch (error) {
      console.error(error);

      alert(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p>Cargando...</p>;
  }

  const limitDate = new Date("2026-07-02T23:59:59-04:00");

  const nowChile = new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "America/Santiago",
    }),
  );

  const predictionClosed = nowChile > limitDate;

  return (
    <div className="prediction-detail">
      {saving && (
        <div className="saving-overlay">
          <div className="saving-modal">
            <div className="saving-spinner"></div>

            <h3>Guardando predicción...</h3>

            <p>
              Esto puede tardar unos segundos mientras se conecta el servidor.
            </p>
          </div>
        </div>
      )}

      <div className="prediction-detail-card predicted">
        <h2 className="special-title">🏆 Pronósticos Especiales</h2>

        <div className="special-info-card">
          <p>
            🎯 <strong>Finalista 1:</strong> 5 puntos
          </p>
          <p>
            🎯 <strong>Finalista 2:</strong> 5 puntos
          </p>
          <p>
            🏆 <strong>Campeón:</strong> 10 puntos
          </p>
          <br />
          <strong>Máximo posible: 20 puntos</strong>
          <br />
          <br />
          🔒 Las elecciones permanecerán ocultas para todos hasta el cierre del
          plazo.
        </div>

        <p
          className={
            predictionClosed
              ? "special-deadline closed"
              : "special-deadline open"
          }
        >
          {predictionClosed
            ? "🔒 El plazo para realizar este pronóstico ya terminó."
            : "⏳ Puedes modificar tu elección hasta el 02 de julio a las 23:59 hrs."}
        </p>

        <h3>Finalista 1</h3>

        <select
          disabled={predictionClosed}
          value={finalist1}
          onChange={(e) => setFinalist1(e.target.value)}
          className="admin-select"
        >
          <option value="">Selecciona un país</option>

          {countries
            .filter((country) => country !== finalist2)
            .map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
        </select>

        <br />

        <h3>Finalista 2</h3>

        <select
          disabled={predictionClosed}
          value={finalist2}
          onChange={(e) => setFinalist2(e.target.value)}
          className="admin-select"
        >
          <option value="">Selecciona un país</option>

          {countries
            .filter((country) => country !== finalist1)
            .map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
        </select>

        <br />

        <h3>Campeón</h3>

        <select
          disabled={predictionClosed}
          value={champion}
          onChange={(e) => setChampion(e.target.value)}
          className="admin-select"
        >
          <option value="">Selecciona un país</option>

          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>

        <br />

        <button
          className="save-prediction-btn"
          disabled={saving || predictionClosed}
          onClick={handleSave}
        >
          {predictionClosed
            ? "Pronósticos Cerrados"
            : saving
              ? "Guardando..."
              : predictionExists
                ? "Actualizar Pronóstico"
                : "Guardar Pronóstico"}
        </button>
      </div>
    </div>
  );
}
