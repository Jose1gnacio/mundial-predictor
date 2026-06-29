import { db } from "../firebase.js";
import { updateSpecialPoints } from "./updateSpecialPointsService.js";
import { updateSpecialResults } from "./specialResultsService.js";

function getWinner(homeGoals, awayGoals) {
  if (homeGoals > awayGoals) {
    return "HOME";
  }

  if (awayGoals > homeGoals) {
    return "AWAY";
  }

  return "DRAW";
}

function parseScore(score) {
  if (!score || score === "---" || score === "-") {
    return null;
  }

  const [homeGoals, awayGoals] = score
    .split("-")
    .map((goal) => Number(goal.trim()));

  return {
    homeGoals,
    awayGoals,
  };
}

function parsePenalties(penalties) {
  if (!penalties || penalties === "---" || penalties === "-") {
    return null;
  }

  const [homePenalties, awayPenalties] = penalties
    .split("-")
    .map((goal) => Number(goal.trim()));

  return {
    homePenalties,
    awayPenalties,
  };
}

function calculatePoints(match, prediction) {
  const parsedScore = parseScore(match.score);

  if (!parsedScore || !prediction) {
    return {
      points: 0,
      exact: false,
      winner: false,
    };
  }

  const realHomeGoals = parsedScore.homeGoals;
  const realAwayGoals = parsedScore.awayGoals;

  const predictedHomeGoals = prediction.homeGoals;
  const predictedAwayGoals = prediction.awayGoals;

  const realWinner = getWinner(realHomeGoals, realAwayGoals);
  const predictedWinner = getWinner(predictedHomeGoals, predictedAwayGoals);

  // ===== FASE DE GRUPOS =====

  if (!match.allowPenalties) {
    if (
      realHomeGoals === predictedHomeGoals &&
      realAwayGoals === predictedAwayGoals
    ) {
      return {
        points: 4,
        exact: true,
        winner: true,
      };
    }

    if (realWinner === predictedWinner) {
      return {
        points: 1,
        exact: false,
        winner: true,
      };
    }

    return {
      points: 0,
      exact: false,
      winner: false,
    };
  }

  // ===== FASE FINAL =====

  let points = 0;

  const exact =
    realHomeGoals === predictedHomeGoals &&
    realAwayGoals === predictedAwayGoals;

  // Si el partido terminó empatado

  if (realWinner === "DRAW") {
    const realPenalties = parsePenalties(match.penalties);

    const realPenaltyWinner = realPenalties
      ? getWinner(realPenalties.homePenalties, realPenalties.awayPenalties)
      : null;

    // Caso 1: el usuario predijo empate
    if (predictedWinner === "DRAW") {
      points += 1;

      if (exact) {
        points += 3;
      }

      if (
        realPenalties &&
        prediction.homePenalties !== undefined &&
        prediction.awayPenalties !== undefined
      ) {
        const predictedPenaltyWinner = getWinner(
          prediction.homePenalties,
          prediction.awayPenalties,
        );

        if (realPenaltyWinner === predictedPenaltyWinner) {
          points += 1;
        }

        if (
          realPenalties.homePenalties === prediction.homePenalties &&
          realPenalties.awayPenalties === prediction.awayPenalties
        ) {
          points += 1;
        }
      }

      return {
        points,
        exact,
        winner: true,
      };
    }

    // Caso 2: NO predijo empate,
    // pero acertó el equipo que finalmente clasificó por penales

    if (realPenaltyWinner && predictedWinner === realPenaltyWinner) {
      return {
        points: 1,
        exact: false,
        winner: true,
      };
    }

    return {
      points: 0,
      exact: false,
      winner: false,
    };
  }

  // Partido NO terminó empatado

  if (exact) {
    return {
      points: 4,
      exact: true,
      winner: true,
    };
  }

  if (realWinner === predictedWinner) {
    return {
      points: 1,
      exact: false,
      winner: true,
    };
  }

  return {
    points: 0,
    exact: false,
    winner: false,
  };
}

