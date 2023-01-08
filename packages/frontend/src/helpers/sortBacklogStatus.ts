/**
 * Sort backlog status according to type
 */

import { BacklogStatusData } from '../api/types';

const backlogStatusCompareFunc = (
  s1: Omit<BacklogStatusData, 'project_id'>,
  s2: Omit<BacklogStatusData, 'project_id'>,
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

export const sortBacklogStatus = (
  statuses: Omit<BacklogStatusData, 'project_id'>[],
): Omit<BacklogStatusData, 'project_id'>[] => {
  // deep copy statuses array
  const sortedStatuses = statuses.map((s) => {
    return { ...s };
  });
  sortedStatuses.sort(backlogStatusCompareFunc);

  return sortedStatuses;
};
