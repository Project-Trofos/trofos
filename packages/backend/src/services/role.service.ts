import { Action } from '@prisma/client';
import prisma from '../models/prismaClient';

async function getUserRoleId(userEmail: string): Promise<number> {
  const userRoleId = await prisma.usersOnRoles.findUniqueOrThrow({
    where: {
      user_email: userEmail,
    },
  });

  return userRoleId.role_id;
}

async function isActionAllowed(roleId: number, action: Action | null): Promise<boolean> {
  if (action === null) {
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
};
