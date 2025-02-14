import * as csv from '@fast-csv/parse';
import { validate } from 'email-validator';
import { Prisma, Project, ProjectAssignment } from '@prisma/client';
import {
  getGroupData,
  getUserData,
  ImportCourseDataCsv,
  ImportCourseDataGroup,
  ImportCourseDataUser,
  IMPORT_COURSE_DATA_CONFIG,
  INVALID_EMAIL,
  INVALID_PASSWORD,
  INVALID_ROLE,
  INVALID_TEAM_NAME,
  MESSAGE_SPACE,
  ImportProjectAssignmentsCsv,
  INVALID_PROPERTIES,
  INVALID_PROJECT_NAME,
} from './types/csv.service.types';
import { ADMIN_ROLE_ID, ROLE_ID_MAP, STUDENT_ROLE_ID, defaultBacklogStatus } from '../helpers/constants';
import prisma from '../models/prismaClient';

function validateTeamName(data: ImportCourseDataCsv): boolean {
  // Assumption: Team name is required for all students. A student cannot be unassigned
  const roleId = ROLE_ID_MAP.get(data.role.toUpperCase());
  if (!data.teamName && roleId === STUDENT_ROLE_ID) {
    return false;
  }
  return true;
}

// Default password is required for all students
// Students can still login using SSO
const validatePassword = (data: ImportCourseDataCsv) => !!data.password?.length;

function validateRole(data: ImportCourseDataCsv): boolean {
  return ROLE_ID_MAP.has(data.role.toUpperCase()) && ROLE_ID_MAP.get(data.role.toUpperCase()) != ADMIN_ROLE_ID;
}

function validateImportCourseData(data: ImportCourseDataCsv, callback: csv.RowValidateCallback) {
  let errorMessages = '';
  if (!validate(data.email)) {
    errorMessages += INVALID_EMAIL + MESSAGE_SPACE;
  }
  if (!validatePassword(data)) {
    errorMessages += INVALID_PASSWORD + MESSAGE_SPACE;
  }
  if (!validateRole(data)) {
    errorMessages += INVALID_ROLE + MESSAGE_SPACE;
  }
  if (!validateTeamName(data)) {
    errorMessages += INVALID_TEAM_NAME + MESSAGE_SPACE;
  }
  if (errorMessages) {
    return callback(null, false, errorMessages.trimEnd());
  }
  return callback(null, true);
}

function transformImportCourseData(
  row: ImportCourseDataCsv,
  courseId: number,
  userDetailsMap: Map<string, ImportCourseDataUser>,
  groupDetailsMap: Map<string, ImportCourseDataGroup>,
  userGroupingMap: Map<string, string>,
) {
  const userData = getUserData(row);
  const groupData = getGroupData(row, courseId);
  userDetailsMap.set(row.email, userData);
  if (row.teamName) {
    groupDetailsMap.set(row.teamName, groupData);
    userGroupingMap.set(row.email, row.teamName);
  }
}

