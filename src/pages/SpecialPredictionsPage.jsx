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
      }
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  }

  async function handleSave() {
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

      alert("Pronóstico especial guardado correctamente");
    } catch (error) {
      console.error(error);

      alert(error.message);
    }

    setSaving(false);
  }

  if (loading) {
    return <p>Cargando...</p>;
  }

  return (
    <div className="prediction-detail">
      <div className="prediction-detail-card">
        <h2 style={{ textAlign: "center" }}>🏆 Pronósticos Especiales</h2>

        <div
          style={{
            background: "rgba(255,255,255,0.08)",
            padding: "18px",
            borderRadius: "16px",
            marginBottom: "25px",
            textAlign: "center",
            lineHeight: "1.7",
          }}
        >
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

        <h3>Finalista 1</h3>

        <select
          value={finalist1}
          onChange={(e) => setFinalist1(e.target.value)}
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

        <h3>Finalista 2</h3>

        <select
          value={finalist2}
          onChange={(e) => setFinalist2(e.target.value)}
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

        <h3>Campeón</h3>

        <select
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
          disabled={saving}
          onClick={handleSave}
        >
          {saving ? "Guardando..." : "Guardar Pronóstico"}
        </button>
      </div>
    </div>
  );
}
