import { Backlog, BacklogPriority, BacklogType, Issue, IssueStatusType } from '@prisma/client';
import { BacklogFromIssueFields, IssueFields } from '../../helpers/types/issue.service.types';

export const mockIssueData: Issue = {
  id: 1,
  title: 'Test issue title',
  description: 'Test issue description',
  status: IssueStatusType.open,
  status_explanation: null,
  priority: BacklogPriority.high,
  reporter_id: 1,
  assigner_project_id: 1,
  assignee_project_id: 2,
  created_at: new Date(Date.now()),
  updated_at: new Date(Date.now()),
};

export const mockIssueBacklog: Backlog = {
  backlog_id: 1,
  summary: 'Test issue title',
  type: BacklogType.bug,
  sprint_id: null,
  priority: BacklogPriority.high,
  reporter_id: 1,
  assignee_id: null,
  points: null,
  description: 'Test issue description',
  project_id: 2,
  status: 'todo',
  epic_id: null,
  issue_id: 1,
};

export const mockBacklogFields: BacklogFromIssueFields = {
  summary: 'Test issue title',
  priority: BacklogPriority.high,
  reporterId: 1,
  description: 'Test issue description',
  projectId: 2,
};

export const mockIssueFields: IssueFields = {
  title: 'Test issue title',
  description: 'Test issue description',
  status: IssueStatusType.open,
  priority: BacklogPriority.high,
  reporterId: 1,
  assignerProjectId: 1,
  assigneeProjectId: 2,
};

export const mockSelfAssignedIssueFields: IssueFields = {
  title: 'Test issue title',
  description: 'Test issue description',
  status: IssueStatusType.open,
  priority: BacklogPriority.high,
  reporterId: 1,
  assignerProjectId: 1,
  assigneeProjectId: 1,
};

export const mockSelfAssignedIssueData: Issue = {
  id: 1,
  title: 'Test issue title',
  description: 'Test issue description',
  status: IssueStatusType.open,
  status_explanation: null,
  priority: BacklogPriority.high,
  reporter_id: 1,
  assigner_project_id: 1,
  assignee_project_id: 1,
  created_at: new Date(Date.now()),
  updated_at: new Date(Date.now()),
};
