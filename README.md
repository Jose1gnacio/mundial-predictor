# Mundial Predictor ⚽

Aplicación web para realizar predicciones del Mundial de Fútbol 2026.

Los participantes pueden pronosticar resultados de los partidos, acumular puntos según sus aciertos y competir en una tabla de clasificación general.

---

## Funcionalidades

### Reglas y participación

- Inicio de sesión mediante Google.
- Registro automático de usuarios.
- Sistema de aprobación de participantes.
- Visualización de reglas del torneo.

### Predicciones

- Predicción de resultados por partido.
- Modificación de predicciones antes del cierre.
- Bloqueo automático de predicciones a las 23:59 del día anterior al partido.
- Visualización de predicciones guardadas.

### Resultados

- Comparación entre resultado real y predicción realizada.
- Cálculo automático de puntos.
- Identificación visual de:
  - Exacto
  - Ganador
  - Error
  - Pendiente

### Clasificación

- Ranking general de participantes.
- Ordenamiento automático por puntaje.
- Actualización en tiempo real desde Firestore.

### Dashboard

- Posición actual del usuario.
- Puntos acumulados.
- Cantidad de aciertos exactos.
- Cantidad de ganadores acertados.
- Cantidad de fallos.
- Cantidad de partidos sin predecir.

---

## Sistema de puntuación

| Resultado               | Puntos |
| ----------------------- | ------ |
| Acertar marcador exacto | 4      |
| Acertar solo ganador    | 1      |
| Error                   | 0      |

### Definiciones

- Si se acierta el ganador y además el marcador exacto: 4 puntos.
- Si se acierta únicamente el ganador: 1 punto.
- Si no se acierta el resultado: 0 puntos.
- En partidos definidos por penales, solamente se considerará el equipo ganador para efectos de puntuación.

---

## Tecnologías utilizadas

### Frontend

- React
- Vite
- React Router
- Firebase Authentication
- Firestore

### Backend

- Node.js
- Express
- Firebase Admin
- Playwright

### Base de datos

- Cloud Firestore

---

## Instalación local

### Clonar repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd mundial-predictor
```

### Instalar dependencias Frontend

```bash
npm install
```

### Instalar dependencias Backend

```bash
cd backend
npm install
```

---

## Variables de entorno

Crear archivo `.env` en la raíz del proyecto:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_API_URL=
```

---

## Ejecutar Frontend

```bash
npm run dev
```

---

## Ejecutar Backend

```bash
cd backend
npm run dev
```

---

## Estado del proyecto

Proyecto desarrollado para la gestión de predicciones del Mundial de Fútbol 2026, incluyendo autenticación, ranking, resultados y administración de participantes.
