import { admin } from "../firebase.js";

const ADMIN_UID = "6q5tXh0cWYQmyMPnkPmKIXeN9S12";

export async function verifyAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Token no proporcionado",
      });
    }

    const token = authHeader.split("Bearer ")[1];

    const decodedToken = await admin.auth().verifyIdToken(token);

    if (decodedToken.uid !== ADMIN_UID) {
      return res.status(403).json({
        success: false,
        error: "Acceso denegado",
      });
    }

    req.user = decodedToken;

    next();
  } catch (error) {
    console.error(error);

    return res.status(401).json({
      success: false,
      error: "Token inválido",
    });
  }
}
