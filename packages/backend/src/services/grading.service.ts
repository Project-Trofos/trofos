import { Action, Prisma, ProjectGrade, ProjectGradeStatus, UserSession } from '@prisma/client';
import prisma from '../models/prismaClient';
import roleService from './role.service';
import { ADMIN_ROLE_ID } from '../helpers/constants';
import { BadRequestError, NotAuthorizedError } from '../helpers/error';

type GradingUpdateFields = {
  assignedTaId?: number | null;
  marks?: number;
  comments?: string;
  status?: ProjectGradeStatus;
};

// A course admin/instructor is anyone who is a global admin, or holds the
// update_course action for the course. Everyone else with course access
// (i.e. a course FACULTY member) is treated as a TA, scoped to projects
// they are explicitly assigned to via ProjectGrade.assigned_ta_id.
async function isCourseGradingAdmin(userSession: UserSession, courseId: number): Promise<boolean> {
  if (userSession.user_role_id === ADMIN_ROLE_ID) {
    return true;
  }

  const userRoleForCourse = await roleService.getUserRoleActionsForCourse(userSession.user_id, courseId);
  return userRoleForCourse.role.actions.some((roleAction) => roleAction.action === Action.update_course);
}

// Every project in the course needs a ProjectGrade row before it can show up
// in the matrix. Projects created before this feature (or newly attached to
// the course) won't have one yet, so lazily backfill on read.
async function ensureGradeRowsExist(courseId: number): Promise<void> {
  const projects = await prisma.project.findMany({
    where: { course_id: courseId },
    select: { id: true },
  });

  await prisma.projectGrade.createMany({
    data: projects.map((project) => ({ project_id: project.id })),
    skipDuplicates: true,
  });
}

async function list(courseId: number) {
  await ensureGradeRowsExist(courseId);

  return prisma.projectGrade.findMany({
    where: { project: { course_id: courseId } },
    include: { project: true, assignedTa: true },
    orderBy: { project_id: 'asc' },
  });
}

async function update(
  courseId: number,
  projectId: number,
  data: GradingUpdateFields,
  userSession: UserSession,
): Promise<ProjectGrade> {
  const grade = await prisma.projectGrade.findFirstOrThrow({
    where: { project_id: projectId, project: { course_id: courseId } },
  });

  // Once published, a grade is locked for everyone through this endpoint -
  // there is no override, by TA or admin. Amending a published grade would
  // require a separate unpublish action, which doesn't exist yet.
  if (grade.status === ProjectGradeStatus.published) {
    throw new NotAuthorizedError('This grade has been published and can no longer be edited!');
  }

  const isAssignedTa = grade.assigned_ta_id === userSession.user_id;

  // Only hit the DB for admin status when it can actually change the outcome:
  // an assigned TA editing their own fields never needs it.
  const needsAdminCheck = !isAssignedTa || data.assignedTaId !== undefined;
  const isAdmin = needsAdminCheck ? await isCourseGradingAdmin(userSession, courseId) : false;

  if (!isAssignedTa && !isAdmin) {
    throw new NotAuthorizedError('You are not authorised to edit grades for this project!');
  }

  if (data.assignedTaId !== undefined && !isAdmin) {
    throw new NotAuthorizedError('Only course admins/instructors can reassign the grader for a project!');
  }

  // Grades can only move draft <-> submitted here (grade.status is guaranteed
  // not published at this point). published is only reachable via publishAll.
  if (data.status === ProjectGradeStatus.published) {
    throw new BadRequestError(`Invalid status transition: ${grade.status} -> ${data.status}`);
  }

  return prisma.projectGrade.update({
    where: { id: grade.id },
    data: {
      assigned_ta_id: data.assignedTaId,
      marks: data.marks,
      comments: data.comments,
      status: data.status,
    },
    include: { project: true, assignedTa: true },
  });
}

async function publishAll(courseId: number, userSession: UserSession): Promise<Prisma.BatchPayload> {
  const isAdmin = await isCourseGradingAdmin(userSession, courseId);

  if (!isAdmin) {
    throw new NotAuthorizedError('Only course admins/instructors can publish grades!');
  }

  return prisma.projectGrade.updateMany({
    where: {
      project: { course_id: courseId },
      status: { in: [ProjectGradeStatus.draft, ProjectGradeStatus.submitted] },
    },
    data: { status: ProjectGradeStatus.published },
  });
}

export default {
  list,
  update,
  publishAll,
};
