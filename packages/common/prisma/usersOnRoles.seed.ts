/* eslint-disable import/prefer-default-export */
import { PrismaClient } from '@prisma/client';
import {
  FACULTY_ROLE_ID,
  STUDENT_ROLE_ID,
  ADMIN_ROLE_ID,
  BACKLOG_USER_1_ID,
  BACKLOG_USER_2_ID,
  USER_1_ID,
  USER_2_ID,
  USER_3_ID,
} from './constants';

async function createUsersOnRolesTableSeed(prisma: PrismaClient) {
  const usersOnRoles = await prisma.usersOnRoles.createMany({
    data: [
      {
        user_id: BACKLOG_USER_1_ID,
        role_id: STUDENT_ROLE_ID,
      },
      {
        user_id: BACKLOG_USER_2_ID,
        role_id: FACULTY_ROLE_ID,
      },
      {
        user_id: USER_1_ID,
        role_id: STUDENT_ROLE_ID,
      },
      {
        user_id: USER_2_ID,
        role_id: FACULTY_ROLE_ID,
      },
      {
        user_id: USER_3_ID,
        role_id: ADMIN_ROLE_ID,
      },
    ],
  });

  console.log('created usersOnRoles table seed %s', usersOnRoles);
}

export { createUsersOnRolesTableSeed };
