import { BacklogType, BacklogPriority } from '@prisma/client';

export type BacklogFields = {
  summary: string;
  type: BacklogType;
  sprintId: number | undefined;
  priority: BacklogPriority | undefined;
  reporterId: number;
  assigneeId: number | undefined;
  points: number | undefined;
  description: string | undefined;
  projectId: number;
};
