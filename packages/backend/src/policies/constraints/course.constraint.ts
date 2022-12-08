import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility, accessibleBy } from '@casl/prisma';
import prisma from '../../models/prismaClient';
import { AppAbility } from '../policyTypes';

function coursePolicyConstraint(userId: number, isUserAdmin: boolean) {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);

  /*
        A user can only manage (CRUD) a course if:
        1) They are part of that course
        2) They are the admin
    */

  if (isUserAdmin) {
    can('manage', 'Course');
  } else {
    // Handles the case where we are checking a list of courses
    can('manage', 'Course', {
      users: {
        some: {
          user_id: userId,
        },
      },
    });
  }

  return build();
}

async function canManageCourse(userId: number, course_id: number, isUserAdmin: boolean): Promise<boolean> {
  if (isUserAdmin) return true;

  // Returns at most one course
  const courses = await prisma.course.findMany({
    where: {
      AND: [
        accessibleBy(coursePolicyConstraint(userId, isUserAdmin)).Course,
        {
          id: course_id,
        },
      ],
    },
  });

  return courses.length === 1;
}

export default {
  coursePolicyConstraint,
  canManageCourse,
};
