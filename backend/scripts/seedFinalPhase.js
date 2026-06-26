import { db } from "../firebase.js";
import finalPhaseMatches from "../data/finalPhaseMatches.js";

async function seedFinalPhase() {
  try {
    let saved = 0;

    for (const match of finalPhaseMatches) {
      await db.collection("matches").doc(match.id).set(match, {
        merge: true,
      });

      saved++;
    }

    console.log(`✅ ${saved} partidos agregados correctamente.`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

seedFinalPhase();
