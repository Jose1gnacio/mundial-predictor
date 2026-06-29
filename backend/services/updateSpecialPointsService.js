import { db } from "../firebase.js";

export async function updateSpecialPoints() {
  const specialResultsDoc = await db
    .collection("specialResults")
    .doc("worldCup2026")
    .get();

  if (!specialResultsDoc.exists) {
    return;
  }

  const specialResults = specialResultsDoc.data();

  if (
    !specialResults.finalist1 ||
    !specialResults.finalist2 ||
    !specialResults.champion
  ) {
    return;
  }

  const rankingSnapshot = await db.collection("ranking").get();

  const predictionsSnapshot = await db.collection("specialPredictions").get();

  const predictions = predictionsSnapshot.docs.map((doc) => doc.data());

  const batch = db.batch();

  rankingSnapshot.docs.forEach((rankingDoc) => {
    const ranking = rankingDoc.data();

    const prediction = predictions.find((p) => p.userId === ranking.uid);

    if (!prediction) return;

    let specialPoints = 0;

    const predictedFinalists = [prediction.finalist1, prediction.finalist2];

    if (predictedFinalists.includes(specialResults.finalist1)) {
      specialPoints += 5;
    }

    if (predictedFinalists.includes(specialResults.finalist2)) {
      specialPoints += 5;
    }

    if (prediction.champion === specialResults.champion) {
      specialPoints += 10;
    }

    batch.update(rankingDoc.ref, {
      points: (ranking.points || 0) + specialPoints,
    });
  });

  await batch.commit();
}
