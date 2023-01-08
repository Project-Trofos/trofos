import { BacklogStatus } from '@prisma/client';

// Role Ids
export const FACULTY_ROLE_ID = 1;
export const STUDENT_ROLE_ID = 2;
export const ADMIN_ROLE_ID = 3;

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
