export const canPredict = (matchDate) => {
  const now = new Date();

  const deadline = new Date(`${matchDate}T23:59:59`);

  deadline.setDate(deadline.getDate() - 1);

  return now <= deadline;
};
