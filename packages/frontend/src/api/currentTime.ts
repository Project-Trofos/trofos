export const CURRENT_YEAR = Number(process.env.CURRENT_YEAR ?? '2022');
export const CURRENT_SEM = Number(process.env.CURRENT_SEM ?? '1');

type InputType = number | null | undefined;

// Checks if a particular year/sem is current
export const isCurrent = (
  startYear: InputType,
  startSem: InputType,
  endYear: InputType,
  endSem: InputType,
): boolean => {
  // If year/sem is unknown, consider it to be current
  if (!startYear || !endYear || !startSem || !endSem) {
    return true;
  }
  return startYear <= CURRENT_YEAR && CURRENT_YEAR <= endYear && startSem <= CURRENT_SEM && CURRENT_SEM <= endSem;
};

// Checks if a particular year/sem is in the past
export const isPast = (startYear: InputType, startSem: InputType, endYear: InputType, endSem: InputType): boolean => {
  // If year/sem is unknown, consider it to be current
  if (!startYear || !endYear || !startSem || !endSem) {
    return false;
  }
  return endYear < CURRENT_YEAR || (endYear === CURRENT_YEAR && endSem < CURRENT_SEM);
};

// Checks if a particular year/sem is in the future
export const isFuture = (startYear: InputType, startSem: InputType, endYear: InputType, endSem: InputType): boolean => {
  // If year/sem is unknown, consider it to be current
  if (!startYear || !endYear || !startSem || !endSem) {
    return false;
  }
  return CURRENT_YEAR < startYear || (CURRENT_YEAR === startYear && CURRENT_SEM < startSem);
};
