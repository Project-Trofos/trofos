import { Action } from '@prisma/client';
import prisma from '../models/prismaClient';


async function getUserRoleId(userEmail: string) : Promise<number> {
  const userRoleId = await prisma.usersOnRoles.findUniqueOrThrow({
    where: {
      user_email : userEmail,
    },
  });

  return userRoleId.role_id;
}

async function getRoleActions(roleId: number) : Promise<Action[]> {
  const roleActions = await prisma.actionsOnRoles.findMany({
    where : {
      role_id : roleId,
    },
  });
    
  return roleActions.map(role => role.action);
}

export default {
  getUserRoleId,
  getRoleActions,
};