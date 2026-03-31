import { BacklogPriority, BacklogType } from '@prisma/client';

export const IMPORT_BACKLOG_DATA_CONFIG = {
  headers: true,
};

export const BACKLOG_TYPE_MAP = new Map<string, BacklogType>([
  ['STORY', BacklogType.story],
  ['TASK', BacklogType.task],
  ['BUG', BacklogType.bug],
]);

export const BACKLOG_PRIORITY_MAP = new Map<string, BacklogPriority>([
  ['VERY_HIGH', BacklogPriority.very_high],
  ['HIGH', BacklogPriority.high],
  ['MEDIUM', BacklogPriority.medium],
  ['LOW', BacklogPriority.low],
  ['VERY_LOW', BacklogPriority.very_low],
]);

export const INVALID_SUMMARY = 'Summary cannot be empty';
export const INVALID_TYPE = 'Type must be one of: story, task, bug';
export const INVALID_PRIORITY = 'Priority must be one of: very_high, high, medium, low, very_low';
export const INVALID_POINTS = 'Points must be a positive number';
export const INVALID_SPRINT = 'Sprint not found in this project';
export const INVALID_EPIC = 'Epic not found in this project';
export const INVALID_ASSIGNEE = 'Assignee not found in this project';
export const INVALID_REPORTER = 'Reporter not found in this project';

export type ImportBacklogDataCsv = {
  summary: string;
  type: string;
  sprint: string;
  epic: string;
  priority: string;
  points: string;
  reporter: string;
  assignee: string;
  description: string;
};