export async function rebuildRanking() {
  const approvedUsersSnapshot = await db
    .collection("users")
    .where("status", "==", "approved")
    .get();

  const matchesSnapshot = await db.collection("matches").get();

  const predictionsSnapshot = await db.collection("predictions").get();

  const specialPredictionsSnapshot = await db
    .collection("specialPredictions")
    .get();

  const specialResultsDoc = await db
    .collection("specialResults")
    .doc("worldCup2026")
    .get();

  const specialPredictions = specialPredictionsSnapshot.docs.map((doc) =>
    doc.data(),
  );

  const specialResults = specialResultsDoc.exists
    ? specialResultsDoc.data()
    : null;

  const users = approvedUsersSnapshot.docs.map((doc) => doc.data());

  const matches = matchesSnapshot.docs.map((doc) => doc.data());

  const predictions = predictionsSnapshot.docs.map((doc) => doc.data());

  const ranking = [];

  for (const user of users) {
    const userPredictions = predictions.filter(
      (prediction) => prediction.userId === user.uid,
    );

    const specialPrediction = specialPredictions.find(
      (prediction) => prediction.userId === user.uid,
    );

    let points = 0;
    let exacts = 0;
    let winners = 0;
    let failed = 0;
    let missing = 0;
    let specialPoints = 0;

    matches.forEach((match) => {
      const prediction = userPredictions.find((p) => p.matchId === match.id);

      const parsedScore = parseScore(match.score);

      if (!prediction) {
        missing++;

        return;
      }

      if (!parsedScore) {
        return;
      }

      const matchResult = calculatePoints(match, prediction);

      points += matchResult.points;

      if (matchResult.exact) {
        exacts++;
        return;
      }

      if (matchResult.winner) {
        winners++;
        return;
      }

      failed++;
    });

    // ------------------ PUNTOS ESPECIALES ------------------

    if (specialPrediction && specialResults) {
      if (
        specialPrediction.finalist1 === specialResults.finalist1 ||
        specialPrediction.finalist1 === specialResults.finalist2
      ) {
        specialPoints += 5;
      }

      if (
        specialPrediction.finalist2 === specialResults.finalist1 ||
        specialPrediction.finalist2 === specialResults.finalist2
      ) {
        specialPoints += 5;
      }

      if (specialPrediction.champion === specialResults.champion) {
        specialPoints += 10;
      }

      points += specialPoints;
    }

    ranking.push({
      uid: user.uid,
      displayName: user.displayName,

      points,

      exacts,
      winners,
      failed,
      missing,
      rank: 0,
    });
  }

  ranking.sort((a, b) => b.points - a.points);

  for (let i = 0; i < ranking.length; i++) {
    ranking[i].rank = i + 1;
  }

  const batch = db.batch();

  ranking.forEach((user) => {
    const ref = db.collection("ranking").doc(user.uid);

    batch.set(ref, user);
  });

  await batch.commit();

  return ranking.length;
}

export async function updateRankingForMatch(matchId) {
  const matchDoc = await db.collection("matches").doc(matchId).get();

  if (!matchDoc.exists) {
    throw new Error("Partido no encontrado");
  }

  const match = matchDoc.data();

  if (!match.score || match.score === "---") {
    return;
  }

  const predictionsSnapshot = await db
    .collection("predictions")
    .where("matchId", "==", matchId)
    .get();

  const batch = db.batch();

  for (const predictionDoc of predictionsSnapshot.docs) {
    const prediction = predictionDoc.data();

    const rankingRef = db.collection("ranking").doc(prediction.userId);

    const rankingDoc = await rankingRef.get();

    if (!rankingDoc.exists) {
      continue;
    }

    const rankingUser = rankingDoc.data();

    const matchResult = calculatePoints(match, prediction);

    let exacts = rankingUser.exacts || 0;
    let winners = rankingUser.winners || 0;
    let failed = rankingUser.failed || 0;

    if (matchResult.exact) {
      exacts += 1;
    } else if (matchResult.winner) {
      winners += 1;
    } else {
      failed += 1;
    }

    batch.update(rankingRef, {
      points: (rankingUser.points || 0) + matchResult.points,
      exacts,
      winners,
      failed,
    });
  }

  await batch.commit();

  if (matchId === "final") {
    await updateSpecialResults();

    await updateSpecialPoints();
  }

  const rankingSnapshot = await db.collection("ranking").get();

  const ranking = rankingSnapshot.docs.map((doc) => ({
    uid: doc.id,
    ...doc.data(),
  }));

  ranking.sort((a, b) => b.points - a.points);

  const rankBatch = db.batch();

  ranking.forEach((user, index) => {
    const ref = db.collection("ranking").doc(user.uid);

    rankBatch.update(ref, {
      rank: index + 1,
    });
  });

  await rankBatch.commit();
}

