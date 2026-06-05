import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  setDoc,
} from "firebase/firestore";

import { db } from "../firebase";

export async function getMatchesFromFirestore() {
  try {
    const snapshot = await getDocs(collection(db, "matches"));

    const matches = snapshot.docs.map((doc) => doc.data());

    matches.sort((a, b) => {
      const dateComparison = a.matchDate.localeCompare(b.matchDate);

      if (dateComparison !== 0) {
        return dateComparison;
      }

      const timeA = a.time.split(" ")[1];
      const timeB = b.time.split(" ")[1];

      return timeA.localeCompare(timeB);
    });

    return matches;
  } catch (error) {
    console.error("Error Firestore:", error);

    return [];
  }
}

export async function getMatchById(matchId) {
  try {
    const matchRef = doc(db, "matches", matchId);

    const matchSnapshot = await getDoc(matchRef);

    if (!matchSnapshot.exists()) {
      return null;
    }

    return matchSnapshot.data();
  } catch (error) {
    console.error("Error obteniendo partido:", error);

    return null;
  }
}

export async function getUserPredictions(userId) {
  try {
    const predictionsRef = collection(db, "predictions");

    const q = query(predictionsRef, where("userId", "==", userId));

    const snapshot = await getDocs(q);

    const predictions = {};

    snapshot.forEach((doc) => {
      const data = doc.data();

      predictions[data.matchId] = data;
    });

    return predictions;
  } catch (error) {
    console.error("Error obteniendo predicciones:", error);

    return {};
  }
}

export async function getPrediction(userId, matchId) {
  try {
    const predictionId = `${userId}_${matchId}`;

    const predictionRef = doc(db, "predictions", predictionId);

    const predictionSnapshot = await getDoc(predictionRef);

    if (!predictionSnapshot.exists()) {
      return null;
    }

    return predictionSnapshot.data();
  } catch (error) {
    console.error("Error obteniendo predicción:", error);

    return null;
  }
}

export async function saveUser(user) {
  try {
    const userRef = doc(db, "users", user.uid);

    const existingUser = await getDoc(userRef);

    if (existingUser.exists()) {
      return existingUser.data();
    }

    const newUser = {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    await setDoc(userRef, newUser);

    return newUser;
  } catch (error) {
    console.error("Error guardando usuario:", error);

    return null;
  }
}

export async function getUserById(userId) {
  try {
    const userRef = doc(db, "users", userId);

    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
      return null;
    }

    return userSnapshot.data();
  } catch (error) {
    console.error("Error obteniendo usuario:", error);

    return null;
  }
}

export async function getApprovedUsers() {
  try {
    const usersRef = collection(db, "users");

    const q = query(usersRef, where("status", "==", "approved"));

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => doc.data());
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);

    return [];
  }
}

export async function getAllPredictions() {
  try {
    const snapshot = await getDocs(collection(db, "predictions"));

    return snapshot.docs.map((doc) => doc.data());
  } catch (error) {
    console.error("Error obteniendo todas las predicciones:", error);

    return [];
  }
}
