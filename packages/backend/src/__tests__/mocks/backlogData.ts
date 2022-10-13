import { Backlog } from '@prisma/client';
import { BacklogFields } from '../../helpers/types/backlog.service.types';

export const mockBacklogData: Backlog = {
  backlog_id: 1,
  summary: 'A Test Summary',
  type: 'story',
  priority: 'very_high',
  sprint_id: 123,
  reporter_id: 1,
  assignee_id: 1,
  points: 1,
  description: 'A test description here',
  project_id: 123,
};

export const mockBacklogFields: BacklogFields = {
  assigneeId: 1,
  description: 'A test description here',
  points: 1,
  priority: 'very_high',
  projectId: 123,
  reporterId: 1,
  summary: 'A Test Summary',
  sprintId: 123,
  type: 'story',
};
