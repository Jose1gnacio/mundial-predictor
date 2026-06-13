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
  const [, month, day] = matchDate.split("-");

  const months = {
    "01": "ENERO",
    "02": "FEBRERO",
    "03": "MARZO",
    "04": "ABRIL",
    "05": "MAYO",
    "06": "JUNIO",
    "07": "JULIO",
    "08": "AGOSTO",
    "09": "SEPTIEMBRE",
    10: "OCTUBRE",
    11: "NOVIEMBRE",
    12: "DICIEMBRE",
  };

  return `${Number(day)} ${months[month]}`;
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
