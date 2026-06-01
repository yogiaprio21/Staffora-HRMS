export const calculateInclusiveDays = (startDate?: string, endDate?: string) => {
  if (!startDate || !endDate || endDate < startDate) {
    return 0;
  }
  return Math.floor((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86_400_000) + 1;
};
