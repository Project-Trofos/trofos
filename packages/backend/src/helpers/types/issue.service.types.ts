import { BacklogPriority, IssueStatusType } from '@prisma/client';

export type IssueFields = {
  title: string;
  description?: string;
  status?: IssueStatusType;
  priority?: BacklogPriority;
  reporterId: number;
  assignerProjectId: number;
  assigneeProjectId: number;
};

export type BacklogFromIssueFields = {
  summary: string;
  priority: BacklogPriority;
  reporterId: number;
  description?: string;
  projectId: number;
};
