export function getWinner(homeGoals, awayGoals) {
  if (homeGoals > awayGoals) {
    return "HOME";
  }

  if (awayGoals > homeGoals) {
    return "AWAY";
  }

  return "DRAW";
}

export function parseScore(score) {
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

export function calculatePoints(realScore, prediction) {
  const parsedScore = parseScore(realScore);

  if (!parsedScore || !prediction) {
    return 0;
  }

  const { homeGoals: realHomeGoals, awayGoals: realAwayGoals } = parsedScore;

  const predictedHomeGoals = prediction.homeGoals;

  const predictedAwayGoals = prediction.awayGoals;

  // ✅ Marcador exacto
  if (
    realHomeGoals === predictedHomeGoals &&
    realAwayGoals === predictedAwayGoals
  ) {
    return 4;
  }

  const realWinner = getWinner(realHomeGoals, realAwayGoals);

  const predictedWinner = getWinner(predictedHomeGoals, predictedAwayGoals);

  // 🟨 Solo ganador
  if (realWinner === predictedWinner) {
    return 1;
  }

  // ❌ Error
  return 0;
}

export function getPredictionStatus(realScore, prediction) {
  const parsedScore = parseScore(realScore);

  if (!parsedScore) {
    return "⏳ Pendiente";
  }

  if (!prediction) {
    return "🚫 Sin predicción";
  }

  const points = calculatePoints(realScore, prediction);

  if (points === 4) {
    return "✅ Exacto";
  }

  if (points === 1) {
    return "🟨 Ganador";
  }

  return "❌ Error";
}

export function calculateUserStats(matches, predictions) {
  let points = 0;

  let exacts = 0;

  let winners = 0;

  let failed = 0;

  let missing = 0;

  matches.forEach((match) => {
    const prediction = predictions?.[match.id];

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

  return {
    points,
    exacts,
    winners,
    failed,
    missing,
  };
}
