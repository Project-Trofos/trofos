import { accessibleBy } from '@casl/prisma';
import { GradeStatus, GradeAuditAction } from '@prisma/client';
import prisma from '../models/prismaClient';
import { AppAbility } from '../policies/policyTypes';
import { HAS_GRADE_CONTENT } from '../helpers/gradeFilters';
import { BadRequestError, ConflictError, assertMaxMarksIsValid, assertScoreIsValid } from '../helpers/error';

async function listByCourse(courseId: number, policyConstraint: AppAbility) {
  return prisma.grade.findMany({
    where: {
      AND: [accessibleBy(policyConstraint).Grade, { project: { course_id: courseId } }],
    },
    include: { milestone: true, sprint: true },
    orderBy: [{ project_id: 'asc' }, { milestone_id: 'asc' }, { sprint_id: 'asc' }],
  });
}

async function listByProject(projectId: number, policyConstraint: AppAbility) {
  return prisma.grade.findMany({
    where: {
      AND: [accessibleBy(policyConstraint).Grade, { project_id: projectId }],
    },
    include: { milestone: true, sprint: true },
    orderBy: [{ milestone_id: 'asc' }, { sprint_id: 'asc' }],
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

async function upsertSprintGrade(
  projectId: number,
  sprintId: number,
  graderId: number,
  payload: { score?: number; comment?: string },
) {
  const [project, sprint] = await Promise.all([
    prisma.project.findUniqueOrThrow({ where: { id: projectId } }),
    prisma.sprint.findUniqueOrThrow({ where: { id: sprintId } }),
  ]);

  if (sprint.project_id !== project.id) {
    throw new BadRequestError('This sprint does not belong to the given project!');
  }

  if (sprint.max_marks === null) {
    throw new BadRequestError('This sprint is not gradable yet! Set its total marks first.');
  }

  if (payload.score !== undefined) {
    assertScoreIsValid(payload.score, sprint.max_marks);
  }

  return prisma.$transaction(async (tx) => {
    const grade = await tx.grade.upsert({
      where: { project_id_sprint_id: { project_id: projectId, sprint_id: sprintId } },
      create: {
        project_id: projectId,
        sprint_id: sprintId,
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
      include: { sprint: true },
    });

    await tx.gradeAuditLog.create({
      data: {
        project_id: projectId,
        sprint_id: sprintId,
        action: GradeAuditAction.SPRINT_GRADE_UPSERTED,
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
    const existing = await tx.grade.findUniqueOrThrow({ where: { id: gradeId } });
    if (existing.score === null) {
      throw new BadRequestError('This grade cannot be published until it has been scored.');
    }

    const grade = await tx.grade.update({
      where: { id: gradeId },
      data: { status: GradeStatus.PUBLISHED },
    });

    await tx.gradeAuditLog.create({
      data: {
        project_id: grade.project_id,
        milestone_id: grade.milestone_id,
        sprint_id: grade.sprint_id,
        action:
          grade.sprint_id !== null
            ? GradeAuditAction.SPRINT_GRADE_PUBLISHED
            : GradeAuditAction.MILESTONE_GRADE_PUBLISHED,
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
        sprint_id: grade.sprint_id,
        action:
          grade.sprint_id !== null
            ? GradeAuditAction.SPRINT_GRADE_UNPUBLISHED
            : GradeAuditAction.MILESTONE_GRADE_UNPUBLISHED,
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

/*
      Assigns (or clears) the TA responsible for grading a project's sprint. Mirrors
      assignTaForMilestone, but keyed on sprint_id instead of milestone_id.
*/
async function assignTaForSprint(
  projectId: number,
  sprintId: number,
  assignedTaId: number | null,
  actorId: number | null,
) {
  return prisma.$transaction(async (tx) => {
    const grade = await tx.grade.upsert({
      where: { project_id_sprint_id: { project_id: projectId, sprint_id: sprintId } },
      create: {
        project_id: projectId,
        sprint_id: sprintId,
        grader_id: assignedTaId,
      },
      update: {
        grader_id: assignedTaId,
      },
    });

    await tx.gradeAuditLog.create({
      data: {
        project_id: projectId,
        sprint_id: sprintId,
        action: GradeAuditAction.SPRINT_TA_ASSIGNED,
        assigned_ta_id: assignedTaId,
        actor_id: actorId,
      },
    });

    return grade;
  });
}

/*
      Bulk-sets Sprint.max_marks for every sprint id given, across (potentially) many
      projects within one course. Mirrors milestone.service.update's max-marks branch,
      but as a course-scoped batch over Sprint rows instead of a single Milestone row.
*/
async function bulkSetSprintMaxMarks(
  courseId: number,
  sprintIds: number[],
  maxMarks: number,
  confirm: boolean,
  actorId: number | null,
): Promise<{ updatedCount: number }> {
  assertMaxMarksIsValid(maxMarks);

  const sprints = await prisma.sprint.findMany({
    where: { id: { in: sprintIds } },
    include: { project: { select: { id: true, course_id: true } } },
  });

  if (sprints.length !== sprintIds.length) {
    throw new BadRequestError('One or more sprints could not be found.');
  }

  const foreignSprints = sprints.filter((sprint) => sprint.project.course_id !== courseId);
  if (foreignSprints.length > 0) {
    throw new BadRequestError(
      `Sprint(s) ${foreignSprints.map((sprint) => sprint.id).join(', ')} do not belong to course ${courseId}.`,
    );
  }

  const [publishedCount, affectedGrades] = await Promise.all([
    prisma.grade.count({ where: { sprint_id: { in: sprintIds }, status: GradeStatus.PUBLISHED } }),
    prisma.grade.findMany({
      where: { sprint_id: { in: sprintIds }, ...HAS_GRADE_CONTENT },
      select: { project_id: true, sprint_id: true },
    }),
  ]);

  if (publishedCount > 0) {
    throw new BadRequestError(
      `${publishedCount} published grade(s) exist among the selected sprints. Unpublish them before changing total marks.`,
    );
  }

  if (affectedGrades.length > 0 && !confirm) {
    throw new ConflictError(
      `Changing total marks will reset the score and comment of ${affectedGrades.length} existing grade(s) across the selected sprints. Pass confirm=true to proceed anyway.`,
      { affectedGradeCount: affectedGrades.length },
    );
  }

  await prisma.$transaction(async (tx) => {
    if (affectedGrades.length > 0) {
      await tx.grade.updateMany({
        where: { sprint_id: { in: sprintIds }, ...HAS_GRADE_CONTENT },
        data: { score: null, comment: null },
      });

      await tx.gradeAuditLog.createMany({
        data: affectedGrades.map((grade) => ({
          project_id: grade.project_id,
          sprint_id: grade.sprint_id,
          action: GradeAuditAction.SPRINT_MAX_MARKS_UPDATED,
          score: null,
          comment: null,
          status: GradeStatus.DRAFT,
          actor_id: actorId,
        })),
      });
    }

    await tx.sprint.updateMany({ where: { id: { in: sprintIds } }, data: { max_marks: maxMarks } });
  });

  return { updatedCount: sprintIds.length };
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
  upsertSprintGrade,
  publishGrade,
  unpublishGrade,
  assignTaForMilestone,
  assignTaForSprint,
  bulkSetSprintMaxMarks,
  getGradeHistory,
};
