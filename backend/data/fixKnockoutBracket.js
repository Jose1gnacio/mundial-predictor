import { db } from "../firebase.js";
import finalPhaseMatches from "./finalPhaseMatches.js";

async function fixKnockoutBracket() {
  const knockoutRounds = [
    "8AVOS",
    "4TOS",
    "SEMIFINAL",
    "TERCER LUGAR",
    "FINAL",
  ];

  const matches = finalPhaseMatches.filter((match) =>
    knockoutRounds.includes(match.round),
  );

  console.log(`Actualizando ${matches.length} partidos...`);

  for (const match of matches) {
    await db.collection("matches").doc(match.id).update({
      home: match.home,
      away: match.away,
      homeSource: match.homeSource,
      awaySource: match.awaySource,
      matchDate: match.matchDate,
      time: match.time,
      round: match.round,
      allowPenalties: match.allowPenalties,
    });

    console.log(`✅ ${match.id} actualizado`);
  }

  console.log("\n🎉 Cuadro eliminatorio actualizado correctamente.");
  process.exit(0);
}

fixKnockoutBracket().catch((err) => {
  console.error(err);
  process.exit(1);
});
