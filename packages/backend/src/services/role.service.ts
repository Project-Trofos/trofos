import { Action, ActionsOnRoles, UsersOnRoles, Role } from '@prisma/client';
import prisma from '../models/prismaClient';
import { RoleInformation, UserRolesForCourse, UserRoleActionsForCourse } from './types/role.service.types';
import { ADMIN_ROLE_ID } from '../helpers/constants';

async function getUserRoleInformation(userId: number): Promise<RoleInformation> {
  const basicRoleQueryResult = await prisma.usersOnRoles.findFirstOrThrow({
    where: {
      user_id: userId,
    },
    include: {
      role: {
        include: {
          actions: true,
        },
      },
    },
  });

  const specificRoleQueryResult = await prisma.usersOnRolesOnCourses.findMany({
    where: {
      user_id: userId,
    },
    include: {
      role: {
        include: {
          actions: true,
        },
      },
    },
  });

  const basicRoleActions = basicRoleQueryResult.role.actions.map((actionsOnRoles) => actionsOnRoles.action);
  const specificRoleActions = specificRoleQueryResult.flatMap((courseOrProjectRole) =>
    courseOrProjectRole.role.actions.map((actionsOnRoles) => actionsOnRoles.action),
  );
  const combinedRoleActions = basicRoleActions.concat(specificRoleActions);
  const uniqueCombinedRoleActions = combinedRoleActions.filter(
    (item, pos) => combinedRoleActions.indexOf(item) === pos,
  );

  const userRoleInformation: RoleInformation = {
    roleId: basicRoleQueryResult.role_id,
    roleActions: uniqueCombinedRoleActions,
    isAdmin: basicRoleQueryResult.role_id === ADMIN_ROLE_ID,
  };

  return userRoleInformation;
}

async function getUserRoleId(userId: number): Promise<number> {
  const userRoleId = await prisma.usersOnRoles.findUniqueOrThrow({
    where: {
      user_id: userId,
    },
  });

  return userRoleId.role_id;
}

async function isActionAllowed(roleId: number, action: Action | null): Promise<boolean> {
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

async function getAllRoles(): Promise<Role[]> {
  const roles = await prisma.role.findMany({
    select: {
      role_name: true,
      id: true,
    },
  });

  return roles;
}

function getAllActions(): string[] {
  return Object.values(Action);
}

async function getRoleActions(): Promise<typeof actionOnRoles> {
  const actionOnRoles = await prisma.role.findMany({
    select: {
      id: true,
      role_name: true,
      actions: {
        select: {
          action: true,
        },
      },
    },
  });
  return actionOnRoles.filter((actionOnRole) => actionOnRole.id !== ADMIN_ROLE_ID);
}

async function addActionToRole(roleId: number, action: Action): Promise<ActionsOnRoles> {
  const actionOnRole = await prisma.actionsOnRoles.create({
    data: {
      role_id: roleId,
      action,
    },
  });
  return actionOnRole;
}

async function removeActionFromRole(roleId: number, action: Action): Promise<ActionsOnRoles> {
  const actionOnRole = await prisma.actionsOnRoles.delete({
    where: {
      role_id_action: {
        role_id: roleId,
        action,
      },
    },
  });

  return actionOnRole;
}

async function getUserRoleActionsForCourse(userId: number, courseId: number): Promise<UserRoleActionsForCourse> {
  const userRoleForCourse = await prisma.usersOnRolesOnCourses.findFirstOrThrow({
    where: {
      user_id: userId,
      course_id: courseId,
    },
    include: {
      role: {
        include: {
          actions: true,
        },
      },
    },
  });
  return userRoleForCourse;
}

async function getUserRoleActionsForProject(userId: number, projectId: number): Promise<UserRoleActionsForCourse> {
  const projectInformation = await prisma.project.findFirstOrThrow({
    where: {
      id: projectId,
    },
  });

  const userRoleForProject = await prisma.usersOnRolesOnCourses.findFirstOrThrow({
    where: {
      user_id: userId,
      course_id: projectInformation?.course_id as number,
    },
    include: {
      role: {
        include: {
          actions: true,
        },
      },
    },
  });

  return userRoleForProject;
}

async function getUserRolesForCourse(courseId: number): Promise<UserRolesForCourse[]> {
  const userRoleForCourse = await prisma.usersOnRolesOnCourses.findMany({
    where: {
      course_id: courseId,
    },
    include: {
      role: true,
    },
  });

  return userRoleForCourse;
}

async function getUserRolesForProject(projectId: number): Promise<UserRolesForCourse[]> {
  const projectInformation = await prisma.project.findFirstOrThrow({
    where: {
      id: projectId,
    },
  });

  const userRoleForProject = await prisma.usersOnRolesOnCourses.findMany({
    where: {
      course_id: projectInformation.course_id,
    },
    include: {
      role: true,
    },
  });

  return userRoleForProject;
}

async function updateUserRoleForCourse(courseId: number, userRole: number, userId: number) {
  // We use upsert to prevent any unforseen edge cases
  await prisma.usersOnRolesOnCourses.upsert({
    where: {
      user_id_course_id: {
        user_id: userId,
        course_id: courseId,
      },
    },
    update: {
      role_id: userRole,
    },
    create : {
      user_id : userId,
      course_id : courseId,
      role_id : userRole
    }
  });
}

async function updateUserRoleForProject(projectId: number, userRole: number, userId: number) {
  const projectInformation = await prisma.project.findFirstOrThrow({
    where: {
      id: projectId,
    },
  });

  // We use upsert to prevent any unforseen edge cases
  await prisma.usersOnRolesOnCourses.upsert({
    where: {
      user_id_course_id: {
        user_id: userId,
        course_id: projectInformation.course_id as number,
      },
    },
    update: {
      role_id: userRole,
    },
    create : {
      user_id : userId,
      course_id : projectInformation.course_id as number,
      role_id : userRole
    }
  });
}

async function updateUserRole(roleId: number, userId: number): Promise<UsersOnRoles> {
  const userOnRole = await prisma.usersOnRoles.update({
    where: {
      user_id: userId,
    },
    data: {
      role_id: roleId,
    },
  });

  return userOnRole;
}

export default {
  getUserRoleId,
  isActionAllowed,
  getUserRoleInformation,
  getAllActions,
  getAllRoles,
  getRoleActions,
  addActionToRole,
  removeActionFromRole,
  getUserRoleActionsForCourse,
  getUserRoleActionsForProject,
  getUserRolesForCourse,
  getUserRolesForProject,
  updateUserRoleForCourse,
  updateUserRoleForProject,
  updateUserRole,
};
