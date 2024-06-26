/* eslint-disable import/prefer-default-export */
import { PrismaClient } from '@prisma/client';
import {
  BACKLOG_PROJECT_ID,
  COURSE_1_ID,
  COURSE_2_ID,
  PROJECT_1_ID,
  PROJECT_2_ID,
  PROJECT_3_ID,
  SHADOW_COURSE_1_ID,
  SHADOW_COURSE_2_ID,
} from './constants';

async function createProjectTableSeed(prisma: PrismaClient) {
  const projects = await prisma.project.createMany({
    data: [
      {
        id: BACKLOG_PROJECT_ID,
        pname: 'Backlog Test Project',
        pkey: 'KEY',
        backlog_counter: 5,
        course_id: SHADOW_COURSE_1_ID,
      },
      {
        id: PROJECT_1_ID,
        pname: 'project1',
        course_id: COURSE_1_ID,
      },
      {
        id: PROJECT_2_ID,
        pname: 'project2',
        course_id: COURSE_2_ID,
        description: 'project2_description',
      },
      {
        id: PROJECT_3_ID,
        pname: 'project3',
        description: 'project3_description',
        course_id: SHADOW_COURSE_2_ID,
      },
    ],
  });

  console.log('created project table seed %s', projects);
}

export { createProjectTableSeed };
