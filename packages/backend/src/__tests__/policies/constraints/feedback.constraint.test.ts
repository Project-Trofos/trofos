import { Feedback } from '@prisma/client';
import { prismaMock } from '../../../models/mock/mockPrismaClient';
import feedbackConstraint from '../../../policies/constraints/feedback.constraint';

describe('feedback.constraint tests', () => {
  describe('canManageFeedback', () => {
    it('should return true if the user is an admin', async () => {
      await expect(feedbackConstraint.canManageFeedback(1, 1, true)).resolves.toEqual(true);
    });

    it('should return true if the user is associated with the feedback', async () => {
      const testFeedback = {} as Feedback;
      prismaMock.feedback.findMany.mockResolvedValueOnce([testFeedback]);
      await expect(feedbackConstraint.canManageFeedback(1, 1, false)).resolves.toEqual(true);
    });

    it('should return false if the user is not associated with the feedback', async () => {
      prismaMock.feedback.findMany.mockResolvedValueOnce([]);
      await expect(feedbackConstraint.canManageFeedback(1, 1, false)).resolves.toEqual(false);
    });
  });
});
