/* eslint-disable import/prefer-default-export */
import { PrismaClient } from '@prisma/client';
import {
  BACKLOG_USER_1_ID,
  BACKLOG_USER_2_ID,
  COURSE_1_ID,
  COURSE_3_ID,
  FACULTY_ROLE_ID,
  SHADOW_COURSE_1_ID,
  SHADOW_COURSE_2_ID,
  STUDENT_ROLE_ID,
  USER_1_ID,
  USER_2_ID,
} from './constants';

async function createUsersOnRolesOnCoursesTableSeed(prisma: PrismaClient) {
  const usersOnRolesOnCourses = await prisma.usersOnRolesOnCourses.createMany({
    data: [
      {
        user_id: USER_2_ID,
        role_id: FACULTY_ROLE_ID,
        course_id: COURSE_1_ID,
      },
      {
        user_id: USER_2_ID,
        role_id: FACULTY_ROLE_ID,
        course_id: COURSE_3_ID,
      },
      {
        user_id: USER_1_ID,
        role_id: STUDENT_ROLE_ID,
        course_id: COURSE_1_ID,
      },
      {
        user_id: BACKLOG_USER_1_ID,
        role_id: STUDENT_ROLE_ID,
        course_id: SHADOW_COURSE_1_ID,
      },
      {
        user_id: BACKLOG_USER_2_ID,
        role_id: STUDENT_ROLE_ID,
        course_id: SHADOW_COURSE_1_ID,
      },
      {
        user_id: USER_2_ID,
        role_id: FACULTY_ROLE_ID,
        course_id: SHADOW_COURSE_2_ID,
      },
    ],
  });

  console.log('created usersOnRolesOnCourses table seed %s', usersOnRolesOnCourses);
}

export { createUsersOnRolesOnCoursesTableSeed };
