import prisma from '../models/prismaClient';
import { FACULTY_ROLE_ID, STUDENT_ROLE_ID } from "../helpers/constants";

async function patchMigration() {
    await prisma.usersOnRolesOnCourses.createMany({
        data : [
            {
                user_email: "testUser@test.com",
                role_id: STUDENT_ROLE_ID,
                course_id : 1
            },
            {
                user_email: "testFaculty@test.com",
                role_id: FACULTY_ROLE_ID,
                course_id: 1
            }
        ]
    })
}

patchMigration();

