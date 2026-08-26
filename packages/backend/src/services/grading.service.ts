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

// User with admin role or assigned pdate_course action for the course
async function isCourseGradingAdmin(userSession: UserSession, courseId: number): Promise<boolean> {
  if (userSession.user_role_id === ADMIN_ROLE_ID) {
    return true;
  }

  const userRoleForCourse = await roleService.getUserRoleActionsForCourse(userSession.user_id, courseId);
  return userRoleForCourse.role.actions.some((roleAction) => roleAction.action === Action.update_course);
}

// Every project in the course needs a ProjectGrade row
// Create manually for legacy data
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

  if (grade.status === ProjectGradeStatus.published) {
    throw new NotAuthorizedError('This grade has been published and can no longer be edited!');
  }

  const isAssignedTa = grade.assigned_ta_id === userSession.user_id;

  const needsAdminCheck = !isAssignedTa || data.assignedTaId !== undefined;
  const isAdmin = needsAdminCheck ? await isCourseGradingAdmin(userSession, courseId) : false;

  if (!isAssignedTa && !isAdmin) {
    throw new NotAuthorizedError('You are not authorised to edit grades for this project!');
  }

  if (data.assignedTaId !== undefined && !isAdmin) {
    throw new NotAuthorizedError('Only course admins can reassign the grades for a project!');
  }

  //publish with publishAll endpoint
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
    throw new NotAuthorizedError('Only course admins can publish grades!');
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
