import prisma from '../models/prismaClient';
import { FACULTY_ROLE_ID, STUDENT_ROLE_ID } from '../helpers/constants';

async function patchMigration() {
  await prisma.usersOnRolesOnCourses.createMany({
    data: [
      {
        user_email: 'cs3203faculty@trofos.com',
        role_id: FACULTY_ROLE_ID,
        course_id: 4,
      },
      {
        user_email: 'cs3203student@trofos.com',
        role_id: STUDENT_ROLE_ID,
        course_id: 4,
      },
      {
        user_email: 'aaronsms@u.nus.edu',
        role_id: STUDENT_ROLE_ID,
        course_id: 4,
      },
      {
        user_email: 'e0424645@u.nus.edu',
        role_id: STUDENT_ROLE_ID,
        course_id: 4,
      },
      {
        user_email: 'e0425929@u.nus.edu',
        role_id: STUDENT_ROLE_ID,
        course_id: 4,
      },
      {
        user_email: 'e0310343@u.nus.edu',
        role_id: STUDENT_ROLE_ID,
        course_id: 4,
      },
      {
        user_email: 'e0425605@u.nus.edu',
        role_id: STUDENT_ROLE_ID,
        course_id: 4,
      },
      {
        user_email: 'e0425594@u.nus.edu',
        role_id: STUDENT_ROLE_ID,
        course_id: 4,
      },
    ],
  });
}

patchMigration();
