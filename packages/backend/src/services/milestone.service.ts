import { accessibleBy } from '@casl/prisma';
import { GradeAuditAction, GradeStatus, Milestone } from '@prisma/client';
import { assertDateIsBefore } from '../helpers/error/assertions';
import { BadRequestError, ConflictError } from '../helpers/error';
import prisma from '../models/prismaClient';
import { AppAbility } from '../policies/policyTypes';

async function get(milestoneId: number): Promise<Milestone> {
  const result = await prisma.milestone.findUniqueOrThrow({
    where: {
      id: milestoneId,
    },
  });

  return result;
}

async function list(policyConstraint: AppAbility, courseId: number): Promise<Milestone[]> {
  const result = await prisma.milestone.findMany({
    where: {
      AND: [
        // User who has access of course will have access of all the milestones in that course
        accessibleBy(policyConstraint).Course,
        {
          course_id: courseId,
        },
      ],
    },
  });

  return result;
}

async function create(
  courseId: number,
  milestoneStartDate: Date,
  milestoneDeadline: Date,
  milestoneName: string,
): Promise<Milestone> {
  const result = await prisma.milestone.create({
    data: {
      course_id: courseId,
      start_date: milestoneStartDate,
      deadline: milestoneDeadline,
      name: milestoneName,
    },
  });

  return result;
}

async function update(
  milestoneId: number,
  milestoneStartDate?: Date,
  milestoneDeadline?: Date,
  milestoneName?: string,
  milestoneMaxMarks?: number,
  confirm = false,
  actorId: number | null = null,
): Promise<Milestone> {
  const current = await prisma.milestone.findUniqueOrThrow({
    where: {
      id: milestoneId,
    },
  });

  // Check if updated dates are valid (start date before deadline)
  const startDate = milestoneStartDate ?? current.start_date;
  const deadline = milestoneDeadline ?? current.deadline;
  assertDateIsBefore(startDate, deadline);

  const isMaxMarksChanging = milestoneMaxMarks !== undefined && milestoneMaxMarks !== current.max_marks;

  // Changing the scale that grades are scored against invalidates every existing score/comment
  // for this milestone, so they're wiped rather than left silently out of range. This can never
  // happen once any grade has been published — unpublish first.
  if (isMaxMarksChanging) {
    const [publishedCount, affectedGrades] = await Promise.all([
      prisma.grade.count({ where: { milestone_id: milestoneId, status: GradeStatus.PUBLISHED } }),
      prisma.grade.findMany({ where: { milestone_id: milestoneId }, select: { project_id: true, id: true } }),
    ]);

    if (publishedCount > 0) {
      throw new BadRequestError(
        `This milestone has ${publishedCount} published grade(s). Unpublish them before changing the total marks.`,
      );
    }

    if (affectedGrades.length > 0 && !confirm) {
      throw new ConflictError(
        `Changing the total marks will reset the score and comment of ${affectedGrades.length} existing grade(s) for this milestone. Pass confirm=true to proceed anyway.`,
        { affectedGradeCount: affectedGrades.length },
      );
    }

    return prisma.$transaction(async (tx) => {
      if (affectedGrades.length > 0) {
        await tx.grade.updateMany({
          where: { milestone_id: milestoneId },
          data: { score: null, comment: null },
        });

        await tx.gradeAuditLog.createMany({
          data: affectedGrades.map((grade) => ({
            project_id: grade.project_id,
            milestone_id: milestoneId,
            action: GradeAuditAction.MILESTONE_MAX_MARKS_UPDATED,
            score: null,
            comment: null,
            status: GradeStatus.DRAFT,
            actor_id: actorId,
          })),
        });
      }

      return tx.milestone.update({
        where: { id: milestoneId },
        data: {
          start_date: milestoneStartDate,
          deadline: milestoneDeadline,
          name: milestoneName,
          max_marks: milestoneMaxMarks,
        },
      });
    });
  }

  const result = await prisma.milestone.update({
    where: {
      id: milestoneId,
    },
    data: {
      start_date: milestoneStartDate,
      deadline: milestoneDeadline,
      name: milestoneName,
      max_marks: milestoneMaxMarks,
    },
  });

  return result;
}

async function remove(milestoneId: number, confirm = false): Promise<Milestone> {
  const [gradeCount, publishedGradeCount] = await Promise.all([
    prisma.grade.count({ where: { milestone_id: milestoneId } }),
    prisma.grade.count({ where: { milestone_id: milestoneId, status: GradeStatus.PUBLISHED } }),
  ]);

  if (gradeCount > 0 && !confirm) {
    throw new ConflictError(
      `This milestone has ${gradeCount} grade(s) (${publishedGradeCount} published) that will be permanently deleted. Pass confirm=true to proceed anyway.`,
      { gradeCount, publishedGradeCount },
    );
  }

  const result = await prisma.milestone.delete({
    where: {
      id: milestoneId,
    },
  });

  return result;
}

export default {
  get,
  list,
  create,
  update,
  remove,
};
