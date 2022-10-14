/* eslint-disable import/prefer-default-export */
import { PrismaClient, Action } from '@prisma/client';
import { FACULTY_ROLE_ID, STUDENT_ROLE_ID, ADMIN_ROLE_ID } from '../../src/helpers/constants';

async function createRoleSeed(prisma: PrismaClient) {
  // Create Roles
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
        id : ADMIN_ROLE_ID,
        role_name: 'ADMIN',
      }
    ],
  });

  console.log('created roles %s', roles);

  // Create ActionsOnRoles
  const actionsOnRoles = await prisma.actionsOnRoles.createMany({
    data: [
      {
        role_id: FACULTY_ROLE_ID,
        action: Action.create_course,
      },
      {
        role_id: FACULTY_ROLE_ID,
        action: Action.read_course,
      },
      {
        role_id: FACULTY_ROLE_ID,
        action: Action.update_course,
      },
      {
        role_id: FACULTY_ROLE_ID,
        action: Action.delete_course,
      },
      {
        role_id: FACULTY_ROLE_ID,
        action: Action.create_project,
      },
      {
        role_id: FACULTY_ROLE_ID,
        action: Action.read_project,
      },
      {
        role_id: FACULTY_ROLE_ID,
        action: Action.update_project,
      },
      {
        role_id: FACULTY_ROLE_ID,
        action: Action.delete_project,
      },
      {
        role_id : FACULTY_ROLE_ID,
        action : Action.read_users,
      },
      {
        role_id : STUDENT_ROLE_ID,
        action : Action.create_project,
      },
      {
        role_id: STUDENT_ROLE_ID,
        action: Action.read_project,
      },
      {
        role_id: STUDENT_ROLE_ID,
        action: Action.update_project,
      },
      {
        role_id: STUDENT_ROLE_ID,
        action: Action.delete_project,
      },
      {
        role_id : ADMIN_ROLE_ID,
        action : Action.admin
      }
    ],
  });

  console.log('created actionsOnRoles %s', actionsOnRoles);


  console.log(await prisma.user.findMany())

  // Create UsersOnRole
  const usersOnRoles = await prisma.usersOnRoles.createMany({
    data: [
      {
        user_email: 'testFaculty@test.com',
        role_id: FACULTY_ROLE_ID,
      },
      {
        user_email: 'testUser@test.com',
        role_id: STUDENT_ROLE_ID,
      },
      {
        user_email : 'testAdmin@test.com',
        role_id : ADMIN_ROLE_ID
      },
    ],
  });

  console.log('created usersOnRoles %s', usersOnRoles);
}

export { createRoleSeed };
