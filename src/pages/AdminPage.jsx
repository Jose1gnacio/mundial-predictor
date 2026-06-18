import { useState } from "react";

function AdminPage({ matches }) {
  const groupedMatches = matches.reduce((acc, match) => {
    if (!acc[match.round]) {
      acc[match.round] = [];
    }

    acc[match.round].push(match);

    return acc;
  }, {});

  const [scores, setScores] = useState(() => {
    const initialScores = {};

    matches.forEach((match) => {
      if (match.score && match.score.includes("-")) {
        const [homeGoals, awayGoals] = match.score.split("-");

        initialScores[match.id] = {
          homeGoals,
          awayGoals,
        };
      } else {
        initialScores[match.id] = {
          homeGoals: "",
          awayGoals: "",
        };
      }
    });

    return initialScores;
  });

  const handleScoreChange = (matchId, field, value) => {
    setScores((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [field]: value,
      },
    }));
  };

  return (
    <>
      <h1 className="page-title">Panel de Administración</h1>

      {Object.entries(groupedMatches).map(([round, roundMatches]) => (
        <div key={round} className="round-section">
          <h2 className="round-title">{round}</h2>

          <div className="admin-matches-list">
            {roundMatches.map((match) => (
              <div key={match.id} className="admin-match-card">
                <h3>
                  {match.home} vs {match.away}
                </h3>

                <p>
                  📅 {match.matchDate} • 🕒 {match.time}
                </p>

                <div className="admin-score-editor">
                  <input
                    type="number"
                    min="0"
                    value={scores[match.id]?.homeGoals ?? ""}
                    onChange={(e) =>
                      handleScoreChange(match.id, "homeGoals", e.target.value)
                    }
                  />

                  <span>-</span>

                  <input
                    type="number"
                    min="0"
                    value={scores[match.id]?.awayGoals ?? ""}
                    onChange={(e) =>
                      handleScoreChange(match.id, "awayGoals", e.target.value)
                    }
                  />
                </div>

                <button className="admin-save-btn">Guardar Resultado</button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

export default AdminPage;
