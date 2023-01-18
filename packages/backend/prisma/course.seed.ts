/* eslint-disable import/prefer-default-export */
import { PrismaClient } from '@prisma/client';
import { CURRENT_YEAR, CURRENT_SEM } from '../src/helpers/currentTime';
import { COURSE_1_ID, COURSE_2_ID, COURSE_3_ID, SHADOW_COURSE_1_ID, SHADOW_COURSE_2_ID } from './constants';

async function createCourseTableSeed(prisma: PrismaClient) {
  const course = await prisma.course.createMany({
    data: [
      {
        id: COURSE_1_ID,
        code: 'course1_id',
        cname: 'course1',
        startYear: CURRENT_YEAR,
        startSem: CURRENT_SEM,
        endYear: CURRENT_YEAR,
        endSem: CURRENT_SEM + 1,
        description: 'course1_description',
      },
      {
        id: COURSE_2_ID,
        code: 'course2_id',
        cname: 'course2',
        startYear: CURRENT_YEAR,
        startSem: CURRENT_SEM,
        endYear: CURRENT_YEAR,
        endSem: CURRENT_SEM + 1,
        description: 'course2_description',
      },
      {
        id: COURSE_3_ID,
        code: 'course3_id',
        cname: 'course3',
        startYear: CURRENT_YEAR - 1,
        startSem: CURRENT_SEM,
        endYear: CURRENT_YEAR - 1,
        endSem: CURRENT_SEM + 1,
        description: 'course3_description',
      },
      {
        id: SHADOW_COURSE_1_ID,
        cname: 'Independent course',
        startYear: 0,
        startSem: 0,
        endYear: 0,
        endSem: 0,
        description: 'Independent course',
        shadow_course: true,
      },
      {
        id: SHADOW_COURSE_2_ID,
        cname: 'Independent course',
        startYear: 0,
        startSem: 0,
        endYear: 0,
        endSem: 0,
        description: 'Independent course',
        shadow_course: true,
      },
    ],
  });

  console.log('created course table seed %s', course);
}

export { createCourseTableSeed };
