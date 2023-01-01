import { accessibleBy } from '@casl/prisma';
import { Announcement } from '@prisma/client';
import prisma from '../models/prismaClient';
import { AppAbility } from '../policies/policyTypes';

async function get(milestoneId: number): Promise<Announcement> {
  const result = await prisma.announcement.findUniqueOrThrow({
    where: {
      id: milestoneId,
    },
  });

  return result;
}

async function list(policyConstraint: AppAbility, courseId: number): Promise<Announcement[]> {
  const result = await prisma.announcement.findMany({
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

async function create(userId: number, courseId: number, title: string, content: string): Promise<Announcement> {
  const result = await prisma.announcement.create({
    data: {
      course_id: courseId,
      title,
      content,
      user_id: userId,
    },
  });

  return result;
}

async function update(
  milestoneId: number,
  payload: {
    title?: string;
    content?: string;
  },
): Promise<Announcement> {
  const result = await prisma.announcement.update({
    where: {
      id: milestoneId,
    },
    data: {
      ...payload,
      updated_at: new Date(),
    },
  });

  return result;
}

async function remove(announcementId: number): Promise<Announcement> {
  const result = await prisma.announcement.delete({
    where: {
      id: announcementId,
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
