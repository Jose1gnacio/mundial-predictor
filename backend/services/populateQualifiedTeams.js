import { db } from "../firebase.js";
import { buildGroupStandings } from "../../shared/groupStandingsUtils.js";

export async function populateQualifiedTeams() {
  const matchesSnapshot = await db.collection("matches").get();

  const matches = matchesSnapshot.docs.map((doc) => doc.data());

  const groups = buildGroupStandings(matches);

  const knockoutMatches = matches.filter((match) => match.round === "16AVOS");

  const batch = db.batch();

  for (const match of knockoutMatches) {
    const updates = {};

    if (
      match.homeSource?.startsWith("1") ||
      match.homeSource?.startsWith("2")
    ) {
      const position = Number(match.homeSource[0]);
      const group = `GRUPO ${match.homeSource[1]}`;

      updates.home = groups[group][position - 1].team;
    }

    if (
      match.awaySource?.startsWith("1") ||
      match.awaySource?.startsWith("2")
    ) {
      const position = Number(match.awaySource[0]);
      const group = `GRUPO ${match.awaySource[1]}`;

      updates.away = groups[group][position - 1].team;
    }

    if (Object.keys(updates).length > 0) {
      batch.update(db.collection("matches").doc(match.id), updates);
    }
  }

  await batch.commit();
}
