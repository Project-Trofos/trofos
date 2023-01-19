/* eslint-disable import/prefer-default-export */
import { PrismaClient } from '@prisma/client';
import { 
    BACKLOG_USER_1_EMAIL,
    BACKLOG_USER_2_EMAIL,
    COURSE_1_ID,
    COURSE_3_ID,
    FACULTY_ROLE_ID,
    SHADOW_COURSE_1_ID,
    SHADOW_COURSE_2_ID,
    STUDENT_ROLE_ID,
    USER_1_EMAIL,
    USER_2_EMAIL,
} from './constants';

async function createUsersOnRolesOnCoursesTableSeed(prisma : PrismaClient) {

    const usersOnRolesOnCourses = await prisma.usersOnRolesOnCourses.createMany({
        data : [
            {
                user_email : USER_2_EMAIL,
                role_id : FACULTY_ROLE_ID,
                course_id : COURSE_1_ID
            },
            {
                user_email : USER_2_EMAIL,
                role_id : FACULTY_ROLE_ID,
                course_id : COURSE_3_ID
            },
            {
                user_email : USER_1_EMAIL,
                role_id : STUDENT_ROLE_ID,
                course_id : COURSE_1_ID
            },
            {
                user_email : BACKLOG_USER_1_EMAIL,
                role_id : STUDENT_ROLE_ID,
                course_id : SHADOW_COURSE_1_ID 
            },
            {
                user_email : BACKLOG_USER_2_EMAIL,
                role_id : STUDENT_ROLE_ID,
                course_id : SHADOW_COURSE_1_ID 
            },
            {
                user_email : USER_2_EMAIL,
                role_id : FACULTY_ROLE_ID,
                course_id : SHADOW_COURSE_2_ID
            },
        ]
    });

    console.log("created usersOnRolesOnCourses table seed %s", usersOnRolesOnCourses);
}

export { createUsersOnRolesOnCoursesTableSeed };