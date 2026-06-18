import { useEffect, useState } from "react";

const BASE_URL = import.meta.env.VITE_API_URL;

function AdminPage({ matches }) {
  const [scores, setScores] = useState({});

  const [savingMatchId, setSavingMatchId] = useState(null);

  const [rebuildingRanking, setRebuildingRanking] = useState(false);

  useEffect(() => {
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

    setScores(initialScores);
  }, [matches]);

  const groupedMatches = matches.reduce((acc, match) => {
    if (!acc[match.round]) {
      acc[match.round] = [];
    }

    acc[match.round].push(match);

    return acc;
  }, {});

  const handleScoreChange = (matchId, field, value) => {
    setScores((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [field]: value,
      },
    }));
  };

  const handleSaveResult = async (matchId) => {
    try {
      const scoreData = scores?.[matchId];

      if (!scoreData) {
        alert("No se encontraron datos para este partido");

        return;
      }

      if (scoreData.homeGoals === "" || scoreData.awayGoals === "") {
        alert("Debes ingresar ambos marcadores");

        return;
      }

      setSavingMatchId(matchId);

      const response = await fetch(`${BASE_URL}/admin/update-match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          matchId,
          homeGoals: Number(scoreData.homeGoals),
          awayGoals: Number(scoreData.awayGoals),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error actualizando resultado");
      }

      alert("Resultado actualizado correctamente");
    } catch (error) {
      console.error(error);

      alert("Error actualizando resultado");
    } finally {
      setSavingMatchId(null);
    }
  };

  const handleRebuildRanking = async () => {
    try {
      setRebuildingRanking(true);

      const response = await fetch(`${BASE_URL}/admin/rebuild-ranking`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error reconstruyendo ranking");
      }

      alert(
        `Ranking reconstruido correctamente (${data.usersProcessed} usuarios)`,
      );
    } catch (error) {
      console.error(error);

      alert("Error reconstruyendo ranking");
    } finally {
      setRebuildingRanking(false);
    }
  };

  return (
    <>
      <h1 className="page-title">Panel de Administración</h1>

      <div className="admin-card">
        <button
          className="admin-save-btn"
          onClick={handleRebuildRanking}
          disabled={rebuildingRanking}
        >
          {rebuildingRanking
            ? "Reconstruyendo Ranking..."
            : "Reconstruir Ranking"}
        </button>
      </div>

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

                <button
                  className="admin-save-btn"
                  onClick={() => handleSaveResult(match.id)}
                  disabled={savingMatchId === match.id}
                >
                  {savingMatchId === match.id
                    ? "Guardando..."
                    : "Guardar Resultado"}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

export default AdminPage;
