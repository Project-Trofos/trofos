/* eslint-disable import/prefer-default-export */
import { PrismaClient } from '@prisma/client';
import { CURRENT_YEAR, CURRENT_SEM } from '../../src/helpers/currentTime';

async function createCourseSeed(prisma: PrismaClient) {
  const courses = await prisma.course.createMany({
    data: [
      {
        id: 'course1_id',
        cname: 'course1',
        year: CURRENT_YEAR,
        sem: CURRENT_SEM,
        description: 'course1_description',
      },
      {
        id: 'course2_id',
        cname: 'course2',
        year: CURRENT_YEAR,
        sem: CURRENT_SEM,
        description: 'course2_description',
      },
      {
        id: 'course3_id',
        cname: 'course3',
        year: CURRENT_YEAR - 1,
        sem: CURRENT_SEM,
        description: 'course3_description',
      },
    ],
  });

  console.log('created courses %s', courses);

  const usersOnCourses = await prisma.usersOnCourses.createMany({
    data : [
      {
        course_id : 'course1_id',
        course_year : CURRENT_YEAR, 
        course_sem : CURRENT_SEM,
        user_id : 2
      },
      {
        course_id : 'course3_id',
        course_year : CURRENT_YEAR - 1, 
        course_sem : CURRENT_SEM,
        user_id : 2
      }
    ]
  });

  console.log('created usersOnCourses %s', usersOnCourses);

}

export { createCourseSeed };
