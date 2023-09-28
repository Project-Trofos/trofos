import bcrypt from 'bcryptjs';
import { ROLE_ID_MAP } from '../../helpers/constants';

export const IMPORT_COURSE_DATA_CONFIG = {
  headers: true,
};

export const INVALID_EMAIL = 'Email provided has an invalid format';
export const INVALID_PASSWORD = 'Password cannot be empty if non-SSO email is provided';
export const INVALID_ROLE = 'Role provided is invalid';
export const INVALID_TEAM_NAME = 'Team name cannot be empty';
export const MESSAGE_SPACE = ' ';

export type ImportCourseDataCsv = {
  name: string;
  email: string;
  password: string;
  role: string;
  teamName: string;
  projectName: string;
};

export type ImportCourseDataUser = {
  id: number | undefined;
  name: string;
  email: string;
  password: string | undefined;
  roleId: number;
};

export type ImportCourseDataGroup = {
  projectId: number | undefined;
  courseId: number;
  teamName: string;
  projectName: string;
};

export function getUserData(data: ImportCourseDataCsv): ImportCourseDataUser {
  const userRoleId = ROLE_ID_MAP.get(data.role.toUpperCase());
  const userPassword = data.password ? bcrypt.hashSync(data.password, 10) : undefined;

  if (!userRoleId) {
    throw new Error(INVALID_ROLE);
  }

  const student: ImportCourseDataUser = {
    id: undefined,
    name: data.name,
    email: data.email,
    password: userPassword,
    roleId: userRoleId,
  };

  return student;
}

export function getGroupData(data: ImportCourseDataCsv, courseId: number): ImportCourseDataGroup {
  const group: ImportCourseDataGroup = {
    projectId: undefined,
    courseId,
    teamName: data.teamName,
    projectName: data.projectName || data.teamName,
  };

  return group;
}
