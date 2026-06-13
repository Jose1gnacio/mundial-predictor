export function getChileToday() {
  const nowChile = new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "America/Santiago",
    }),
  );

  const year = nowChile.getFullYear();

  const month = String(nowChile.getMonth() + 1).padStart(2, "0");

  const day = String(nowChile.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatDateTitle(matchDate) {
  const date = new Date(`${matchDate}T00:00:00`);

  const days = [
    "DOMINGO",
    "LUNES",
    "MARTES",
    "MIÉRCOLES",
    "JUEVES",
    "VIERNES",
    "SÁBADO",
  ];

  const months = [
    "ENERO",
    "FEBRERO",
    "MARZO",
    "ABRIL",
    "MAYO",
    "JUNIO",
    "JULIO",
    "AGOSTO",
    "SEPTIEMBRE",
    "OCTUBRE",
    "NOVIEMBRE",
    "DICIEMBRE",
  ];

  const dayName = days[date.getDay()];

  const dayNumber = date.getDate();

  const monthName = months[date.getMonth()];

  return `${dayName} ${dayNumber} DE ${monthName}`;
}

export function buildPredictionGroups(matches) {
  const todayChile = getChileToday();

  const activeRounds = {};

  const finishedRounds = {};

  matches.forEach((match) => {
    const isFinished = match.matchDate < todayChile;

    const target = isFinished ? finishedRounds : activeRounds;

    if (!target[match.round]) {
      target[match.round] = {};
    }

    if (!target[match.round][match.matchDate]) {
      target[match.round][match.matchDate] = [];
    }

    target[match.round][match.matchDate].push(match);
  });

  return {
    activeRounds,
    finishedRounds,
  };
}
