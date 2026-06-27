import { db } from "../firebase.js";

function getWinner(score, penalties) {
  if (!score || score === "---") return null;

  const [homeGoals, awayGoals] = score.split("-").map(Number);

  if (homeGoals > awayGoals) return "HOME";

  if (awayGoals > homeGoals) return "AWAY";

  if (!penalties || penalties === "---") return null;

  const [homePenalties, awayPenalties] = penalties.split("-").map(Number);

  return homePenalties > awayPenalties ? "HOME" : "AWAY";
}

export async function updateSpecialResults() {
  const semifinal1 = await db.collection("matches").doc("semifinal_1").get();
  const semifinal2 = await db.collection("matches").doc("semifinal_2").get();
  const finalMatch = await db.collection("matches").doc("final").get();

  const updates = {};

  // ---------------- FINALISTAS ----------------

  if (semifinal1.exists) {
    const match = semifinal1.data();

    const winner = getWinner(match.score, match.penalties);

    if (winner) {
      updates.finalist1 = winner === "HOME" ? match.home : match.away;
    }
  }

  if (semifinal2.exists) {
    const match = semifinal2.data();

    const winner = getWinner(match.score, match.penalties);

    if (winner) {
      updates.finalist2 = winner === "HOME" ? match.home : match.away;
    }
  }

  // ---------------- CAMPEÓN ----------------

  if (finalMatch.exists) {
    const match = finalMatch.data();

    const winner = getWinner(match.score, match.penalties);

    if (winner) {
      updates.champion = winner === "HOME" ? match.home : match.away;
    }
  }

  if (Object.keys(updates).length === 0) {
    return;
  }

  updates.updatedAt = new Date().toISOString();

  await db
    .collection("specialResults")
    .doc("worldCup2026")
    .set(updates, { merge: true });
}
