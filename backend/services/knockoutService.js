import { db } from "../firebase.js";

function getWinner(score, penalties) {
  const [homeGoals, awayGoals] = score.split("-").map(Number);

  if (homeGoals > awayGoals) return "HOME";

  if (awayGoals > homeGoals) return "AWAY";

  if (!penalties || penalties === "---") {
    return null;
  }

  const [homePenalties, awayPenalties] = penalties.split("-").map(Number);

  return homePenalties > awayPenalties ? "HOME" : "AWAY";
}

export async function advanceWinner(matchId) {
  const matchDoc = await db.collection("matches").doc(matchId).get();

  if (!matchDoc.exists) return;

  const match = matchDoc.data();

  const winner = getWinner(match.score, match.penalties);

  if (!winner) return;

  const loser = winner === "HOME" ? "AWAY" : "HOME";

  const winnerTeam = winner === "HOME" ? match.home : match.away;

  const loserTeam = loser === "HOME" ? match.home : match.away;

  // ---------- GANADOR ----------
  const winnerSource = `winner_${matchId}`;

  const homeWinner = await db
    .collection("matches")
    .where("homeSource", "==", winnerSource)
    .get();

  for (const doc of homeWinner.docs) {
    await doc.ref.update({
      home: winnerTeam,
    });
  }

  const awayWinner = await db
    .collection("matches")
    .where("awaySource", "==", winnerSource)
    .get();

  for (const doc of awayWinner.docs) {
    await doc.ref.update({
      away: winnerTeam,
    });
  }

  // ---------- PERDEDOR ----------
  const loserSource = `loser_${matchId}`;

  const homeLoser = await db
    .collection("matches")
    .where("homeSource", "==", loserSource)
    .get();

  for (const doc of homeLoser.docs) {
    await doc.ref.update({
      home: loserTeam,
    });
  }

  const awayLoser = await db
    .collection("matches")
    .where("awaySource", "==", loserSource)
    .get();

  for (const doc of awayLoser.docs) {
    await doc.ref.update({
      away: loserTeam,
    });
  }
}
