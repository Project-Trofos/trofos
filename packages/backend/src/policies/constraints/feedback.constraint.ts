import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility, accessibleBy } from '@casl/prisma';
import prisma from '../../models/prismaClient';
import { AppAbility } from '../policyTypes';

function feedbackPolicyConstraint(userId: number, isUserAdmin: boolean) {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);

  /*
        A user can only manage (CRUD) a feedback if:
        1) They have access to the course that the feedback's project is part of
        2) They are the admin
    */

  if (isUserAdmin) {
    can('manage', 'Feedback');
  } else {
    // Handles the case where we are checking a list of projects
    can('manage', 'Feedback', {
      sprint: {
        project: {
          course: {
            users: {
              some: {
                user_id: userId,
              },
            },
          },
        },
      },
    });
  }

  return build();
}

async function canManageFeedback(userId: number, feedbackId: number, isUserAdmin: boolean): Promise<boolean> {
  if (isUserAdmin) return true;

  // Returns at most one feedback
  const feedbacks = await prisma.feedback.findMany({
    where: {
      AND: [
        accessibleBy(feedbackPolicyConstraint(userId, isUserAdmin)).Feedback,
        {
          id: feedbackId,
        },
      ],
    },
  });

  return feedbacks.length === 1;
}

export default {
  feedbackPolicyConstraint,
  canManageFeedback,
};
