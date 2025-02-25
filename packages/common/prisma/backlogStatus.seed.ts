/* eslint-disable import/prefer-default-export */
import { PrismaClient } from '@prisma/client';
import { BACKLOG_PROJECT_ID, PROJECT_1_ID, PROJECT_2_ID, PROJECT_3_ID } from './constants';

async function createBacklogStatusTableSeed(prisma: PrismaClient) {
  const backlogStatus = await prisma.backlogStatus.createMany({
    data: [
      {
        project_id: BACKLOG_PROJECT_ID,
        name: 'To do',
        type: 'todo',
        order: 1,
      },
      {
        project_id: BACKLOG_PROJECT_ID,
        name: 'In progress',
        type: 'in_progress',
        order: 1,
      },
      {
        project_id: BACKLOG_PROJECT_ID,
        name: 'Done',
        type: 'done',
        order: 1,
      },
      {
        project_id: PROJECT_1_ID,
        name: 'To do',
        type: 'todo',
        order: 1,
      },
      {
        project_id: PROJECT_1_ID,
        name: 'In progress',
        type: 'in_progress',
        order: 1,
      },
      {
        project_id: PROJECT_1_ID,
        name: 'Done',
        type: 'done',
        order: 1,
      },
      {
        project_id: PROJECT_2_ID,
        name: 'To do',
        type: 'todo',
        order: 1,
      },
      {
        project_id: PROJECT_2_ID,
        name: 'In progress',
        type: 'in_progress',
        order: 1,
      },
      {
        project_id: PROJECT_2_ID,
        name: 'Done',
        type: 'done',
        order: 1,
      },
      {
        project_id: PROJECT_3_ID,
        name: 'To do',
        type: 'todo',
        order: 1,
      },
      {
        project_id: PROJECT_3_ID,
        name: 'In progress',
        type: 'in_progress',
        order: 1,
      },
      {
        project_id: PROJECT_3_ID,
        name: 'Done',
        type: 'done',
        order: 1,
      },
    ],
  });

  console.log('created backlogStatus table seed %s', backlogStatus);
}

export { createBacklogStatusTableSeed };
