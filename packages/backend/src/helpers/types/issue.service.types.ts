import { BacklogPriority, IssueStatusType, IssueType } from '@prisma/client';

export type IssueFields = {
  title: string;
  description?: string;
  status?: IssueStatusType;
  type: IssueType;
  priority?: BacklogPriority;
  reporterId: number;
  assignerProjectId: number;
  assigneeProjectId: number;
};

export type BacklogFromIssueFields = {
  summary: string;
  type: IssueType;
  priority: BacklogPriority;
  reporterId: number;
  description?: string;
  projectId: number;
};
