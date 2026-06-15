import { useEffect, useState } from "react";

import { getApprovedUsers, getAllPredictions } from "../services/firestoreApi";

import { calculatePoints } from "../utils/scoringUtils";

function RankingPage({ matches }) {
  const [ranking, setRanking] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRanking = async () => {
      try {
        const users = await getApprovedUsers();

        const predictions = await getAllPredictions();

        const rankingData = users.map((user) => {
          const userPredictions = predictions.filter(
            (prediction) => prediction.userId === user.uid,
          );

          let totalPoints = 0;

          userPredictions.forEach((prediction) => {
            const match = matches.find((m) => m.id === prediction.matchId);

            if (!match) {
              return;
            }

            totalPoints += calculatePoints(match.score, prediction);
          });

          return {
            uid: user.uid,
            displayName: user.displayName,
            points: totalPoints,
          };
        });

        rankingData.sort((a, b) => b.points - a.points);

        setRanking(rankingData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (matches.length > 0) {
      loadRanking();
    }
  }, [matches]);

  if (loading) {
    return <p>Cargando clasificación...</p>;
  }

  return (
    <div className="ranking-container">
      <h1 className="page-title">Tabla de Clasificación</h1>

      <div className="ranking-card">
        <div className="ranking-header">
          <div>🏆 Lugar</div>
          <div>👤 Participante</div>
          <div>⭐ Puntos</div>
        </div>

        {ranking.map((user, index) => (
          <div key={user.uid} className="ranking-row">
            <div
              className={`ranking-position ${
                index === 0
                  ? "gold"
                  : index === 1
                    ? "silver"
                    : index === 2
                      ? "bronze"
                      : ""
              }`}
            >
              {index + 1}°
            </div>

            <div className="ranking-name">{user.displayName}</div>

            <div className="ranking-points">{user.points}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RankingPage;
