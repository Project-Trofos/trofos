import { accessibleBy } from '@casl/prisma';
import { GradeStatus, GradeAuditAction } from '@prisma/client';
import prisma from '../models/prismaClient';
import { AppAbility } from '../policies/policyTypes';
import { BadRequestError, assertScoreIsValid } from '../helpers/error';

async function listByCourse(courseId: number, policyConstraint: AppAbility) {
  return prisma.grade.findMany({
    where: {
      AND: [accessibleBy(policyConstraint).Grade, { project: { course_id: courseId } }],
    },
    include: { milestone: true },
    orderBy: [{ project_id: 'asc' }, { milestone_id: 'asc' }],
  });
}

async function listByProject(projectId: number, policyConstraint: AppAbility) {
  return prisma.grade.findMany({
    where: {
      AND: [accessibleBy(policyConstraint).Grade, { project_id: projectId }],
    },
    include: { milestone: true },
    orderBy: { milestone_id: 'asc' },
  });
}

async function upsertMilestoneGrade(
  projectId: number,
  milestoneId: number,
  graderId: number,
  payload: { score?: number; comment?: string },
) {
  const [project, milestone] = await Promise.all([
    prisma.project.findUniqueOrThrow({ where: { id: projectId } }),
    prisma.milestone.findUniqueOrThrow({ where: { id: milestoneId } }),
  ]);

  if (project.course_id !== milestone.course_id) {
    throw new BadRequestError('This milestone does not belong to the same course as the project!');
  }

  if (payload.score !== undefined) {
    assertScoreIsValid(payload.score, milestone.max_marks);
  }

  return prisma.$transaction(async (tx) => {
    const grade = await tx.grade.upsert({
      where: { project_id_milestone_id: { project_id: projectId, milestone_id: milestoneId } },
      create: {
        project_id: projectId,
        milestone_id: milestoneId,
        score: payload.score,
        comment: payload.comment,
        grader_id: graderId,
        status: GradeStatus.DRAFT,
      },
      update: {
        score: payload.score,
        comment: payload.comment,
        grader_id: graderId,
        status: GradeStatus.DRAFT,
      },
      include: { milestone: true },
    });

    await tx.gradeAuditLog.create({
      data: {
        project_id: projectId,
        milestone_id: milestoneId,
        action: GradeAuditAction.MILESTONE_GRADE_UPSERTED,
        score: grade.score,
        comment: grade.comment,
        status: GradeStatus.DRAFT,
        actor_id: graderId,
      },
    });

    return grade;
  });
}

async function publishGrade(gradeId: number, actorId: number | null) {
  return prisma.$transaction(async (tx) => {
    const grade = await tx.grade.update({
      where: { id: gradeId },
      data: { status: GradeStatus.PUBLISHED },
    });

    await tx.gradeAuditLog.create({
      data: {
        project_id: grade.project_id,
        milestone_id: grade.milestone_id,
        action: GradeAuditAction.MILESTONE_GRADE_PUBLISHED,
        score: grade.score,
        comment: grade.comment,
        status: grade.status,
        actor_id: actorId,
      },
    });

    return grade;
  });
}

async function unpublishGrade(gradeId: number, actorId: number | null) {
  return prisma.$transaction(async (tx) => {
    const grade = await tx.grade.update({
      where: { id: gradeId },
      data: { status: GradeStatus.DRAFT },
    });

    await tx.gradeAuditLog.create({
      data: {
        project_id: grade.project_id,
        milestone_id: grade.milestone_id,
        action: GradeAuditAction.MILESTONE_GRADE_UNPUBLISHED,
        score: grade.score,
        comment: grade.comment,
        status: grade.status,
        actor_id: actorId,
      },
    });

    return grade;
  });
}

/*
      Assigns (or clears) the TA responsible for grading a project's milestone. This is tracked
      via Grade.grader_id, the same field set implicitly whenever someone upserts a score — an
      explicit assignment just upserts a Grade row with no score/comment yet.
*/
async function assignTaForMilestone(
  projectId: number,
  milestoneId: number,
  assignedTaId: number | null,
  actorId: number | null,
) {
  return prisma.$transaction(async (tx) => {
    const grade = await tx.grade.upsert({
      where: { project_id_milestone_id: { project_id: projectId, milestone_id: milestoneId } },
      create: {
        project_id: projectId,
        milestone_id: milestoneId,
        grader_id: assignedTaId,
      },
      update: {
        grader_id: assignedTaId,
      },
    });

    await tx.gradeAuditLog.create({
      data: {
        project_id: projectId,
        milestone_id: milestoneId,
        action: GradeAuditAction.TA_ASSIGNED,
        assigned_ta_id: assignedTaId,
        actor_id: actorId,
      },
    });

    return grade;
  });
}

async function getGradeHistory(projectId: number) {
  return prisma.gradeAuditLog.findMany({
    where: { project_id: projectId },
    orderBy: { created_at: 'desc' },
    include: { actor: { select: { user_id: true, user_display_name: true, user_email: true } } },
  });
}

export default {
  listByCourse,
  listByProject,
  upsertMilestoneGrade,
  publishGrade,
  unpublishGrade,
  assignTaForMilestone,
  getGradeHistory,
};
