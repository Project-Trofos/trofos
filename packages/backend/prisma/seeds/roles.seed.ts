/* eslint-disable import/prefer-default-export */
import { PrismaClient, Action } from '@prisma/client';

async function createRoleSeed(prisma: PrismaClient) {
  // Create Roles
  const roles = await prisma.role.createMany({
    data : [
      {
        id : 1,
        role_name : 'FACULTY',
      }, 
      {
        id : 2,
        role_name : 'STUDENT',
      },
    ],
  });

  console.log('created roles %s', roles);

  // Create ActionsOnRoles
  // FACULTY = role_id 1;
  // STUDENT = role_id 2;
  const actionsOnRoles = await prisma.actionsOnRoles.createMany({
    data : [
      {
        role_id : 1,
        action : Action.create_course,
      },
      {
        role_id : 1,
        action : Action.read_course,
      },
      {
        role_id : 1,
        action : Action.update_course,
      },
      {
        role_id : 1,
        action : Action.delete_course,
      },
      {
        role_id : 1,
        action : Action.create_project,
      },
      {
        role_id : 1,
        action : Action.read_project,
      },
      {
        role_id : 1,
        action : Action.update_project,
      },
      {
        role_id : 1,
        action : Action.delete_project,
      },
      {
        role_id : 2,
        action : Action.create_project,
      },
      {
        role_id : 2,
        action : Action.read_project,
      },
      {
        role_id : 2,
        action : Action.update_project,
      },
      {
        role_id : 2,
        action : Action.delete_project,
      },
    ],
  });

  console.log('created actionsOnRoles %s', actionsOnRoles);

  // Create UsersOnRole
  // FACULTY = role_id 1;
  // STUDENT = role_id 2;
  const usersOnRoles = await prisma.usersOnRoles.createMany({
    data : [
      {
        user_email : 'testFaculty@test.com',
        role_id : 1,
      },
      {
        user_email : 'testUser@test.com',
        role_id : 2,
      },
    ],
  });

  console.log('created usersOnRoles %s', usersOnRoles);
}

export {
  createRoleSeed,
};

