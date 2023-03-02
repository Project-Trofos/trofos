import * as csv from '@fast-csv/parse';
import { validate } from 'email-validator';
import { Prisma } from '@prisma/client';
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
} from './types/csv.service.types';
import { ROLE_ID_MAP, STUDENT_ROLE_ID } from '../helpers/constants';
import prisma from '../models/prismaClient';

function validateTeamName(data: ImportCourseDataCsv): boolean {
  // Assumption: Team name is required for all students. A student cannot be unassigned
  const roleId = ROLE_ID_MAP.get(data.role.toUpperCase());
  if (!data.teamName && roleId === STUDENT_ROLE_ID) {
    return false;
  }
  return true;
}

function validatePassword(data: ImportCourseDataCsv): boolean {
  const ssoProvider = true;
  // TODO (kishen) : Add SSO validation once it is integrated.
  // For now we just return true as long as there is an email
  if (!ssoProvider && !data.password) {
    return false;
  }

  return true;
}

function validateRole(data: ImportCourseDataCsv): boolean {
  return ROLE_ID_MAP.has(data.role.toUpperCase());
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
    return callback(null, false, errorMessages.trimRight());
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
          user_email: userData.email,
          user_password_hash: userData.password,
          basicRoles: {
            create: {
              role_id: STUDENT_ROLE_ID, // Default role of a new user
            },
          },
          courseRoles: {
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
                user_id : user.user_id,
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
      })

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
          reject(errorMessages.trimRight());
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

export default {
  importCourseData,
  validateImportCourseData,
  transformImportCourseData,
  processImportCourseData,
};
