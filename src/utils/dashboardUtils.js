import { calculateUserStats, calculatePoints } from "./scoringUtils";

export function buildRanking(approvedUsers, predictions, matches) {
  const ranking = approvedUsers.map((user) => {
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

  ranking.sort((a, b) => b.points - a.points);

  return ranking;
}

export function getUserRank(userId, ranking) {
  const index = ranking.findIndex((user) => user.uid === userId);

  if (index === -1) {
    return "-";
  }

  return index + 1;
}

export function buildDashboardStats(
  userId,
  predictionsObject,
  matches,
  ranking,
) {
  const stats = calculateUserStats(matches, predictionsObject);

  const rank = getUserRank(userId, ranking);

  const rankingUser = ranking.find((user) => user.uid === userId);

  return {
    rank,
    points: rankingUser?.points || 0,
    exacts: stats.exacts,
    winners: stats.winners,
    failed: stats.failed,
    missing: stats.missing,
  };
}
