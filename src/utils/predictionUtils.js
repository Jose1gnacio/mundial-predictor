export function isPredictionClosed(matchDate) {
  const match = new Date(`${matchDate}T00:00:00`);

  const limitDate = new Date(match);

  limitDate.setDate(limitDate.getDate() - 1);

  limitDate.setHours(23, 59, 59, 999);

  const nowChile = new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "America/Santiago",
    }),
  );

  return nowChile > limitDate;
}
