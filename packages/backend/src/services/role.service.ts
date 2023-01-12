import { Action, ActionsOnRoles, Prisma } from '@prisma/client';
import prisma from '../models/prismaClient';
import { RoleInformation, UserRolesForCourse, UserRoleActionsForCourse } from './types/role.service.types';
import { ADMIN_ROLE_ID, STUDENT_ROLE_ID } from '../helpers/constants';

async function getUserRoleInformation(userEmail: string): Promise<RoleInformation> {
  const basicRoleQueryResult = await prisma.usersOnRoles.findFirstOrThrow({
    where: {
      user_email: userEmail,
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
    where : {
      user_email : userEmail,
    },
    include : {
      role: {
        include: {
          actions: true,
        }
      }
    }
  });

  const basicRoleActions = basicRoleQueryResult.role.actions.map((actionsOnRoles) => actionsOnRoles.action);
  const specificRoleActions = specificRoleQueryResult.flatMap((courseOrProjectRole) => courseOrProjectRole.role.actions.map((actionsOnRoles) => actionsOnRoles.action));
  const combinedRoleActions = basicRoleActions.concat(specificRoleActions);
  const uniqueCombinedRoleActions = combinedRoleActions.filter((item, pos) => combinedRoleActions.indexOf(item) === pos);

  const userRoleInformation: RoleInformation = {
    roleId: basicRoleQueryResult.role_id,
    roleActions: uniqueCombinedRoleActions,
    isAdmin: basicRoleQueryResult.role_id === ADMIN_ROLE_ID,
  };

  return userRoleInformation;
}

async function getUserRoleId(userEmail: string): Promise<number> {
  const userRoleId = await prisma.usersOnRoles.findUniqueOrThrow({
    where: {
      user_email: userEmail,
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

function getAllActions(): string[] {
  return Object.values(Action);
}

async function getRoleActions(): Promise<any[]> {
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

async function getUserRoleActionsForCourse(userEmail: string, courseId: number) : Promise<UserRoleActionsForCourse> {
  const userRoleForCourse = await prisma.usersOnRolesOnCourses.findFirstOrThrow({
    where : {
      user_email : userEmail,
      course_id : courseId
    },
    include : {
      role : {
        include: {
          actions: true,
        },
      }
    }
  })
  return userRoleForCourse
}

async function getUserRoleActionsForProject(userEmail: string, projectId: number) : Promise<UserRoleActionsForCourse> {
  const projectInformation = await prisma.project.findFirstOrThrow({
    where : {
      id : projectId
    }
  })

  const userRoleForProject = await prisma.usersOnRolesOnCourses.findFirstOrThrow({
    where : {
      user_email : userEmail,
      course_id : projectInformation?.course_id as number
    },
    include : {
      role : {
        include: {
          actions: true,
        },
      }
    }
  })

  return userRoleForProject
}

async function getUserRolesForCourse(courseId: number) : Promise<UserRolesForCourse[]> {
  const userRoleForCourse = await prisma.usersOnRolesOnCourses.findMany({
    where : {
      course_id : courseId
    },
    include : {
      role : true
    }
  });

  return userRoleForCourse;
}

async function getUserRolesForProject(projectId: number) : Promise<UserRolesForCourse[]> {
  const projectInformation = await prisma.project.findFirstOrThrow({
    where : {
      id : projectId
    }
  })

  const userRoleForProject = await prisma.usersOnRolesOnCourses.findMany({
    where : {
      course_id : projectInformation?.course_id as number
    },
    include : {
      role : true
    }
  });

  return userRoleForProject;
}

async function updateUserRoleForCourse(courseId: number, userEmail: string, userRole: number, userId: number) {
  await prisma.usersOnRolesOnCourses.update({
    where : {
      user_email_course_id : {
        user_email : userEmail,
        course_id : courseId,
      }
    }, 
    data : {
      role_id : userRole
    }
  })

  await updateUserOnCoursePermissions(userId, courseId, userRole);
}

async function updateUserRoleForProject(projectId: number, userEmail: string, userRole: number, userId: number) {
  const projectInformation = await prisma.project.findFirstOrThrow({
    where : {
      id : projectId
    }
  })

  await prisma.usersOnRolesOnCourses.update({
    where : {
      user_email_course_id : {
        user_email : userEmail,
        course_id : projectInformation.course_id as number,
      }
    }, 
    data : {
      role_id : userRole
    }
  });

  await updateUserOnCoursePermissions(userId, Number(projectInformation.course_id), userRole);
  
}

async function updateUserOnCoursePermissions(userId : number, courseId : number, roleId: number) {
  try {
    if (roleId === STUDENT_ROLE_ID) {
      await prisma.usersOnCourses.delete({
        where : {
          course_id_user_id : {
            course_id : courseId,
            user_id : userId
          }
        }
      })
    } else {
      await prisma.usersOnCourses.create({
        data : {
          user_id : userId,
          course_id : courseId,
        }
      })
    }
  } catch (e : any) {
    console.error(e);
  }
}

export default {
  getUserRoleId,
  isActionAllowed,
  getUserRoleInformation,
  getAllActions,
  getRoleActions,
  addActionToRole,
  removeActionFromRole,
  getUserRoleActionsForCourse,
  getUserRoleActionsForProject,
  getUserRolesForCourse,
  getUserRolesForProject,
  updateUserRoleForCourse,
  updateUserRoleForProject,
};
