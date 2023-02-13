import * as csv from '@fast-csv/parse';
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
    INVALID_TEAM_NAME
} from "./types/csv.service.types";
import { validate } from "email-validator";
import { ROLE_ID_MAP, STUDENT_ROLE_ID } from "../helpers/constants";
import prisma from '../models/prismaClient';
import { Prisma } from '.prisma/client';

async function importCourseData(csvFilePath: string, courseId: number) {
        return new Promise((resolve, reject) => {
            let errorMessages = "";
            let userDetailsMap = new Map<string, ImportCourseDataUser>();
            let groupDetailsMap = new Map<string, ImportCourseDataGroup>();
            let userGroupingMap = new Map<string, string>();
    
            const csvParseStream = csv.parseFile<ImportCourseDataCsv, ImportCourseDataCsv>(csvFilePath, IMPORT_COURSE_DATA_CONFIG);
        
            csvParseStream.validate((data: ImportCourseDataCsv, callback: csv.RowValidateCallback) : void => {
                validateImportCourseData(data, callback);
            })
            .on('error', error => {
                errorMessages += `Error: ${error.message}\n`;
            })
            .on('data-invalid', (row, rowNumber, reason) => {
                errorMessages += `Invalid: [rowNumber=${rowNumber}] [row=${JSON.stringify(row)}] [reason=${reason}]\n`;
            })
            .on('data', (row : ImportCourseDataCsv) => {
                transformImportCourseData(row, courseId, userDetailsMap, groupDetailsMap, userGroupingMap);
            })
            .on('finish', async () => {
                if (errorMessages) {
                    reject(errorMessages);
                    return;
                }
                try {
                    const result = await processImportCourseData(courseId, userDetailsMap, groupDetailsMap, userGroupingMap);
                    resolve(result);
                } catch (error) {
                    reject(error)
                }
                
            });
        });
}

function validateImportCourseData(data: ImportCourseDataCsv, callback: csv.RowValidateCallback) {
    let errorMessages = "";
    if (!validate(data.email)) {
        errorMessages += INVALID_EMAIL;
    }
    if (!validatePassword(data)) {
        errorMessages += INVALID_PASSWORD;
    }
    if (!validateRole(data)) {
        errorMessages += INVALID_ROLE;
    }
    if (!validateTeamName(data)) {
        errorMessages += INVALID_TEAM_NAME;
    }
    if (errorMessages) {
        return callback(null, false, errorMessages);
    }
    return callback(null, true);
}

function validateTeamName(data: ImportCourseDataCsv) : boolean {
    // Assumption: Team name is required for all students. A student cannot be unassigned
    const roleId = ROLE_ID_MAP.get(data.role.toUpperCase());
    if (!roleId || (!data.teamName  && roleId === STUDENT_ROLE_ID)) {
        return false;
    }
    return true;
}

function validatePassword(data: ImportCourseDataCsv) : boolean {
    const ssoProvider = true;
    // TODO (kishen) : Add SSO validation once it is integrated.
    // For now we just return true as long as there is an email
    if (!ssoProvider && !data.password) {
        return false;
    }

    return true;
}

function validateRole(data: ImportCourseDataCsv) : boolean {
    return ROLE_ID_MAP.has(data.role.toUpperCase());
}

function transformImportCourseData(
    row: ImportCourseDataCsv, 
    courseId: number, 
    userDetailsMap: Map<string, ImportCourseDataUser>,
    groupDetailsMap: Map<string, ImportCourseDataGroup>,
    userGroupingMap: Map<string, string>
    ) {
    const userData = getUserData(row);
    const groupData = getGroupData(row, courseId);
    userDetailsMap.set(row.email, userData);
    groupDetailsMap.set(row.teamName, groupData);
    userGroupingMap.set(row.email, row.teamName);
}

async function processImportCourseData(
    courseId: number, 
    userDetailsMap: Map<string, ImportCourseDataUser>, 
    groupDetailsMap: Map<string, ImportCourseDataGroup>, 
    userGroupingMap: Map<string, string>
    ) {

    return await prisma.$transaction(async (tx : Prisma.TransactionClient) => {
        // Create projects
        for (let groupDetails of groupDetailsMap.entries()) {
            const groupName = groupDetails[0];
            const groupData = groupDetails[1];
            const project = await tx.project.create({
                data : {
                    pname : groupData.projectName,
                    pkey : groupData.teamName,
                    course_id : groupData.courseId,
                }
            });
            groupData.projectId = project.id;
            groupDetailsMap.set(groupName, groupData);
        }

        for (let userDetails of userDetailsMap.entries()) {
            const userEmail = userDetails[0];
            const userData = userDetails[1];
            // Create users and their course roles
            const user = await tx.user.upsert({
                where : {
                    user_email : userEmail
                },
                update : {
                    courseRoles : {
                        upsert : {
                            where : {
                                user_email_course_id : {
                                    user_email : userEmail,
                                    course_id : courseId
                                }
                            },
                            create : {
                                course_id : courseId,
                                role_id : userData.roleId,
                            },
                            update : {
                                course_id : courseId,
                                role_id : userData.roleId, 
                            }
                        }
                    }
                },
                create : {
                    user_email : userData.email,
                    user_password_hash : userData.password,
                    basicRoles : {
                        create : {
                            role_id : STUDENT_ROLE_ID,
                        }
                    },
                    courseRoles : {
                        create : {
                            course_id : courseId,
                            role_id : userData.roleId,
                        }
                    }
                }
            });

            // Add users to project/course
            if (userData.roleId === STUDENT_ROLE_ID) {
                const userGroup = userGroupingMap.get(userEmail);
                const projectId = groupDetailsMap.get(userGroup as string)?.projectId;
                await tx.usersOnProjects.create({
                    data : {
                        user_id : user.user_id,
                        project_id : Number(projectId)
                    }
                });
            } else {
                // On repeated CSV submissions, there may already be an entry for the course
                await tx.usersOnCourses.upsert({
                    where : {
                        course_id_user_id : {
                            user_id : user.user_id,
                            course_id : courseId,
                        }
                    },
                    update : {}, // If the record already exists, we do nothing.
                    create : {
                        user_id : user.user_id,
                        course_id : courseId
                    }
                })
            }
        }
    });
}

export default {
    importCourseData,
}