async function processImportCourseData(
  courseId: number,
  userDetailsMap: Map<string, ImportCourseDataUser>,
  groupDetailsMap: Map<string, ImportCourseDataGroup>,
  userGroupingMap: Map<string, string>,
) {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Create projects
    /* eslint-disable array-callback-return, no-param-reassign */
    const projectPromises = Array.from(groupDetailsMap).map(async ([groupName, groupData]) => {
      const project = await tx.project.create({
        data: {
          pname: groupData.projectName,
          pkey: groupData.teamName,
          course_id: groupData.courseId,
          backlogStatuses: {
            createMany: {
              data: defaultBacklogStatus,
            },
          },
        },
      });
      groupData.projectId = project.id;
      groupDetailsMap.set(groupName, groupData);
    });

    // Wait for all promises to be settled before continuing.
    // This is required for correct behaviour within a transaction.
    // https://medium.com/@alkor_shikyaro/transactions-and-promises-in-node-js-ca5a3aeb6b74
    const projectActions = await Promise.allSettled(projectPromises);
    projectActions.map((action) => {
      if (action.status === 'rejected') {
        throw new Error(action.reason);
      }
    });

    const userPromises = Array.from(userDetailsMap).map(async ([userEmail, userData]) => {
      // Create users
      const user = await tx.user.upsert({
        where: {
          user_email: userEmail,
        },
        update: {}, // This ensures that the user always exists
        create: {
          user_display_name: userData.name ?? userData.email,
          user_email: userData.email,
          user_password_hash: userData.password,
          basicRoles: {
            create: {
              role_id: STUDENT_ROLE_ID, // Default role of a new user
            },
          },
          courses: {
            create: {
              course_id: courseId,
              role_id: userData.roleId,
            },
          },
        },
      });

      // We must incur another db query here because we cannot access userId in the update clause of the query above
      // A tradeoff is that if the user is created above, this query is unnecessary
      await tx.usersOnRolesOnCourses.upsert({
        where: {
          user_id_course_id: {
            user_id: user.user_id,
            course_id: courseId,
          },
        },
        create: {
          user_id: user.user_id,
          course_id: courseId,
          role_id: userData.roleId,
        },
        update: {
          course_id: courseId,
          role_id: userData.roleId,
        },
      });

      // Add users to project/course
      if (userData.roleId === STUDENT_ROLE_ID) {
        const userGroup = userGroupingMap.get(userEmail);
        if (userGroup) {
          const projectId = groupDetailsMap.get(userGroup)?.projectId;
          // Since Project names are not unique within a course, a new project is always created on csv submission
          await tx.usersOnProjects.create({
            data: {
              user_id: user.user_id,
              project_id: Number(projectId),
            },
          });
        } else {
          throw new Error(`${userEmail}: userGroup undefined`);
        }
      }
    });

    // Wait for all promises to be settled before continuing.
    // This is required for correct behaviour within a transaction.
    // https://medium.com/@alkor_shikyaro/transactions-and-promises-in-node-js-ca5a3aeb6b74
    const userActions = await Promise.allSettled(userPromises);
    userActions.map((action) => {
      if (action.status === 'rejected') {
        throw new Error(action.reason);
      }
    });

    /* eslint-enable array-callback-return, no-param-reassign */
  });
}

