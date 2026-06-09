import ReactCountryFlag from "react-country-flag";
import { countryCodes } from "../assets/countryCodes";
import { useNavigate } from "react-router-dom";

import { isPredictionClosed } from "../utils/predictionUtils";

export default function PredictionsPage({ matches, predictions, loading }) {
  const navigate = useNavigate();

  const handlePredictionClick = (match) => {
    navigate(`/prediction/${match.id}`);
  };

  if (loading) {
    return <p>Cargando partidos...</p>;
  }

  if (matches.length === 0) {
    return <p>No hay partidos disponibles</p>;
  }

  return (
    <>
      <h1 className="page-title">Mis Predicciones</h1>
      {Object.entries(
        matches.reduce((acc, match) => {
          if (!acc[match.round]) {
            acc[match.round] = [];
          }

          acc[match.round].push(match);

          return acc;
        }, {}),
      ).map(([round, roundMatches]) => (
        <div key={round} className="round-section">
          <h2 className="round-title">{round}</h2>

          <div className="prediction-grid">
            {roundMatches.map((match) => {
              const prediction = predictions?.[match.id];

              const predicted = !!prediction;

              const closed = isPredictionClosed(match.matchDate);

              let cardClass = "pending";

              let statusText = "⚠️ PREDECIR";

              if (predicted) {
                cardClass = "predicted";

                statusText = closed
                  ? "🔒 Predicción cerrada"
                  : "✅ Predicción guardada";
              } else if (closed) {
                cardClass = "expired";

                statusText = "❌ Partido sin predecir";
              }

              const homeGoals = predicted ? prediction.homeGoals : "-";

              const awayGoals = predicted ? prediction.awayGoals : "-";

              return (
                <div
                  key={match.id}
                  className={`prediction-card ${cardClass}`}
                  onClick={() => handlePredictionClick(match)}
                >
                  <div className="match-row">
                    <div className="team-line">
                      <ReactCountryFlag
                        countryCode={countryCodes[match.home]}
                        svg
                        style={{
                          width: "28px",
                          height: "28px",
                        }}
                      />

                      <span>{match.home}</span>
                    </div>

                    <div className="match-score">{homeGoals}</div>
                  </div>

                  <div className="match-row">
                    <div className="team-line">
                      <ReactCountryFlag
                        countryCode={countryCodes[match.away]}
                        svg
                        style={{
                          width: "28px",
                          height: "28px",
                        }}
                      />

                      <span>{match.away}</span>
                    </div>

                    <div className="match-score">{awayGoals}</div>
                  </div>

                  <p className="prediction-date">{match.time}</p>

                  <p className="prediction-status">{statusText}</p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}
