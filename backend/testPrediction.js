const response = await fetch("http://localhost:3000/predictions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    userId: "usuario_prueba",
    matchId: "jornada_1_mexico_sudafrica",
    homeGoals: 2,
    awayGoals: 1,
  }),
});

const data = await response.json();

console.log(data);
