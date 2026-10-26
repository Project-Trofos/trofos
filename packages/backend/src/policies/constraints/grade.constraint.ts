import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility, accessibleBy } from '@casl/prisma';
import prisma from '../../models/prismaClient';
import { AppAbility } from '../policyTypes';
import { FACULTY_ROLE_ID } from '../../helpers/constants';

function gradePolicyConstraint(userId: number, isUserAdmin: boolean) {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);

  /*
        A user can manage (CRUD) a Grade if:
        1) They have a course role for the course that the grade's project is part of (FACULTY, including TAs)
        2) They are the admin
        A student may only read PUBLISHED grades for a project they are a member of.
  */

  if (isUserAdmin) {
    can('manage', 'Grade');
  } else {
    can('manage', 'Grade', {
      project: {
        course: {
          courseRoles: {
            some: {
              user_id: userId,
              role_id: FACULTY_ROLE_ID,
            },
          },
        },
      },
    });

    can('read', 'Grade', {
      status: 'PUBLISHED',
      project: {
        users: {
          some: {
            user_id: userId,
          },
        },
      },
    });
  }

  return build();
}

async function canManageGrade(userId: number, gradeId: number, isUserAdmin: boolean): Promise<boolean> {
  if (isUserAdmin) return true;

  const grades = await prisma.grade.findMany({
    where: {
      AND: [accessibleBy(gradePolicyConstraint(userId, isUserAdmin)).Grade, { id: gradeId }],
    },
  });

  return grades.length === 1;
}

/*
      Assigning a TA to a milestone's grade is open to any course FACULTY (or an admin),
      matching the course-manager-level actions on the grading page.
*/
async function canAssignTa(userId: number, projectId: number, isUserAdmin: boolean): Promise<boolean> {
  if (isUserAdmin) return true;

  const projects = await prisma.project.findMany({
    where: {
      AND: [
        {
          course: {
            courseRoles: {
              some: { user_id: userId, role_id: FACULTY_ROLE_ID },
            },
          },
        },
        { id: projectId },
      ],
    },
  });

  return projects.length === 1;
}

/*
      Editing a Grade's score/comment is restricted to the grade's assigned TA (or an admin).
      The assigned TA is tracked via Grade.grader_id, set either by an explicit TA assignment
      or implicitly whenever someone upserts the score. A milestone with no assigned TA yet
      cannot have its grade edited by anyone but an admin.
*/
async function canEditGradeValue(
  userId: number,
  projectId: number,
  milestoneId: number,
  isUserAdmin: boolean,
): Promise<boolean> {
  if (isUserAdmin) return true;

  const grade = await prisma.grade.findUnique({
    where: { project_id_milestone_id: { project_id: projectId, milestone_id: milestoneId } },
  });

  return grade?.grader_id === userId;
}

/*
      Assigning a TA to a sprint's grade is open to any course FACULTY (or an admin), mirroring
      canAssignTa. Sprint is inherently project-scoped (unlike Milestone), so there's no
      cross-course check to make here beyond "is this project in a course this user manages".
*/
async function canAssignTaForSprint(userId: number, projectId: number, isUserAdmin: boolean): Promise<boolean> {
  if (isUserAdmin) return true;

  const projects = await prisma.project.findMany({
    where: {
      AND: [
        {
          course: {
            courseRoles: {
              some: { user_id: userId, role_id: FACULTY_ROLE_ID },
            },
          },
        },
        { id: projectId },
      ],
    },
  });

  return projects.length === 1;
}

/*
      Editing a sprint Grade's score/comment is restricted to the grade's assigned TA (or an
      admin), mirroring canEditGradeValue.
*/
async function canEditSprintGradeValue(
  userId: number,
  projectId: number,
  sprintId: number,
  isUserAdmin: boolean,
): Promise<boolean> {
  if (isUserAdmin) return true;

  const grade = await prisma.grade.findUnique({
    where: { project_id_sprint_id: { project_id: projectId, sprint_id: sprintId } },
  });

  return grade?.grader_id === userId;
}

/*
      Bulk-setting sprint max marks is a course-manager action, open to any course FACULTY
      (or an admin) for that course.
*/
async function canBulkSetSprintMaxMarks(userId: number, courseId: number, isUserAdmin: boolean): Promise<boolean> {
  if (isUserAdmin) return true;

  const roles = await prisma.usersOnRolesOnCourses.findMany({
    where: { user_id: userId, course_id: courseId, role_id: FACULTY_ROLE_ID },
  });

  return roles.length > 0;
}

export default {
  gradePolicyConstraint,
  canManageGrade,
  canAssignTa,
  canEditGradeValue,
  canAssignTaForSprint,
  canEditSprintGradeValue,
  canBulkSetSprintMaxMarks,
};
