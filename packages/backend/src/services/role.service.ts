import { Action, ActionsOnRoles } from '@prisma/client';
import prisma from '../models/prismaClient';
import { RoleInformation } from './types/role.service.types';
import { ADMIN_ROLE_ID } from '../helpers/constants';

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
  const userRoleId = await prisma.usersOnRoles.findUniqueOrThrow({
    where: {
      user_email: userEmail,
    },
  });

  return userRoleId.role_id;
}

async function isActionAllowed(roleId: number, action : Action | null) : Promise<boolean> {
  if (action === null || roleId === ADMIN_ROLE_ID) {
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

function getAllActions() : string[] {
  return Object.values(Action);
}

async function getRoleActions() : Promise<any[]> {
  const actionOnRoles = await prisma.role.findMany({
    select : {
      id : true,
      role_name: true,
      actions : {
        select : {
          action : true
        }
      }
    }
  });
  return actionOnRoles.filter(actionOnRole => actionOnRole.id !== ADMIN_ROLE_ID);
}

async function addActionToRole(roleId: number, action: Action) : Promise<ActionsOnRoles> {
  const actionOnRole = await prisma.actionsOnRoles.create({
    data : {
      role_id : roleId,
      action : action
    }
  });
  return actionOnRole;
}

async function removeActionFromRole(roleId: number, action: Action) : Promise<ActionsOnRoles> {
  const actionOnRole = await prisma.actionsOnRoles.delete({
    where : {
      role_id_action : {
        role_id : roleId,
        action : action
      }
    }
  });

  return actionOnRole;
}

export default {
  getUserRoleId,
  isActionAllowed,
  getUserRoleInformation,
  getAllActions,
  getRoleActions,
  addActionToRole,
  removeActionFromRole
};
