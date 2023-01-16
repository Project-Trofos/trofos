/* eslint-disable import/prefer-default-export */
import { PrismaClient } from '@prisma/client';
import { COURSE_1_ID, COURSE_3_ID, USER_2_ID } from './constants';

async function createUsersOnCoursesTableSeed(prisma: PrismaClient) {
    const usersOnCourses = await prisma.usersOnCourses.createMany({
        data : [
            {
                course_id : COURSE_1_ID,
                user_id : USER_2_ID
            },
            {
                course_id : COURSE_3_ID,
                user_id  : USER_2_ID
            }
        ]
    });

    console.log("created usersOnCourses table seed %s", usersOnCourses);
}

export { createUsersOnCoursesTableSeed };