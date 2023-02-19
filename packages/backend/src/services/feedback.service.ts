import { accessibleBy } from '@casl/prisma';
import prisma from '../models/prismaClient';
import { AppAbility } from '../policies/policyTypes';

async function create(payload: { sprintId: number; userId: number; content: string }) {
  const { content, sprintId, userId } = payload;
  const feedback = prisma.feedback.create({
    data: {
      sprint: {
        connect: {
          id: sprintId,
        },
      },
      user: {
        connect: {
          user_id: userId,
        },
      },
      content,
    },
  });

  return feedback;
}

async function list(policyConstraint: AppAbility) {
  const feedbacks = prisma.feedback.findMany({
    where: {
      AND: [accessibleBy(policyConstraint).Feedback],
    },
    orderBy: {
      created_at: 'asc',
    },
    include: {
      user: {
        select: {
          user_display_name: true,
          user_email: true,
        },
      },
    },
  });
  return feedbacks;
}

async function listBySprintId(sprintId: number) {
  const feedbacks = prisma.feedback.findMany({
    where: {
      sprint: {
        id: sprintId,
      },
    },
    orderBy: {
      created_at: 'asc',
    },
    include: {
      user: {
        select: {
          user_display_name: true,
          user_email: true,
        },
      },
    },
  });
  return feedbacks;
}

async function update(feedbackId: number, payload: { content: string }) {
  const { content } = payload;
  const feedback = prisma.feedback.update({
    where: {
      id: feedbackId,
    },
    data: {
      content,
      updated_at: new Date(),
    },
  });

  return feedback;
}

async function remove(feedbackId: number) {
  const feedback = prisma.feedback.delete({
    where: {
      id: feedbackId,
    },
  });

  return feedback;
}

export default {
  create,
  list,
  listBySprintId,
  update,
  remove,
};
