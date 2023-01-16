/* eslint-disable import/prefer-default-export */
import { PrismaClient } from '@prisma/client';
import { COURSE_1_ID } from './constants';

async function createMilestoneTableSeed(prisma: PrismaClient) {
  const milestone = await prisma.milestone.createMany({
    data: [
      {
        course_id: COURSE_1_ID,
        name: 'Milestone 1',
        start_date: new Date(2022, 12, 1),
        deadline: new Date(2022, 12, 10),
      },
      {
        course_id: COURSE_1_ID,
        name: 'Milestone 2',
        start_date: new Date(2022, 12, 11),
        deadline: new Date(2022, 12, 20),
      },
      {
        course_id: COURSE_1_ID,
        name: 'Milestone 3',
        start_date: new Date(2022, 12, 21),
        deadline: new Date(2022, 12, 31),
      },
    ],
  });

  console.log('created milestone table seed %s', milestone);
}

export { createMilestoneTableSeed };
