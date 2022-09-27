export const CURRENT_YEAR = Number(process.env.CURRENT_YEAR ?? '2022');
export const CURRENT_SEM = Number(process.env.CURRENT_SEM ?? '1');

// Checks if a particular year/sem is current
export const isCurrent = (year: number | null | undefined, sem: number | null | undefined) => {
  // If year/sem is unknown, consider it to be current
  if (!year || !sem) {
    return true;
  }

  if (year < CURRENT_YEAR) {
    return false;
  }

  if (year === CURRENT_YEAR && sem < CURRENT_SEM) {
    return false;
  }

  return true;
};
