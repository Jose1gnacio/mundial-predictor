import { auth } from "../firebase";

function RankingPage({ ranking, loading }) {
  if (loading) {
    return <p>Cargando clasificación...</p>;
  }

  const currentUserUid = auth.currentUser?.uid;

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
            className={`ranking-row ${
              user.uid === currentUserUid ? "current-user-row" : ""
            }`}
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
          </div>
        ))}
      </div>
    </div>
  );
}

export default RankingPage;
