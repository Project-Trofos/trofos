/* eslint-disable import/prefer-default-export */
import { PrismaClient } from '@prisma/client';
import { CURRENT_YEAR, CURRENT_SEM } from '../../src/helpers/currentTime';

async function createCourseSeed(prisma: PrismaClient) {
  const courses = await prisma.course.createMany({
    data: [
      {
        code: 'course1_id',
        cname: 'course1',
        startYear: CURRENT_YEAR,
        startSem: CURRENT_SEM,
        endYear: CURRENT_YEAR,
        endSem: CURRENT_SEM + 1,
        description: 'course1_description',
      },
      {
        code: 'course2_id',
        cname: 'course2',
        startYear: CURRENT_YEAR,
        startSem: CURRENT_SEM,
        endYear: CURRENT_YEAR,
        endSem: CURRENT_SEM + 1,
        description: 'course2_description',
      },
      {
        code: 'course3_id',
        cname: 'course3',
        startYear: CURRENT_YEAR - 1,
        startSem: CURRENT_SEM,
        endYear: CURRENT_YEAR - 1,
        endSem: CURRENT_SEM + 1,
        description: 'course3_description',
      },
    ],
  });

  console.log('created courses %s', courses);

  const usersOnCourses = await prisma.usersOnCourses.createMany({
    data: [
      {
        course_id: 1,
        user_id: 2,
      },
      {
        course_id: 3,
        user_id: 2,
      },
    ],
  });

  console.log('created usersOnCourses %s', usersOnCourses);
}

export { createCourseSeed };
