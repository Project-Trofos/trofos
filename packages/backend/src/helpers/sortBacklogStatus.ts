/**
 * Sort backlog status according to type
 */

import { BacklogStatus } from '@prisma/client';

const backlogStatusCompareFunc = (s1: BacklogStatus, s2: BacklogStatus): -1 | 0 | 1 => {
  if (s1.type === s2.type) {
    if (s1.order < s2.order) {
      return -1;
    }

    if (s1.order > s2.order) {
      return 1;
    }

    return 0;
  }

  if (s1.type === 'todo' || s2.type === 'done') {
    return -1;
  }

  if (s1.type === 'done' || s2.type === 'todo') {
    return 1;
  }

  return 0;
};

// eslint-disable-next-line import/prefer-default-export
export const sortBacklogStatus = (statuses: BacklogStatus[]): BacklogStatus[] => {
  // deep copy statuses array
  // eslint-disable-next-line arrow-body-style
  const sortedStatuses = statuses.map((s) => {
    return { ...s };
  });
  sortedStatuses.sort(backlogStatusCompareFunc);

  return sortedStatuses;
};
