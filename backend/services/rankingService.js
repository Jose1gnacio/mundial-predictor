import { db } from "../firebase.js";

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

function calculatePoints(realScore, prediction) {
  const parsedScore = parseScore(realScore);

  if (!parsedScore || !prediction) {
    return 0;
  }

  const { homeGoals: realHomeGoals, awayGoals: realAwayGoals } = parsedScore;

  const predictedHomeGoals = prediction.homeGoals;
  const predictedAwayGoals = prediction.awayGoals;

  if (
    realHomeGoals === predictedHomeGoals &&
    realAwayGoals === predictedAwayGoals
  ) {
    return 4;
  }

  const realWinner = getWinner(realHomeGoals, realAwayGoals);

  const predictedWinner = getWinner(predictedHomeGoals, predictedAwayGoals);

  if (realWinner === predictedWinner) {
    return 1;
  }

  return 0;
}

export async function rebuildRanking() {
  const approvedUsersSnapshot = await db
    .collection("users")
    .where("status", "==", "approved")
    .get();

  const matchesSnapshot = await db.collection("matches").get();

  const predictionsSnapshot = await db.collection("predictions").get();

  const users = approvedUsersSnapshot.docs.map((doc) => doc.data());

  const matches = matchesSnapshot.docs.map((doc) => doc.data());

  const predictions = predictionsSnapshot.docs.map((doc) => doc.data());

  const ranking = [];

  for (const user of users) {
    const userPredictions = predictions.filter(
      (prediction) => prediction.userId === user.uid,
    );

    let points = 0;
    let exacts = 0;
    let winners = 0;
    let failed = 0;
    let missing = 0;

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

      const matchPoints = calculatePoints(match.score, prediction);

      points += matchPoints;

      if (matchPoints === 4) {
        exacts++;

        return;
      }

      if (matchPoints === 1) {
        winners++;

        return;
      }

      failed++;
    });

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

    const matchPoints = calculatePoints(match.score, prediction);

    let exacts = rankingUser.exacts || 0;
    let winners = rankingUser.winners || 0;
    let failed = rankingUser.failed || 0;

    if (matchPoints === 4) {
      exacts += 1;
    } else if (matchPoints === 1) {
      winners += 1;
    } else {
      failed += 1;
    }

    batch.update(rankingRef, {
      points: (rankingUser.points || 0) + matchPoints,
      exacts,
      winners,
      failed,
    });
  }

  await batch.commit();

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
