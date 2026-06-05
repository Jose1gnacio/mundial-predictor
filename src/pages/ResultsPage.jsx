import ReactCountryFlag from "react-country-flag";
import { countryCodes } from "../assets/countryCodes";

import {
  calculatePoints,
  getPredictionStatus,
  parseScore,
} from "../utils/scoringUtils";

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
      {Object.entries(groupedMatches).map(([round, roundMatches]) => (
        <div key={round} className="round-section">
          <h2 className="round-title">{round}</h2>

          <div className="results-grid">
            {roundMatches.map((match) => {
              const prediction = predictions?.[match.id];

              const parsedScore = parseScore(match.score);

              const status = getPredictionStatus(match.score, prediction);

              const points = calculatePoints(match.score, prediction);

              const date =
                match.matchDate?.split("-").reverse().slice(0, 2).join("/") ||
                "-";

              const time = match.time?.split(" ")[1] || "-";

              return (
                <div key={match.id} className="result-card">
                  {/* CABECERA */}

                  <div className="result-header-row">
                    <div className="result-date-column">
                      <div>{date}</div>
                      <div>{time}</div>
                    </div>

                    <div className="result-home-team">
                      <ReactCountryFlag
                        countryCode={countryCodes[match.home]}
                        svg
                        style={{
                          width: "24px",
                          height: "24px",
                        }}
                      />

                      <span>{match.home}</span>
                    </div>

                    <div className="result-middle-column">-</div>

                    <div className="result-away-team">
                      <span>{match.away}</span>

                      <ReactCountryFlag
                        countryCode={countryCodes[match.away]}
                        svg
                        style={{
                          width: "24px",
                          height: "24px",
                        }}
                      />
                    </div>
                  </div>

                  {/* RESULTADO */}

                  <div className="result-row">
                    <div className="result-label">Resultado</div>

                    <div className="result-value">
                      {parsedScore ? parsedScore.homeGoals : "-"}
                    </div>

                    <div className="result-middle-column">-</div>

                    <div className="result-value">
                      {parsedScore ? parsedScore.awayGoals : "-"}
                    </div>
                  </div>

                  {/* PREDICCION */}

                  <div className="result-row">
                    <div className="result-label">Predicción</div>

                    <div className="result-value">
                      {prediction ? prediction.homeGoals : "-"}
                    </div>

                    <div className="result-middle-column">-</div>

                    <div className="result-value">
                      {prediction ? prediction.awayGoals : "-"}
                    </div>
                  </div>

                  {/* PUNTOS */}

                  <div className="result-row">
                    <div className="result-label">Puntos</div>

                    <div
                      className="result-points-row"
                      style={{ gridColumn: "2 / 5" }}
                    >
                      <span>
                        {status === "⏳ Pendiente" ||
                        status === "🚫 Sin predicción"
                          ? "-"
                          : points}
                      </span>

                      <span>{status}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}

export default ResultsPage;
