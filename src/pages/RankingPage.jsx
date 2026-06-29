import { useState } from "react";
import { auth } from "../firebase";

function RankingPage({ ranking, specialPredictions, loading }) {
  const [expandedUser, setExpandedUser] = useState(null);

  const limitDate = new Date("2026-07-03T23:59:59-04:00");

  const nowChile = new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "America/Santiago",
    }),
  );

  const showSpecialPredictions = nowChile > limitDate;

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

        {ranking.map((user, index) => {
          const specialPrediction = specialPredictions.find(
            (prediction) => prediction.userId === user.uid,
          );

          return (
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
                  <div className="ranking-stats">
                    <span>🎯 Exactos: {user.exacts || 0}</span>

                    <span>⚽ Resultados: {user.winners || 0}</span>

                    <span>❌ Fallados: {user.failed || 0}</span>
                  </div>

                  {/*
                  {showSpecialPredictions && (
                  */}

                  <>
                    <div className="ranking-special-divider"></div>

                    <div className="ranking-special-title">
                      🏆 Pronósticos Especiales
                    </div>

                    <span>
                      🥇 Finalista 1:{" "}
                      {specialPrediction?.finalist1 || "Sin pronóstico"}
                    </span>

                    <span>
                      🥈 Finalista 2:{" "}
                      {specialPrediction?.finalist2 || "Sin pronóstico"}
                    </span>

                    <span>
                      👑 Campeón:{" "}
                      {specialPrediction?.champion || "Sin pronóstico"}
                    </span>

                    {/*
                    <span className="ranking-special-points">
                      ⭐ Puntos Especiales: {user.specialPoints || 0}
                    </span>
                    */}
                  </>

                  {/*
                  )}
                  */}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RankingPage;
