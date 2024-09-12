/* eslint-disable import/prefer-default-export */
const UserPermissionActions = {
  READ_COURSE: 'read_course',
  CREATE_COURSE: 'create_course',
  UPDATE_COURSE: 'update_course',
  CREATE_PROJECT: 'create_project',
  READ_PROJECT: 'read_project',
  UPDATE_PROJECT_USERS: 'update_project_users',
  ADMIN: 'admin',
} as const;

type UserPermissionActionsType = typeof UserPermissionActions[keyof typeof UserPermissionActions];

const COURSE_MANAGER_ACTIONS: UserPermissionActionsType[] = [
  UserPermissionActions.ADMIN,
  UserPermissionActions.UPDATE_COURSE,
];

export { UserPermissionActions, COURSE_MANAGER_ACTIONS };
