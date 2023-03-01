import { Backlog } from '../api/types';

export default function compareBacklogPriority(p1: Backlog['priority'], p2: Backlog['priority']) {
  const priorityToInt: { [K in NonNullable<typeof p1>]: number } = {
    very_low: 1,
    low: 2,
    medium: 3,
    high: 4,
    very_high: 5,
  };

  if (p1 === null && p2 === null) {
    return 0;
  }
  if (p1 === null) {
    return -1;
  }
  if (p2 === null) {
    return 1;
  }
  return priorityToInt[p1] - priorityToInt[p2];
}
