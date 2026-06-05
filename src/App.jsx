import { useEffect, useState, useRef } from "react";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import { auth, provider } from "./firebase";
import "./App.css";

import {
  getMatchesFromFirestore,
  getUserPredictions,
  saveUser,
  getUserById,
  getApprovedUsers,
  getAllPredictions,
} from "./services/firestoreApi";

import { buildRanking, buildDashboardStats } from "./utils/dashboardUtils";
import RulesPage from "./pages/RulesPage";
import MatchesPage from "./pages/MatchesPage";
import PredictionsPage from "./pages/PredictionsPage";
import ResultsPage from "./pages/ResultsPage";
import RankingPage from "./pages/RankingPage";
import PredictionDetailPage from "./pages/PredictionDetailPage";

function App() {
  const [user, setUser] = useState(null);

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
  const carouselRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setUserStatus(null);
        return;
      }

      await saveUser(currentUser);

      const firestoreUser = await getUserById(currentUser.uid);

      setUser(currentUser);

      setUserStatus(firestoreUser?.status || "pending");
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

    const loadData = async () => {
      setLoading(true);

      const matchesArray = await getMatchesFromFirestore();

      setMatches(matchesArray);

      const userPredictions = await loadPredictions(user.uid);

      const approvedUsers = await getApprovedUsers();

      const allPredictions = await getAllPredictions();

      const ranking = buildRanking(approvedUsers, allPredictions, matchesArray);

      const stats = buildDashboardStats(
        user.uid,
        userPredictions,
        matchesArray,
        ranking,
      );

      setDashboardStats(stats);

      setLoading(false);
    };

    loadData();
  }, [user, userStatus]);

  useEffect(() => {
    const carousel = carouselRef.current;

    if (!carousel) {
      return;
    }

    let interval;

    const startAutoScroll = () => {
      interval = setInterval(() => {
        if (
          carousel.scrollLeft + carousel.clientWidth >=
          carousel.scrollWidth - 5
        ) {
          carousel.scrollTo({
            left: 0,
            behavior: "smooth",
          });
        } else {
          carousel.scrollBy({
            left: 1,
            behavior: "auto",
          });
        }
      }, 20);
    };

    startAutoScroll();

    const stopAutoScroll = () => {
      clearInterval(interval);
    };

    carousel.addEventListener("mouseenter", stopAutoScroll);
    carousel.addEventListener("mouseleave", startAutoScroll);

    return () => {
      clearInterval(interval);

      carousel.removeEventListener("mouseenter", stopAutoScroll);

      carousel.removeEventListener("mouseleave", startAutoScroll);
    };
  }, [matches]);

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

  if (!user) {
    return (
      <div className="login-container">
        <h1>Mundial Predictor ⚽</h1>

        <button onClick={loginGoogle}>Iniciar sesión con Google</button>
      </div>
    );
  }

  if (userStatus === "pending") {
    return (
      <div className="login-container">
        <h1>Mundial Predictor ⚽</h1>

        <h2>⏳ Solicitud pendiente</h2>

        <p>Tu acceso está pendiente de aprobación por el administrador.</p>

        <button onClick={logout}>Cerrar sesión</button>
      </div>
    );
  }

  if (userStatus === "rejected") {
    return (
      <div className="login-container">
        <h1>Mundial Predictor ⚽</h1>

        <h2>❌ Acceso rechazado</h2>

        <p>Tu solicitud fue rechazada por el administrador.</p>

        <button onClick={logout}>Cerrar sesión</button>
      </div>
    );
  }

  return (
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
              <p>🏆 Puntos: {dashboardStats.points}</p>

              <p>🎯 Exactos: {dashboardStats.exacts}</p>

              <p>⚽ Ganadores: {dashboardStats.winners}</p>

              <p>❌ Fallados: {dashboardStats.failed}</p>

              <p>🚫 Sin predecir: {dashboardStats.missing}</p>
            </div>
          </div>
        </div>
      </header>
      <section className="carousel-section">
        <h3>Próximos partidos</h3>

        <div className="carousel" ref={carouselRef}>
          {matches.slice(0, 10).map((match, index) => (
            <div key={index} className="carousel-card">
              <p>
                {match.home} vs {match.away}
              </p>

              <small>{match.time}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="tabs-section">
        <Link to="/rules" className="tab-link">
          Reglas
        </Link>

        <Link to="/matches" className="tab-link">
          Partidos
        </Link>

        <Link to="/predictions" className="tab-link">
          Predicciones
        </Link>

        <Link to="/results" className="tab-link">
          Resultados
        </Link>

        <Link to="/ranking" className="tab-link">
          Clasificación
        </Link>
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
            element={<PredictionDetailPage loadPredictions={loadPredictions} />}
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

          <Route path="/ranking" element={<RankingPage matches={matches} />} />
        </Routes>
      </main>

      <button className="logout-btn" onClick={logout}>
        Cerrar sesión
      </button>
    </div>
  );
}

export default App;
