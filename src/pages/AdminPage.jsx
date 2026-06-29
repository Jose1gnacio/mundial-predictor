import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { getApprovedUsers } from "../services/firestoreApi";

const BASE_URL = import.meta.env.VITE_API_URL;

function AdminPage({ matches, loadData }) {
  const [scores, setScores] = useState({});

  const [savingMatchId, setSavingMatchId] = useState(null);

  const [rebuildingRanking, setRebuildingRanking] = useState(false);

  const [activeTab, setActiveTab] = useState("results");

  const [users, setUsers] = useState([]);

  const [selectedUser, setSelectedUser] = useState("");

  const [auditResult, setAuditResult] = useState(null);

  const [loadingAudit, setLoadingAudit] = useState(false);

  useEffect(() => {
    const initialScores = {};

    matches.forEach((match) => {
      if (match.score && match.score !== "---" && match.score.includes("-")) {
        const [homeGoals, awayGoals] = match.score.split("-");

        let homePenalties = "";
        let awayPenalties = "";

        if (match.penalties && match.penalties !== "---") {
          [homePenalties, awayPenalties] = match.penalties.split("-");
        }

        initialScores[match.id] = {
          homeGoals,
          awayGoals,
          homePenalties,
          awayPenalties,
        };
      } else {
        initialScores[match.id] = {
          homeGoals: "",
          awayGoals: "",
          homePenalties: "",
          awayPenalties: "",
        };
      }
    });

    setScores(initialScores);
  }, [matches]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const approvedUsers = await getApprovedUsers();

    approvedUsers.sort((a, b) => a.displayName.localeCompare(b.displayName));

    setUsers(approvedUsers);
  };

  const handleAudit = async () => {
    try {
      if (!selectedUser) {
        alert("Debes seleccionar un usuario");
        return;
      }

      setLoadingAudit(true);

      const token = await auth.currentUser.getIdToken();

      const response = await fetch(`${BASE_URL}/admin/audit-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: selectedUser,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error realizando auditoría");
      }

      setAuditResult(data.audit);
    } catch (error) {
      console.error(error);

      alert("Error realizando auditoría");
    } finally {
      setLoadingAudit(false);
    }
  };

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

      const match = matches.find((m) => m.id === matchId);

      if (
        match?.allowPenalties &&
        scoreData.homeGoals === scoreData.awayGoals
      ) {
        if (scoreData.homePenalties === "" || scoreData.awayPenalties === "") {
          alert("Debes ingresar el resultado de los penales");
          return;
        }

        if (scoreData.homePenalties === scoreData.awayPenalties) {
          alert("Los penales no pueden terminar empatados");
          return;
        }
      }

      setSavingMatchId(matchId);

      const token = await auth.currentUser.getIdToken();

      const response = await fetch(`${BASE_URL}/admin/update-match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          matchId,
          homeGoals: Number(scoreData.homeGoals),
          awayGoals: Number(scoreData.awayGoals),

          homePenalties:
            scoreData.homePenalties === ""
              ? null
              : Number(scoreData.homePenalties),

          awayPenalties:
            scoreData.awayPenalties === ""
              ? null
              : Number(scoreData.awayPenalties),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error actualizando resultado");
      }

      localStorage.removeItem("matches");
      localStorage.removeItem("ranking");

      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("ranking_")) {
          localStorage.removeItem(key);
        }
      });

      if (loadData) {
        await loadData();
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

      const token = await auth.currentUser.getIdToken();

      const response = await fetch(`${BASE_URL}/admin/rebuild-ranking`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error reconstruyendo ranking");
      }

      if (loadData) {
        await loadData();
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

  const handlePopulateQualified = async () => {
    try {
      const token = await auth.currentUser.getIdToken();

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/populate-qualified`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      localStorage.removeItem("matches");

      if (loadData) {
        await loadData();
      }

      alert("Clasificados actualizados correctamente.");
    } catch (error) {
      console.error(error);
      alert("Error actualizando clasificados.");
    }
  };

  const groupedDetails = auditResult?.details.reduce((acc, item) => {
    if (!acc[item.round]) {
      acc[item.round] = [];
    }

    acc[item.round].push(item);

    return acc;
  }, {});

  return (
    <>
      <h1 className="page-title">Panel de Administración</h1>

      <div className="admin-tabs">
        <button
          className={activeTab === "ranking" ? "admin-tab active" : "admin-tab"}
          onClick={() => setActiveTab("ranking")}
        >
          Ranking
        </button>

        <button
          className={activeTab === "results" ? "admin-tab active" : "admin-tab"}
          onClick={() => setActiveTab("results")}
        >
          Resultados Oficiales
        </button>

        <button
          className={activeTab === "audit" ? "admin-tab active" : "admin-tab"}
          onClick={() => setActiveTab("audit")}
        >
          Auditoría
        </button>
      </div>

      {activeTab === "ranking" && (
        <div className="admin-card">
          <button
            className="admin-save-btn"
            onClick={() => {
              const confirmed = window.confirm(
                "¿Estás seguro de reconstruir completamente el ranking?",
              );

              if (confirmed) {
                handleRebuildRanking();
              }
            }}
            disabled={rebuildingRanking}
          >
            {rebuildingRanking
              ? "Reconstruyendo Ranking..."
              : "Reconstruir Ranking"}
          </button>

          <button
            className="admin-save-btn"
            style={{ marginTop: "15px" }}
            onClick={() => {
              const confirmed = window.confirm(
                "¿Actualizar automáticamente los equipos clasificados?",
              );

              if (confirmed) {
                handlePopulateQualified();
              }
            }}
          >
            Actualizar Clasificados
          </button>
        </div>
      )}
      {activeTab === "results" && (
        <>
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
                          handleScoreChange(
                            match.id,
                            "homeGoals",
                            e.target.value,
                          )
                        }
                        disabled={match.score !== "---"}
                      />

                      <span>-</span>

                      <input
                        type="number"
                        min="0"
                        value={scores[match.id]?.awayGoals ?? ""}
                        onChange={(e) =>
                          handleScoreChange(
                            match.id,
                            "awayGoals",
                            e.target.value,
                          )
                        }
                        disabled={match.score !== "---"}
                      />
                    </div>

                    {match.allowPenalties &&
                      scores[match.id]?.homeGoals !== "" &&
                      scores[match.id]?.homeGoals ===
                        scores[match.id]?.awayGoals && (
                        <>
                          <p className="admin-penalties-title">Penales</p>

                          <div className="admin-score-editor">
                            <input
                              type="number"
                              min="0"
                              value={scores[match.id]?.homePenalties ?? ""}
                              onChange={(e) =>
                                handleScoreChange(
                                  match.id,
                                  "homePenalties",
                                  e.target.value,
                                )
                              }
                              disabled={match.score !== "---"}
                            />

                            <span>-</span>

                            <input
                              type="number"
                              min="0"
                              value={scores[match.id]?.awayPenalties ?? ""}
                              onChange={(e) =>
                                handleScoreChange(
                                  match.id,
                                  "awayPenalties",
                                  e.target.value,
                                )
                              }
                              disabled={match.score !== "---"}
                            />
                          </div>
                        </>
                      )}

                    {match.score === "---" ? (
                      <button
                        className="admin-save-btn"
                        onClick={() => handleSaveResult(match.id)}
                        disabled={savingMatchId === match.id}
                      >
                        {savingMatchId === match.id
                          ? "Guardando..."
                          : "Guardar Resultado"}
                      </button>
                    ) : (
                      <button
                        className="admin-save-btn admin-save-btn-disabled"
                        disabled
                      >
                        ✅ Resultado Registrado
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
      {activeTab === "audit" && (
        <div className="admin-card">
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <h2 className="audit-title">Auditoría de Usuario</h2>

            {!auditResult ? (
              <>
                <select
                  className="admin-select"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                >
                  <option value="">Selecciona un usuario</option>

                  {users.map((user) => (
                    <option key={user.uid} value={user.uid}>
                      {user.displayName}
                    </option>
                  ))}
                </select>

                <button
                  className="admin-save-btn"
                  onClick={handleAudit}
                  disabled={loadingAudit}
                >
                  {loadingAudit ? "Auditando..." : "Realizar Auditoría"}
                </button>
              </>
            ) : (
              <>
                <div className="audit-results">
                  <h3>{auditResult.displayName}</h3>

                  <br />

                  {Object.entries(groupedDetails).map(([round, matches]) => (
                    <div key={round}>
                      <h2
                        style={{
                          marginTop: "24px",
                          marginBottom: "16px",
                          color: "#ffd54f",
                          borderBottom: "2px solid rgba(255,255,255,0.2)",
                          paddingBottom: "6px",
                        }}
                      >
                        🏆 {round}
                      </h2>

                      {matches.map((item, index) => (
                        <div
                          key={index}
                          style={{
                            marginBottom: "16px",
                            paddingBottom: "16px",
                            borderBottom: "1px solid rgba(255,255,255,0.15)",
                          }}
                        >
                          <strong>{item.match}</strong>
                          <br />
                          Resultado: {item.result}
                          {item.penalties && item.penalties !== "---" && (
                            <>
                              <br />
                              Penales: {item.penalties}
                            </>
                          )}
                          <br />
                          Predicción:{" "}
                          {item.prediction
                            ? `${item.prediction.homeGoals}-${item.prediction.awayGoals}`
                            : "Sin predicción"}
                          {item.prediction?.homePenalties !== undefined &&
                            item.prediction?.awayPenalties !== undefined && (
                              <>
                                <br />
                                Penales predichos:{" "}
                                {item.prediction.homePenalties}-
                                {item.prediction.awayPenalties}
                              </>
                            )}
                          <br />
                          Estado: {item.status}
                          <br />
                          <strong>Puntos: {item.points}</strong>
                        </div>
                      ))}
                    </div>
                  ))}

                  <br />
                  <hr style={{ margin: "25px 0" }} />

                  <h3>🏆 Pronóstico Especial</h3>

                  <p>
                    Finalista 1:{" "}
                    {auditResult.specialPrediction?.finalist1 ||
                      "Sin pronóstico"}
                  </p>

                  <p>
                    Finalista 2:{" "}
                    {auditResult.specialPrediction?.finalist2 ||
                      "Sin pronóstico"}
                  </p>

                  <p>
                    Campeón:{" "}
                    {auditResult.specialPrediction?.champion ||
                      "Sin pronóstico"}
                  </p>

                  {auditResult.specialResults && (
                    <>
                      <br />

                      <p>
                        <strong>Finalistas reales:</strong>{" "}
                        {auditResult.specialResults.finalist1} vs{" "}
                        {auditResult.specialResults.finalist2}
                      </p>

                      <p>
                        <strong>Campeón real:</strong>{" "}
                        {auditResult.specialResults.champion}
                      </p>
                    </>
                  )}

                  <hr style={{ margin: "25px 0" }} />

                  <h3>
                    Total por partidos:{" "}
                    {auditResult.calculatedPoints - auditResult.specialPoints}
                  </h3>

                  <h3>Pronóstico especial: +{auditResult.specialPoints}</h3>

                  <h3>Total calculado: {auditResult.calculatedPoints}</h3>

                  <h3>Ranking actual: {auditResult.rankingPoints}</h3>

                  {auditResult.calculatedPoints ===
                  auditResult.rankingPoints ? (
                    <h3 style={{ color: "#4ade80" }}>✅ Coincide</h3>
                  ) : (
                    <h3 style={{ color: "#f87171" }}>
                      ⚠ Inconsistencia detectada
                    </h3>
                  )}
                </div>

                <button
                  className="admin-save-btn"
                  onClick={() => {
                    setAuditResult(null);
                    setSelectedUser("");
                  }}
                >
                  Retroceder
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default AdminPage;
