import admin from "firebase-admin";
import fs from "fs";

// Lee el archivo JSON que descargaste de Firebase
const serviceAccount = JSON.parse(
  fs.readFileSync(
    "./mundial-predictor-7121f-firebase-adminsdk-fbsvc-8522ce4d1a.json",
    "utf-8",
  ),
);

// Inicializa Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Conexión a Firestore
const db = admin.firestore();

export { db, admin };
