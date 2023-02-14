import { prismaMock } from '../../models/mock/mockPrismaClient';
import projectConstraint from '../../policies/constraints/project.constraint';
import feedbackService from '../../services/feedback.service';
import { mockFeedbackData } from '../mocks/feedbackData';

describe('feedback.service tests', () => {
  const policyConstraint = projectConstraint.projectPolicyConstraint(1, true);

  describe('create feedback', () => {
    it('should create and return feedback', async () => {
      const returnedFeedback = mockFeedbackData[0];
      prismaMock.feedback.create.mockResolvedValueOnce(returnedFeedback);
      await expect(
        feedbackService.create({
          content: returnedFeedback.content,
          sprintId: returnedFeedback.sprint_id,
          userId: returnedFeedback.user_id,
        }),
      ).resolves.toEqual(returnedFeedback);
    });
  });

  describe('get feedbacks', () => {
    it('should return all feedbacks', async () => {
      const returnedFeedbacks = mockFeedbackData;
      prismaMock.feedback.findMany.mockResolvedValueOnce(returnedFeedbacks);
      await expect(feedbackService.list(policyConstraint)).resolves.toEqual(returnedFeedbacks);
    });
  });

  describe('update feedback', () => {
    it('should update and return feedback', async () => {
      const feedbackToUpdate = mockFeedbackData[0];
      const returnedFeedback = {
        ...feedbackToUpdate,
        content: 'An updated feedback',
        updated_at: new Date(Date.now()),
      };
      prismaMock.feedback.update.mockResolvedValueOnce(returnedFeedback);
      await expect(feedbackService.update(feedbackToUpdate.id, { content: returnedFeedback.content })).resolves.toEqual(
        returnedFeedback,
      );
    });
  });

  describe('delete feedback', () => {
    it('should return feedback that got deleted', async () => {
      const returnedFeedback = mockFeedbackData[0];
      prismaMock.feedback.delete.mockResolvedValueOnce(returnedFeedback);
      await expect(feedbackService.remove(returnedFeedback.id)).resolves.toEqual(returnedFeedback);
    });
  });
});
