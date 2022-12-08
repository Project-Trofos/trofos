/**
 * Sort backlog according to assignee & id
 */

import { Backlog } from '../api/backlog';

// eslint-disable-next-line import/prefer-default-export
const backlogCompareFunc = (b1: Backlog, b2: Backlog): -1 | 0 | 1 => {
  if (b1.assignee_id === b2.assignee_id) {
    if (b1.backlog_id < b2.backlog_id) {
      return -1;
    }

    if (b1.backlog_id > b2.backlog_id) {
      return 1;
    }

    return 0;
  }

  if (b1.assignee_id === null) {
    return 1;
  }

  if (b2.assignee_id === null) {
    return -1;
  }

  if (b1.assignee_id < b2.assignee_id) {
    return -1;
  }

  if (b1.assignee_id > b2.assignee_id) {
    return 1;
  }

  return 0;
};

// eslint-disable-next-line import/prefer-default-export
export const sortBacklogs = (backlogs: Backlog[] | undefined): Backlog[] | undefined => {
  if (!backlogs) {
    return backlogs;
  }

  // deep copy statuses array
  // eslint-disable-next-line arrow-body-style
  const sortedBacklogs = backlogs.map((b) => {
    return { ...b };
  });
  sortedBacklogs.sort(backlogCompareFunc);

  return sortedBacklogs;
};
