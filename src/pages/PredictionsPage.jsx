import ReactCountryFlag from "react-country-flag";
import { countryCodes } from "../assets/countryCodes";
import { useNavigate } from "react-router-dom";

import { isPredictionClosed } from "../utils/predictionUtils";

import {
  buildPredictionGroups,
  formatDateTitle,
} from "../utils/predictionsPageUtils";

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

  const { activeRounds, finishedRounds } = buildPredictionGroups(matches);

  const renderMatchCard = (match) => {
    const prediction = predictions?.[match.id];

    const predicted = !!prediction;

    const closed = isPredictionClosed(match.matchDate);

    let cardClass = "pending";

    let statusText = "⚠️ PREDECIR";

    if (predicted) {
      cardClass = "predicted";

      statusText = closed ? "🔒 Predicción cerrada" : "✅ Predicción guardada";
    } else if (closed) {
      cardClass = "expired";

      statusText = "❌ Partido sin predecir";
    }

    const homeGoals = predicted ? prediction.homeGoals : "-";

    const awayGoals = predicted ? prediction.awayGoals : "-";

    const matchHour = match.time?.split(" ")[1] || match.time;

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
              className="prediction-flag"
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
              className="prediction-flag"
            />

            <span>{match.away}</span>
          </div>

          <div className="match-score">{awayGoals}</div>
        </div>

        <p className="prediction-date">🕗 {matchHour}</p>

        <p className="prediction-status">{statusText}</p>
      </div>
    );
  };

  return (
    <>
      <h1 className="page-title">Mis Predicciones</h1>

      {Object.entries(activeRounds).map(([round, dates]) => (
        <div key={round} className="round-section">
          <h2 className="round-title">{round}</h2>

          {Object.entries(dates)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([matchDate, dateMatches]) => (
              <div key={matchDate}>
                <h3 className="date-group-title">
                  📅 {formatDateTitle(matchDate)}
                </h3>

                <div className="prediction-grid">
                  {dateMatches.map(renderMatchCard)}
                </div>
              </div>
            ))}
        </div>
      ))}

      {Object.keys(finishedRounds).length > 0 && (
        <>
          <h2 className="page-title">🏁 PARTIDOS TERMINADOS</h2>

          {Object.entries(finishedRounds)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([round, dates]) => (
              <div key={round} className="round-section">
                <h2 className="round-title">{round}</h2>

                {Object.entries(dates)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([matchDate, dateMatches]) => (
                    <div key={matchDate}>
                      <h3 className="date-group-title">
                        📅 {formatDateTitle(matchDate)}
                      </h3>

                      <div className="prediction-grid">
                        {dateMatches.map(renderMatchCard)}
                      </div>
                    </div>
                  ))}
              </div>
            ))}
        </>
      )}
    </>
  );
}
