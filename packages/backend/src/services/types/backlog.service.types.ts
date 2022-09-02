import { BacklogType, BacklogPriority } from '@prisma/client';

export type BacklogFields = {
  summary: string;
  type: BacklogType;
  sprint_id?: number;
  priority?: BacklogPriority;
  reporter_id: number;
  assignee_id?: number;
  points?: number;
  description?: string;
  project_id: number;
};
