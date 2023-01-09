import { BacklogHistory, HistoryType, BacklogPriority, BacklogType } from '@prisma/client';

export const backlogHistoryData: BacklogHistory[] = [
  {
    assignee_id: 1,
    backlog_id: 1,
    date: new Date(),
    description: null,
    history_type: HistoryType.create,
    points: 1,
    priority: BacklogPriority.high,
    project_id: 1,
    reporter_id: 1,
    sprint_id: 1,
    status: 'to do',
    summary: 'summary',
    type: BacklogType.story,
  },
];
