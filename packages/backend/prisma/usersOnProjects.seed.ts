/* eslint-disable import/prefer-default-export */
import { PrismaClient } from '@prisma/client';
import {
  BACKLOG_PROJECT_ID,
  BACKLOG_USER_1_ID,
  BACKLOG_USER_2_ID,
  PROJECT_1_ID,
  PROJECT_3_ID,
  USER_1_ID,
  USER_2_ID,
} from './constants';

async function createUsersOnProjectsTableSeed(prisma: PrismaClient) {
  const usersOnProjectsData = [
    {
      user_id: BACKLOG_USER_1_ID,
      project_id: BACKLOG_PROJECT_ID,
    },
    {
      user_id: BACKLOG_USER_2_ID,
      project_id: BACKLOG_PROJECT_ID,
    },
    {
      user_id: USER_1_ID,
      project_id: PROJECT_1_ID,
    },
    {
      user_id: USER_2_ID,
      project_id: PROJECT_3_ID,
    },
  ];

  const usersOnProjects = await prisma.usersOnProjects.createMany({
    data: usersOnProjectsData,
  });

  await prisma.usersOnProjectsSetting.createMany({
    data: usersOnProjectsData,
  });

  console.log('created usersOnProjects table seed %s', usersOnProjects);
}

export { createUsersOnProjectsTableSeed };
