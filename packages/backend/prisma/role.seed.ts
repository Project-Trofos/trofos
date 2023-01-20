/* eslint-disable import/prefer-default-export */
import { PrismaClient } from '@prisma/client';
import { ADMIN_ROLE_ID, FACULTY_ROLE_ID, STUDENT_ROLE_ID } from './constants';

async function createRoleTableSeed(prisma: PrismaClient) {
  const roles = await prisma.role.createMany({
    data: [
      {
        id: FACULTY_ROLE_ID,
        role_name: 'FACULTY',
      },
      {
        id: STUDENT_ROLE_ID,
        role_name: 'STUDENT',
      },
      {
        id: ADMIN_ROLE_ID,
        role_name: 'ADMIN',
      },
    ],
  });

  console.log('created roles table seed %s', roles);
}

export { createRoleTableSeed };
