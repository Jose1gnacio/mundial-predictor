import ReactCountryFlag from "react-country-flag";
import { countryCodes } from "../assets/countryCodes";

import {
  calculatePoints,
  getPredictionStatus,
  parseScore,
} from "../utils/scoringUtils";

import { formatDateTitle } from "../utils/predictionsPageUtils";

function ResultsPage({ matches, predictions, loading }) {
  if (loading) {
    return <p>Cargando resultados...</p>;
  }

  if (matches.length === 0) {
    return <p>No hay partidos disponibles</p>;
  }

  const groupedMatches = matches.reduce((acc, match) => {
    if (!acc[match.round]) {
      acc[match.round] = [];
    }

    acc[match.round].push(match);

    return acc;
  }, {});

  return (
    <>
      <h1 className="page-title">Resultados Oficiales</h1>

      {Object.entries(groupedMatches).map(([round, roundMatches]) => {
        const matchesByDate = roundMatches.reduce((acc, match) => {
          if (!acc[match.matchDate]) {
            acc[match.matchDate] = [];
          }

          acc[match.matchDate].push(match);

          return acc;
        }, {});

        return (
          <div key={round} className="round-section">
            <h2 className="round-title">{round}</h2>

            {Object.entries(matchesByDate).map(([matchDate, dateMatches]) => (
              <div key={matchDate}>
                <h3 className="date-group-title">
                  📅 {formatDateTitle(matchDate)}
                </h3>

                <div className="results-grid">
                  {dateMatches.map((match) => {
                    const prediction = predictions?.[match.id];

                    const parsedScore = parseScore(match.score);

                    const status = getPredictionStatus(match.score, prediction);

                    const points = calculatePoints(match.score, prediction);

                    const time = match.time?.split(" ")[1] || "-";

                    const badgeClass =
                      status === "⏳ Pendiente"
                        ? "status-pending"
                        : status === "🚫 Sin predicción"
                          ? "status-no-prediction"
                          : points > 0
                            ? "status-success"
                            : "status-fail";

                    return (
                      <div key={match.id} className="result-card">
                        {/* PARTIDO */}

                        <div className="result-match-box">
                          <div className="result-section-title result-time-title">
                            🕒 {time}
                          </div>

                          <div className="result-team-home">
                            <ReactCountryFlag
                              countryCode={countryCodes[match.home]}
                              svg
                              className="result-flag"
                            />

                            <span className="result-team-name">
                              {match.home}
                            </span>
                          </div>

                          <div className="result-vs">-</div>

                          <div className="result-team-away">
                            <span className="result-team-name">
                              {match.away}
                            </span>

                            <ReactCountryFlag
                              countryCode={countryCodes[match.away]}
                              svg
                              className="result-flag"
                            />
                          </div>
                        </div>

                        {/* RESULTADO */}

                        <div className="result-section">
                          <div className="result-section-title">Resultado</div>

                          <div className="result-section-content">
                            <div className="result-score">
                              {parsedScore ? parsedScore.homeGoals : "-"}
                            </div>

                            <div className="result-score-separator">-</div>

                            <div className="result-score">
                              {parsedScore ? parsedScore.awayGoals : "-"}
                            </div>
                          </div>
                        </div>

                        {/* PREDICCIÓN */}

                        <div className="result-section">
                          <div className="result-section-title">Predicción</div>

                          <div className="result-section-content">
                            <div className="result-score">
                              {prediction ? prediction.homeGoals : "-"}
                            </div>

                            <div className="result-score-separator">-</div>

                            <div className="result-score">
                              {prediction ? prediction.awayGoals : "-"}
                            </div>
                          </div>
                        </div>

                        {/* PUNTOS */}

                        <div className="result-section">
                          <div className="result-section-title">Puntos</div>

                          <div className="result-points-content">
                            <div className="result-points-value">
                              {status === "⏳ Pendiente" ||
                              status === "🚫 Sin predicción"
                                ? "-"
                                : points}
                            </div>

                            <div
                              className={`result-status-badge ${badgeClass}`}
                            >
                              {status}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </>
  );
}

export default ResultsPage;
