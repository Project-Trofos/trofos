import { Action } from '@prisma/client';
import prisma from '../models/prismaClient';
import { RoleInformation } from './types/role.service.types';

<<<<<<< HEAD
//TODO: Can this be extracted to a constants file and referenced?
const ADMIN_ROLE_ID = 3

async function getUserRoleInformation(userEmail: string) : Promise<RoleInformation> {

  const queryResult = await prisma.usersOnRoles.findFirstOrThrow({
      where : {
        user_email : userEmail
      },
      include : {
        role : {
          include : {
            actions : true
          }
        }
      },
    })

  const userRoleInformation : RoleInformation = {
    roleId : queryResult.role_id,
    roleActions : queryResult.role.actions.map(actionsOnRoles => actionsOnRoles.action),
    isAdmin : queryResult.role_id === ADMIN_ROLE_ID
  }

  return userRoleInformation;
}

async function getUserRoleId(userEmail: string) : Promise<number> {
=======
async function getUserRoleId(userEmail: string): Promise<number> {
>>>>>>> main
  const userRoleId = await prisma.usersOnRoles.findUniqueOrThrow({
    where: {
      user_email: userEmail,
    },
  });

  return userRoleId.role_id;
}

<<<<<<< HEAD
async function isActionAllowed(roleId: number, action : Action | null) : Promise<boolean> {
  if (action === null || roleId === ADMIN_ROLE_ID) {
=======
async function isActionAllowed(roleId: number, action: Action | null): Promise<boolean> {
  if (action === null) {
>>>>>>> main
    return true;
  }

  const roleActions = await prisma.actionsOnRoles.findMany({
    where: {
      role_id: roleId,
      action,
    },
  });

  return roleActions.length !== 0;
}

export default {
  getUserRoleId,
  isActionAllowed,
<<<<<<< HEAD
  getUserRoleInformation
};
=======
};
>>>>>>> main
