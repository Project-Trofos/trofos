/**
 * Sort backlog status according to type
 */

import { BacklogStatusData } from '../api/types';

// eslint-disable-next-line import/prefer-default-export
const backlogStatusCompareFunc = (
  s1: Omit<BacklogStatusData, 'projectId'>,
  s2: Omit<BacklogStatusData, 'projectId'>,
): -1 | 0 | 1 => {
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
export const sortBacklogStatus = (
  statuses: Omit<BacklogStatusData, 'projectId'>[],
): Omit<BacklogStatusData, 'projectId'>[] => {
  // deep copy statuses array
  // eslint-disable-next-line arrow-body-style
  const sortedStatuses = statuses.map((s) => {
    return { ...s };
  });
  sortedStatuses.sort(backlogStatusCompareFunc);

  return sortedStatuses;
};
