/* eslint-disable import/prefer-default-export */
import { PrismaClient } from '@prisma/client';
import { ADMIN_ROLE_ID, FACULTY_ROLE_ID, STUDENT_ROLE_ID } from './constants';

async function createRoleTableSeed(prisma: PrismaClient) {
  // Workaround when trying to add a new Action and new
  // ActionsOnRoles entry. Need to use insert (role_id, action_name) in 
  // ActionsOnRoles in migration script. Thus need insert into Roles
  // for shadow db (migrations are performed before seeding, and seeding not performed during prod). This
  // will conflict with seeding. So the insert is actually done
  // in a migation script, but we shall have it here so it is more understandable

  //The faculty role insert is actually done in a migration script
  const facultyRow = await prisma.$executeRaw`
    INSERT INTO "Role" (id, role_name)
    VALUES
      (${FACULTY_ROLE_ID}, 'FACULTY')
    ON CONFLICT (id) DO NOTHING;`
  console.log('created faculty role %s', facultyRow);

  const roles = await prisma.role.createMany({
    data: [
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
