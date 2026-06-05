import ReactCountryFlag from "react-country-flag";
import { countryCodes } from "../assets/countryCodes";

function MatchesPage({ matches, loading }) {
  if (loading) {
    return <p>Cargando partidos...</p>;
  }

  if (matches.length === 0) {
    return <p>No hay partidos disponibles</p>;
  }

  return (
    <>
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

          <div className="matches-grid">
            {roundMatches.map((match) => {
              let homeScore = "-";
              let awayScore = "-";

              if (
                match.score &&
                match.score !== "---" &&
                match.score.includes("-")
              ) {
                const [home, away] = match.score.split("-");

                homeScore = home.trim();
                awayScore = away.trim();
              }

              return (
                <div key={match.id} className="match-card">
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

                    <div className="match-score">{homeScore}</div>
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

                    <div className="match-score">{awayScore}</div>
                  </div>

                  <div className="match-time">{match.time}</div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}

export default MatchesPage;