async function importCourseData(csvFilePath: string, courseId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    let errorMessages = '';
    const userDetailsMap = new Map<string, ImportCourseDataUser>();
    const groupDetailsMap = new Map<string, ImportCourseDataGroup>();
    const userGroupingMap = new Map<string, string>();
    const csvParseStream = csv.parseFile<ImportCourseDataCsv, ImportCourseDataCsv>(
      csvFilePath,
      IMPORT_COURSE_DATA_CONFIG,
    );

    csvParseStream
      .validate((data: ImportCourseDataCsv, callback: csv.RowValidateCallback): void => {
        validateImportCourseData(data, callback);
      })
      .on('error', (error) => {
        errorMessages += `Error: ${error.message}${MESSAGE_SPACE}`;
      })
      .on('data-invalid', (row, rowNumber, reason) => {
        errorMessages += `Invalid: [rowNumber=${rowNumber}] [row=${row}] [reason=${reason}] ${MESSAGE_SPACE}`;
      })
      .on('data', (row: ImportCourseDataCsv) => {
        transformImportCourseData(row, courseId, userDetailsMap, groupDetailsMap, userGroupingMap);
      })
      .on('finish', async () => {
        if (errorMessages) {
          reject(errorMessages.trimEnd());
          return;
        }
        try {
          await processImportCourseData(courseId, userDetailsMap, groupDetailsMap, userGroupingMap);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
  });
}

function validateCorrectProperties(data: ImportProjectAssignmentsCsv, expectedProperties?: string[]): boolean {
  if (!expectedProperties) return true;
  return Object.keys(data).length === expectedProperties.length && expectedProperties.every((key) => key in data);
}

function validateProjectName(projectName: unknown): boolean {
  if (typeof projectName !== 'string') return false; // Ensure it's a string
  const trimmedName = projectName.trim();
  return trimmedName.length > 0;
}

function validateProjectAssignmentData(
  data: ImportProjectAssignmentsCsv,
  projectGroups: Map<string, Project[]>,
  callback: csv.RowValidateCallback,
) {
  let errorMessages = '';
  if (!validateCorrectProperties(data, ['sourceProjectGroup', 'targetProjectGroup'])) {
    errorMessages += INVALID_PROPERTIES + MESSAGE_SPACE;
  }
  if (!validateProjectName(data.sourceProjectGroup) || !validateProjectName(data.targetProjectGroup)) {
    errorMessages += INVALID_PROJECT_NAME + MESSAGE_SPACE;
  }
  if (!projectGroups.has(data.sourceProjectGroup) || !projectGroups.has(data.targetProjectGroup)) {
    errorMessages += `Invalid assignment: Source or target project not found${MESSAGE_SPACE}`;
  }
  if ((projectGroups.get(data.sourceProjectGroup)?.length ?? 0) > 1) {
    errorMessages += `Duplicate project name: ${data.sourceProjectGroup}${MESSAGE_SPACE}`;
  }
  if ((projectGroups.get(data.targetProjectGroup)?.length ?? 0) > 1) {
    errorMessages += `Duplicate project name: ${data.targetProjectGroup}${MESSAGE_SPACE}`;
  }
  if (errorMessages) {
    return callback(null, false, errorMessages.trimEnd());
  }
  return callback(null, true);
}

// Do nothing if project assignment already exists
async function processImportProjectAssignments(
  assignments: Pick<ProjectAssignment, 'sourceProjectId' | 'targetProjectId'>[],
) {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    for (const assignment of assignments) {
      await tx.projectAssignment.upsert({
        where: {
          sourceProjectId_targetProjectId: {
            sourceProjectId: assignment.sourceProjectId,
            targetProjectId: assignment.targetProjectId,
          },
        },
        update: {},
        create: assignment,
      });
    }
  });
}

async function importProjectAssignments(csvFilePath: string, courseId: number): Promise<void> {
  return new Promise(async (resolve, reject) => {
    let errorMessages = '';
    const projectGroups = new Map<string, Project[]>();
    const assignments: Pick<ProjectAssignment, 'sourceProjectId' | 'targetProjectId'>[] = [];

    // Preprocess project data
    const courseProjects = await prisma.project.findMany({
      where: {
        course_id: courseId,
      },
    });
    for (const project of courseProjects) {
      if (!projectGroups.has(project.pname)) {
        projectGroups.set(project.pname, []);
      }
      projectGroups.get(project.pname)?.push(project);
    }

    const csvParseStream = csv.parseFile<ImportProjectAssignmentsCsv, ImportProjectAssignmentsCsv>(
      csvFilePath,
      IMPORT_COURSE_DATA_CONFIG,
    );
    csvParseStream
      .validate((data: ImportProjectAssignmentsCsv, callback: csv.RowValidateCallback): void => {
        validateProjectAssignmentData(data, projectGroups, callback);
      })
      .on('error', (error) => {
        errorMessages += `Error: ${error.message}${MESSAGE_SPACE}`;
      })
      .on('data-invalid', (row, rowNumber, reason) => {
        errorMessages += `Invalid: [rowNumber=${rowNumber}] [row=${row}] [reason=${reason}] ${MESSAGE_SPACE}`;
      })
      .on('data', (row: ImportProjectAssignmentsCsv) => {
        const sourceProject = projectGroups.get(row.sourceProjectGroup)?.at(0)!;
        const targetProject = projectGroups.get(row.targetProjectGroup)?.at(0)!;

        assignments.push({
          sourceProjectId: sourceProject.id,
          targetProjectId: targetProject.id,
        });
      })
      .on('finish', async () => {
        if (errorMessages) {
          reject(errorMessages.trim());
          return;
        }
        try {
          await processImportProjectAssignments(assignments);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
  });
}

export default {
  importCourseData,
  validateImportCourseData,
  transformImportCourseData,
  processImportCourseData,
  importProjectAssignments,
};
