import { useEffect, useState } from "react";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { Routes, Route, Navigate, NavLink } from "react-router-dom";
import { auth, provider } from "./firebase";
import "./App.css";
import {
  FaClipboardList,
  FaTrophy,
  FaBullseye,
  FaFutbol,
  FaMedal,
} from "react-icons/fa";

import {
  getMatchesFromFirestore,
  getUserPredictions,
  saveUser,
  getUserById,
  getRanking,
  getRankingByUser,
} from "./services/firestoreApi";

import RulesPage from "./pages/RulesPage";
import MatchesPage from "./pages/MatchesPage";
import PredictionsPage from "./pages/PredictionsPage";
import ResultsPage from "./pages/ResultsPage";
import RankingPage from "./pages/RankingPage";
import PredictionDetailPage from "./pages/PredictionDetailPage";
import UpcomingMatchesCarousel from "./components/UpcomingMatchesCarousel";
import AdminPage from "./pages/AdminPage";

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userStatus, setUserStatus] = useState(null);
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    rank: "-",
    points: 0,
    exacts: 0,
    winners: 0,
    failed: 0,
    missing: 0,
  });

  const [ranking, setRanking] = useState([]);

  const loadData = async () => {
    if (!user || userStatus !== "approved") return;

    setLoading(true);

    const matchesArray = await getMatchesFromFirestore();

    setMatches(matchesArray);

    await loadPredictions(user.uid);

    const rankingData = await getRanking();

    setRanking(rankingData);

    const rankingUser = await getRankingByUser(user.uid);

    if (rankingUser) {
      setDashboardStats({
        rank: rankingUser.rank || "-",
        points: rankingUser.points || 0,
        exacts: rankingUser.exacts || 0,
        winners: rankingUser.winners || 0,
        failed: rankingUser.failed || 0,
        missing: rankingUser.missing || 0,
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (!currentUser) {
          setUser(null);
          setUserStatus(null);
        } else {
          await saveUser(currentUser);

          const firestoreUser = await getUserById(currentUser.uid);

          setUser(currentUser);

          setUserStatus(firestoreUser?.status || "pending");
        }
      } catch (error) {
        console.error("Error verificando sesión:", error);

        setUser(null);
        setUserStatus(null);
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadPredictions = async (userId) => {
    const userPredictions = await getUserPredictions(userId);

    setPredictions(userPredictions);

    return userPredictions;
  };

  useEffect(() => {
    if (!user || userStatus !== "approved") return;

    loadData();
  }, [user, userStatus]);

  const loginGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);

      alert(`Bienvenido ${result.user.displayName}`);
    } catch (error) {
      console.error(error);

      alert("Error al iniciar sesión");
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  if (authLoading) {
    return (
      <div className="login-container">
        <h1 className="login-title">
          <span>Mundial de Predicciones</span>

          <span>La Verbena</span>

          <span>⚽</span>
        </h1>

        <h2>Cargando...</h2>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="login-container">
        <h1 className="login-title">
          <span>Mundial de Predicciones</span>

          <span>La Verbena</span>

          <span>⚽</span>
        </h1>

        <button onClick={loginGoogle} className="google-login-btn">
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path
              fill="#FFC107"
              d="M43.6 20.5H42V20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"
            />

            <path
              fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8C14.7 15.1 18.9 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
            />

            <path
              fill="#4CAF50"
              d="M24 44c5.2 0 10-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.2-8l-6.5 5C9.7 39.6 16.3 44 24 44z"
            />

            <path
              fill="#1976D2"
              d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.3 5.5-6.1 7.2l6.2 5.2C39.2 37 44 31.1 44 24c0-1.3-.1-2.3-.4-3.5z"
            />
          </svg>

          <span>Iniciar sesión con Google</span>
        </button>
      </div>
    );
  }

  if (userStatus === "pending") {
    return (
      <div className="login-container">
        <h1 className="login-title">
          <span>Mundial de Predicciones</span>

          <span>La Verbena</span>

          <span>⚽</span>
        </h1>

        <h2>⏳ Solicitud pendiente</h2>

        <p>Tu acceso está pendiente de aprobación por el administrador.</p>

        <button onClick={logout}>Cerrar sesión</button>
      </div>
    );
  }

  if (userStatus === "rejected") {
    return (
      <div className="login-container">
        <h1 className="login-title">
          <span>Mundial de Predicciones</span>

          <span>La Verbena</span>

          <span>⚽</span>
        </h1>

        <h2>❌ Acceso rechazado</h2>

        <p>Tu solicitud fue rechazada por el administrador.</p>

        <button onClick={logout}>Cerrar sesión</button>
      </div>
    );
  }

  return (
    <div className="app-background">
      <div className="app-container">
        <header className="top-header">
          <div className="dashboard-layout">
            <div className="dashboard-user">
              <img src={user.photoURL} alt="usuario" className="user-photo" />

              <h2>{user.displayName}</h2>
            </div>

            <div className="dashboard-content">
              <div className="ranking-section">
                <h1>{dashboardStats.rank}°</h1>

                <p>Lugar</p>
              </div>

              <div className="dashboard-stats">
                <p>
                  <span>🏆 Puntos</span>
                  <strong>{dashboardStats.points}</strong>
                </p>

                <p>
                  <span>🎯 Exactos</span>
                  <strong>{dashboardStats.exacts}</strong>
                </p>

                <p>
                  <span>⚽ Ganadores</span>
                  <strong>{dashboardStats.winners}</strong>
                </p>

                <p>
                  <span>❌ Fallados</span>
                  <strong>{dashboardStats.failed}</strong>
                </p>

                <p>
                  <span>🚫 Sin predecir</span>
                  <strong>{dashboardStats.missing}</strong>
                </p>
              </div>
            </div>
          </div>
        </header>

        <UpcomingMatchesCarousel matches={matches} />

        <section className="tabs-section">
          <NavLink
            to="/rules"
            className={({ isActive }) =>
              isActive ? "tab-link active-tab" : "tab-link"
            }
          >
            <FaClipboardList className="tab-icon rules-icon" /> Reglas
          </NavLink>

          <NavLink
            to="/matches"
            className={({ isActive }) =>
              isActive ? "tab-link active-tab" : "tab-link"
            }
          >
            <FaTrophy className="tab-icon groups-icon" /> Grupos
          </NavLink>

          <NavLink
            to="/predictions"
            className={({ isActive }) =>
              isActive ? "tab-link active-tab" : "tab-link"
            }
          >
            <FaBullseye className="tab-icon predictions-icon" /> Predicciones
          </NavLink>

          <NavLink
            to="/results"
            className={({ isActive }) =>
              isActive ? "tab-link active-tab" : "tab-link"
            }
          >
            <FaFutbol className="tab-icon results-icon" /> Resultados
          </NavLink>

          <NavLink
            to="/ranking"
            className={({ isActive }) =>
              isActive ? "tab-link active-tab" : "tab-link"
            }
          >
            <FaMedal className="tab-icon ranking-icon" /> Clasificación
          </NavLink>
        </section>

        <main className="content-section">
          <Routes>
            <Route path="/" element={<Navigate to="/rules" />} />

            <Route path="/rules" element={<RulesPage />} />

            <Route
              path="/matches"
              element={<MatchesPage matches={matches} loading={loading} />}
            />

            <Route
              path="/predictions"
              element={
                <PredictionsPage
                  matches={matches}
                  predictions={predictions}
                  loading={loading}
                />
              }
            />

            <Route
              path="/prediction/:id"
              element={
                <PredictionDetailPage loadPredictions={loadPredictions} />
              }
            />

            <Route
              path="/results"
              element={
                <ResultsPage
                  matches={matches}
                  predictions={predictions}
                  loading={loading}
                />
              }
            />

            <Route
              path="/ranking"
              element={
                <RankingPage
                  matches={matches}
                  ranking={ranking}
                  loading={loading}
                />
              }
            />

            <Route
              path="/admin"
              element={
                user?.uid === "6q5tXh0cWYQmyMPnkPmKIXeN9S12" ? (
                  <AdminPage matches={matches} loadData={loadData} />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
          </Routes>
        </main>

        <button className="logout-btn" onClick={logout}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export default App;
