import { UsersOnRolesOnCourses, Role, ActionsOnRoles } from '@prisma/client';

export type RoleInformation = {
  roleId: number;
  roleActions: string[];
  isAdmin: boolean;
};

export type UserRoleActionsForCourse = UsersOnRolesOnCourses & {
  role: Role & {
    actions: ActionsOnRoles[];
  };
};

export type UserRolesForCourse = UsersOnRolesOnCourses & {
  role: Role;
};
