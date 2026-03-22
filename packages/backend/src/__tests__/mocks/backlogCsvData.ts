import { Epic, Sprint } from '@prisma/client';
import { ImportBacklogDataCsv } from '../../services/types/backlogCsv.service.types';

export type CallbackReturnTest = {
  error?: Error | null | undefined;
  isValid?: boolean | undefined;
  reason?: string | undefined;
};

export function validateImportBacklogDataCallback(
  error?: Error | null | undefined,
  isValid?: boolean | undefined,
  reason?: string | undefined,
): CallbackReturnTest {
  return {
    error,
    isValid,
    reason,
  };
}

export function ImportBacklogDataCsvBuilder(
  summary: string,
  type: string,
  sprint: string,
  epic: string,
  priority: string,
  points: string,
  reporter: string,
  assignee: string,
  description: string,
): ImportBacklogDataCsv {
  return {
    summary,
    type,
    sprint,
    epic,
    priority,
    points,
    reporter,
    assignee,
    description,
  };
}

export const sprintMap = new Map<string, Sprint>();
sprintMap.set('Sprint 1', {
  id: 1,
  name: 'Sprint 1',
  duration: 2,
  start_date: new Date(),
  end_date: new Date(),
  project_id: 1,
  status: 'upcoming',
} as Sprint);
sprintMap.set('Sprint 2', {
  id: 2,
  name: 'Sprint 2',
  duration: 2,
  start_date: new Date(),
  end_date: new Date(),
  project_id: 1,
  status: 'upcoming',
} as Sprint);

export const epicMap = new Map<string, Epic>();
epicMap.set('Epic 1', {
  epic_id: 1,
  project_id: 1,
  name: 'Epic 1',
  description: null,
} as Epic);

export const memberEmailMap = new Map<string, number>();
memberEmailMap.set('user1@test.com', 1);
memberEmailMap.set('user2@test.com', 2);