export async function auditUser(userId) {
  const matchesSnapshot = await db.collection("matches").get();

  const predictionsSnapshot = await db.collection("predictions").get();

  const rankingDoc = await db.collection("ranking").doc(userId).get();

  const specialPredictionDoc = await db
    .collection("specialPredictions")
    .doc(userId)
    .get();

  const specialResultsDoc = await db
    .collection("specialResults")
    .doc("worldCup2026")
    .get();

  const matches = matchesSnapshot.docs
    .map((doc) => doc.data())
    .filter((match) => match.score && match.score !== "---")
    .sort((a, b) => {
      const dateA = new Date(`${a.matchDate} ${a.time}`);
      const dateB = new Date(`${b.matchDate} ${b.time}`);

      return dateA - dateB;
    });

  const predictions = predictionsSnapshot.docs
    .map((doc) => doc.data())
    .filter((prediction) => prediction.userId === userId);

  const ranking = rankingDoc.exists ? rankingDoc.data() : null;

  const specialPrediction = specialPredictionDoc.exists
    ? specialPredictionDoc.data()
    : null;

  const specialResults = specialResultsDoc.exists
    ? specialResultsDoc.data()
    : null;

  let totalPoints = 0;

  let exacts = 0;

  let winners = 0;

  let failed = 0;

  let missing = 0;

  let specialPoints = 0;

  const details = [];

  for (const match of matches) {
    const prediction = predictions.find((p) => p.matchId === match.id);

    const parsedScore = parseScore(match.score);

    if (!prediction) {
      if (parsedScore) {
        missing++;
      }

      details.push({
        matchId: match.id,
        round: match.round,
        match: `${match.home} vs ${match.away}`,
        result: match.score,
        penalties: match.penalties,
        prediction: null,
        points: 0,
        status: "Sin predicción",
      });

      continue;
    }

    if (!parsedScore) {
      details.push({
        matchId: match.id,
        round: match.round,
        match: `${match.home} vs ${match.away}`,
        result: "---",
        penalties: "---",
        prediction,
        points: 0,
        status: "Pendiente",
      });

      continue;
    }

    const matchResult = calculatePoints(match, prediction);

    totalPoints += matchResult.points;

    if (matchResult.exact) {
      exacts++;
    } else if (matchResult.winner) {
      winners++;
    } else {
      failed++;
    }

    details.push({
      matchId: match.id,
      round: match.round,
      match: `${match.home} vs ${match.away}`,
      result: match.score,
      penalties: match.penalties,
      prediction,
      points: matchResult.points,
      exact: matchResult.exact,
      winner: matchResult.winner,
      status: matchResult.exact
        ? "Exacto"
        : matchResult.winner
          ? "Ganador"
          : "Fallado",
    });
  }
  // ==========================================
  // PRONÓSTICOS ESPECIALES
  // ==========================================

  if (specialPrediction && specialResults) {
    const predictedFinalists = [
      specialPrediction.finalist1,
      specialPrediction.finalist2,
    ];

    const finalist1Correct = predictedFinalists.includes(
      specialResults.finalist1,
    );

    const finalist2Correct = predictedFinalists.includes(
      specialResults.finalist2,
    );

    const championCorrect =
      specialPrediction.champion === specialResults.champion;

    if (finalist1Correct) {
      specialPoints += 5;
    }

    if (finalist2Correct) {
      specialPoints += 5;
    }

    if (championCorrect) {
      specialPoints += 10;
    }

    totalPoints += specialPoints;
  }

  return {
    ranking,

    calculatedPoints: totalPoints,

    rankingPoints: ranking?.points || 0,

    exacts,

    winners,

    failed,

    missing,

    specialPoints,

    specialPrediction,

    specialResults,

    details,
  };
}
