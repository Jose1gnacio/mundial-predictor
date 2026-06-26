import { db } from "../firebase.js";
import { buildGroupStandings } from "../../shared/groupStandingsUtils.js";
import { worldCupGroups } from "../../shared/worldCupGroups.js";

function isGroupFinished(matches, groupTeams) {
  const playedMatches = matches.filter((match) => {
    if (!match.score || match.score === "---") {
      return false;
    }

    return groupTeams.includes(match.home) && groupTeams.includes(match.away);
  });

  return playedMatches.length === 6;
}

export async function populateQualifiedTeams() {
  const matchesSnapshot = await db.collection("matches").get();

  const matches = matchesSnapshot.docs.map((doc) => doc.data());

  const groups = buildGroupStandings(matches);

  const finishedGroups = {};

  Object.entries(worldCupGroups).forEach(([groupName, teams]) => {
    finishedGroups[groupName] = isGroupFinished(matches, teams);
  });

  const knockoutMatches = matches.filter((match) => match.round === "16AVOS");

  const batch = db.batch();

  for (const match of knockoutMatches) {
    const updates = {};

    // HOME
    if (
      match.homeSource?.startsWith("1") ||
      match.homeSource?.startsWith("2")
    ) {
      const position = Number(match.homeSource[0]);
      const group = `GRUPO ${match.homeSource[1]}`;

      if (finishedGroups[group]) {
        updates.home = groups[group][position - 1].team;
      }
    }

    // AWAY
    if (
      match.awaySource?.startsWith("1") ||
      match.awaySource?.startsWith("2")
    ) {
      const position = Number(match.awaySource[0]);
      const group = `GRUPO ${match.awaySource[1]}`;

      if (finishedGroups[group]) {
        updates.away = groups[group][position - 1].team;
      }
    }

    if (Object.keys(updates).length > 0) {
      batch.update(db.collection("matches").doc(match.id), updates);
    }
  }

  await batch.commit();
}
