import { worldCupGroups } from "./worldCupGroups.js";

export function buildGroupStandings(matches) {
  const groups = {};

  Object.entries(worldCupGroups).forEach(([groupName, teams]) => {
    groups[groupName] = teams.map((team) => ({
      team,
      pj: 0,
      g: 0,
      e: 0,
      p: 0,
      gf: 0,
      gc: 0,
      dg: 0,
      pts: 0,
    }));
  });

  matches.forEach((match) => {
    if (!match.score || match.score === "---" || !match.score.includes("-")) {
      return;
    }

    const [homeGoals, awayGoals] = match.score.split("-").map(Number);

    Object.values(groups).forEach((group) => {
      const homeTeam = group.find((t) => t.team === match.home);

      const awayTeam = group.find((t) => t.team === match.away);

      if (!homeTeam || !awayTeam) {
        return;
      }

      homeTeam.pj++;
      awayTeam.pj++;

      homeTeam.gf += homeGoals;
      homeTeam.gc += awayGoals;

      awayTeam.gf += awayGoals;
      awayTeam.gc += homeGoals;

      if (homeGoals > awayGoals) {
        homeTeam.g++;
        homeTeam.pts += 3;

        awayTeam.p++;
      } else if (awayGoals > homeGoals) {
        awayTeam.g++;
        awayTeam.pts += 3;

        homeTeam.p++;
      } else {
        homeTeam.e++;
        awayTeam.e++;

        homeTeam.pts++;
        awayTeam.pts++;
      }
    });
  });

  Object.values(groups).forEach((group) => {
    group.forEach((team) => {
      team.dg = team.gf - team.gc;
    });

    group.sort((a, b) => {
      if (b.pts !== a.pts) {
        return b.pts - a.pts;
      }

      if (b.dg !== a.dg) {
        return b.dg - a.dg;
      }

      return b.gf - a.gf;
    });
  });

  return groups;
}
