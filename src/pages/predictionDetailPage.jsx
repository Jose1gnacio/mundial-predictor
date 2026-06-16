import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactCountryFlag from "react-country-flag";
import { countryCodes } from "../assets/countryCodes";
import { getMatchById, getPrediction } from "../services/firestoreApi";
import { savePrediction } from "../services/predictionApi";
import { auth } from "../firebase";
import { isPredictionClosed } from "../utils/predictionUtils";
import { formatDateTitle } from "../utils/predictionsPageUtils";

export default function PredictionDetailPage({ loadPredictions }) {
  const { id } = useParams();

  const navigate = useNavigate();

  const [match, setMatch] = useState(null);

  const [loading, setLoading] = useState(true);

  const [homeGoals, setHomeGoals] = useState("");

  const [awayGoals, setAwayGoals] = useState("");

  const [predictionExists, setPredictionExists] = useState(false);

  const [savingPrediction, setSavingPrediction] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const matchData = await getMatchById(id);

      setMatch(matchData);

      const user = auth.currentUser;

      if (user) {
        const prediction = await getPrediction(user.uid, id);

        if (prediction) {
          setHomeGoals(prediction.homeGoals);
          setAwayGoals(prediction.awayGoals);
          setPredictionExists(true);
        }
      }

      setLoading(false);
    };

    loadData();
  }, [id]);

  const handleSavePrediction = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        alert("Debes iniciar sesión");
        return;
      }

      if (homeGoals === "" || awayGoals === "") {
        alert("Debes ingresar ambos marcadores");
        return;
      }

      setSavingPrediction(true);

      await savePrediction({
        userId: user.uid,
        matchId: match.id,
        homeGoals: Number(homeGoals),
        awayGoals: Number(awayGoals),
      });

      await loadPredictions(user.uid);

      setSavingPrediction(false);

      alert(
        predictionExists
          ? "Predicción actualizada correctamente"
          : "Predicción guardada correctamente",
      );

      navigate("/predictions");
    } catch (error) {
      console.error(error);

      setSavingPrediction(false);

      alert("Error guardando predicción");
    }
  };

  if (loading) {
    return <p>Cargando partido...</p>;
  }

  if (!match) {
    return <p>Partido no encontrado.</p>;
  }

  const predictionClosed = isPredictionClosed(match.matchDate);

  let cardClass = "pending";

  if (predictionExists) {
    cardClass = "predicted";
  } else if (predictionClosed) {
    cardClass = "expired";
  }

  const matchHour = match.time?.split(" ")[1] || match.time;

  return (
    <div className="prediction-detail">
      {savingPrediction && (
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

      <div className={`prediction-detail-card ${cardClass}`}>
        <div className="match-row">
          <div className="team-line">
            <ReactCountryFlag
              countryCode={countryCodes[match.home]}
              svg
              className="prediction-flag"
            />

            <span>{match.home}</span>
          </div>

          <input
            type="number"
            min="0"
            className="goal-input"
            value={homeGoals}
            disabled={predictionClosed}
            onChange={(e) => setHomeGoals(e.target.value)}
          />
        </div>

        <div className="match-row">
          <div className="team-line">
            <ReactCountryFlag
              countryCode={countryCodes[match.away]}
              svg
              className="prediction-flag"
            />

            <span>{match.away}</span>
          </div>

          <input
            type="number"
            min="0"
            className="goal-input"
            value={awayGoals}
            disabled={predictionClosed}
            onChange={(e) => setAwayGoals(e.target.value)}
          />
        </div>

        <p className="prediction-date">
          📅 {formatDateTitle(match.matchDate)}
          &nbsp; • &nbsp; 🕒 {matchHour}
        </p>

        {predictionClosed && (
          <p className="prediction-status">
            {predictionExists
              ? "✅ Predicción Registrada"
              : "🔒 Predicción No Realizada"}
          </p>
        )}

        <button
          className="save-prediction-btn"
          onClick={handleSavePrediction}
          disabled={predictionClosed}
        >
          {predictionClosed
            ? "Predicción Cerrada"
            : predictionExists
              ? "Actualizar Predicción"
              : "Guardar Predicción"}
        </button>
      </div>
    </div>
  );
}
