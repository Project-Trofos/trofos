import { accessibleBy } from '@casl/prisma';
import { Milestone } from '@prisma/client';
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
): Promise<Milestone> {
  const result = await prisma.milestone.update({
    where: {
      id: milestoneId,
    },
    data: {
      start_date: milestoneStartDate,
      deadline: milestoneDeadline,
      name: milestoneName,
    },
  });

  return result;
}

async function remove(milestoneId: number): Promise<Milestone> {
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
