/* eslint-disable import/prefer-default-export */
import { PrismaClient, HistoryType } from '@prisma/client';
import { backlogsToAdd } from './backlog.seed';

// Add history to backlog
function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

async function createBacklogHistoryTableSeed(prisma: PrismaClient) {
  await Promise.all(
    backlogsToAdd.map(async (backlogToAdd, index) => {
      const backlogHistory = await prisma.backlogHistory.create({
        data: {
          backlog_id: backlogToAdd.backlog_id,
          assignee_id: backlogToAdd.assignee?.connect.project_id_user_id.user_id,
          points: backlogToAdd.points,
          priority: backlogToAdd.priority,
          project_id: backlogToAdd.backlogStatus.connect.project_id_name.project_id,
          status: backlogToAdd.backlogStatus.connect.project_id_name.name,
          sprint_id: backlogToAdd.sprint?.connect.id,
          type: backlogToAdd.type,
          history_type: HistoryType.create,
          reporter_id: backlogToAdd.reporter.connect.project_id_user_id.user_id,
          date: addDays(new Date('Sun Oct 09 2022 15:03:56 GMT+0800 (Singapore Standard Time)'), index),
        },
      });
      console.log('created backlogHistory table seed %s', backlogHistory);
    }),
  );
}

export { createBacklogHistoryTableSeed };
