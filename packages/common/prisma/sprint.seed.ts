/* eslint-disable import/prefer-default-export */
import { PrismaClient } from '@prisma/client';
import { BACKLOG_PROJECT_ID, SPRINT_1_ID } from './constants';

async function createSprintTableSeed(prisma: PrismaClient) {
  const sprint = await prisma.sprint.createMany({
    data: [
      {
        id: SPRINT_1_ID,
        name: 'Sprint 1',
        duration: 1,
        project_id: BACKLOG_PROJECT_ID,
        start_date: new Date('Sun Oct 09 2022 15:03:56 GMT+0800 (Singapore Standard Time)'),
        end_date: new Date('Sun Oct 16 2022 15:03:56 GMT+0800 (Singapore Standard Time)'),
      },
    ],
  });

  console.log('created sprint table seed %s', sprint);
}

export { createSprintTableSeed };
