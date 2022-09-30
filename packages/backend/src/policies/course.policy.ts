import { Course, UserSession } from '@prisma/client';
import { PureAbility, AbilityBuilder } from '@casl/ability';
import { createPrismaAbility, PrismaQuery, Subjects } from '@casl/prisma';
import prisma from '../models/prismaClient';
import { accessibleBy } from '@casl/prisma'

type AppAbility = PureAbility<[string, Subjects<{
    Course : Course
}>], PrismaQuery>;


export default function coursePolicy(userId : number) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);

    /*
        A user can only manage (CRUD) a course if:
        1) They are part of that course
    */

    // Handles the case where we are checking a list of courses
    can('manage', 'Course', { 
        users : {
            some : {
                user_id : userId
            }
        }
    });

    return build();
}

export async function canManageCourse(userId : number, course_id: string, course_year: number, course_sem: number) : Promise<Boolean> {
    // Returns at most one course
    const courses = await prisma.course.findMany({
        where : {
            AND : [
                accessibleBy(coursePolicy(userId)).Course,
                {
                    id : course_id,
                    year : course_year,
                    sem : course_sem
                }
            ]
        }
    });

    return courses.length === 1;
}
