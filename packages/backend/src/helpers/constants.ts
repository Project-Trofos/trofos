import { BacklogStatus } from '@prisma/client';

// Role Ids
export const FACULTY_ROLE_ID = 1;
export const STUDENT_ROLE_ID = 2;
export const ADMIN_ROLE_ID = 3;

export const ROLE_ID_MAP = new Map<string, number>([
  ['FACULTY', FACULTY_ROLE_ID],
  ['STUDENT', STUDENT_ROLE_ID],
  ['ADMIN', ADMIN_ROLE_ID],
]);

// sprint status
export const VALID_STATUS_TRANSITION: {
  [key: string]: 'upcoming' | 'current' | 'completed';
} = {
  current: 'upcoming',
  completed: 'current',
  closed: 'completed',
};

// default backlog status for project
export const defaultBacklogStatus: Omit<BacklogStatus, 'project_id'>[] = [
  { name: 'To do', type: 'todo', order: 1 },
  { name: 'In progress', type: 'in_progress', order: 1 },
  { name: 'Done', type: 'done', order: 1 },
];

// Shadow course data (For independent projects)
export const SHADOW_COURSE_DATA = {
  cname: 'Independent course',
  startYear: 0,
  startSem: 0,
  endYear: 0,
  endSem: 0,
  description: 'Independent course',
  shadow_course: true,
};
