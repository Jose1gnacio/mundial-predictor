import { useState } from "react";
import { auth } from "../firebase";

function RankingPage({ ranking, loading }) {
  const [expandedUser, setExpandedUser] = useState(null);

  if (loading) {
    return <p>Cargando clasificación...</p>;
  }

  const currentUserUid = auth.currentUser?.uid;

  const handleToggle = (userId) => {
    setExpandedUser((prev) => (prev === userId ? null : userId));
  };

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
          <div
            key={user.uid}
            className={`ranking-row ranking-expandable ${
              user.uid === currentUserUid ? "current-user-row" : ""
            } ${expandedUser === user.uid ? "ranking-row-expanded" : ""}`}
            onClick={() => handleToggle(user.uid)}
          >
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

            {expandedUser === user.uid && (
              <div className="ranking-details">
                <span>🎯 Exactos: {user.exacts || 0}</span>

                <span>⚽ Resultados: {user.winners || 0}</span>

                <span>❌ Fallados: {user.failed || 0}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default RankingPage;
