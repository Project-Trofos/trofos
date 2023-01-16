/* eslint-disable import/prefer-default-export */
import { PrismaClient } from ".prisma/client";
import { FACULTY_ROLE_ID, STUDENT_ROLE_ID, BACKLOG_USER_1_EMAIL, BACKLOG_USER_2_EMAIL, USER_1_EMAIL, USER_2_EMAIL, USER_3_EMAIL, ADMIN_ROLE_ID } from "./constants";

async function createUsersOnRolesTableSeed(prisma: PrismaClient) {
    const usersOnRoles = await prisma.usersOnRoles.createMany({
        data : [
            {
                user_email : BACKLOG_USER_1_EMAIL,
                role_id: STUDENT_ROLE_ID
            },
            {
                user_email : BACKLOG_USER_2_EMAIL,
                role_id : FACULTY_ROLE_ID
            },
            {
                user_email : USER_1_EMAIL,
                role_id : STUDENT_ROLE_ID
            },
            {
                user_email : USER_2_EMAIL,
                role_id : FACULTY_ROLE_ID,
            },
            {
                user_email : USER_3_EMAIL,
                role_id : ADMIN_ROLE_ID
            }
        ]
    });

    console.log("created usersOnRoles table seed %s", usersOnRoles);
};

export { createUsersOnRolesTableSeed };