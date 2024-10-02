import { BacklogType, BacklogPriority, Retrospective } from '@prisma/client';

export type BacklogFields = {
  summary: string;
  type: BacklogType;
  sprintId?: number;
  priority?: BacklogPriority;
  reporterId: number;
  assigneeId?: number;
  points?: number;
  description?: string;
  projectId: number;
  epicId?: number;
  retrospective?: Retrospective;
};
