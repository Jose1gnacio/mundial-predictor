import { db } from "./firebase.js";

async function testFirestore() {
  try {
    const docRef = await db.collection("matches").add({
      teamA: "Brasil",
      teamB: "Argentina",
      scoreA: 2,
      scoreB: 1,
      status: "finished",
      createdAt: new Date(),
    });

    console.log("✅ Documento creado correctamente con ID:", docRef.id);
  } catch (error) {
    console.error("❌ Error al escribir en Firestore:", error);
  }
}

testFirestore();
