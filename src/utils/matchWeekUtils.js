export function getUpcomingWeekMatches(matches) {
  if (!matches.length) return [];

  const sortedMatches = [...matches].sort((a, b) =>
    a.matchDate.localeCompare(b.matchDate),
  );

  const today = new Date();

  const nextMatch = sortedMatches.find(
    (match) => new Date(`${match.matchDate}T00:00:00`) >= today,
  );

  if (!nextMatch) {
    return sortedMatches;
  }

  const startDate = new Date(`${nextMatch.matchDate}T00:00:00`);

  const endDate = new Date(startDate);

  endDate.setDate(endDate.getDate() + 6);

  return sortedMatches.filter((match) => {
    const matchDate = new Date(`${match.matchDate}T00:00:00`);

    return matchDate >= startDate && matchDate <= endDate;
  });
}
