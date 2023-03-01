import { UserSession } from '@prisma/client';
import { createRequest } from 'node-mocks-http';
import feedbackPolicy from '../../policies/feedback.policy';
import feedbackConstraint from '../../policies/constraints/feedback.constraint';

const spies = {
  canManageFeedback: jest.spyOn(feedbackConstraint, 'canManageFeedback'),
};

describe('feedback.policy tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('applyCoursePolicy', () => {
    it('should return a valid outcome if the user request has no parameters', async () => {
      const mockReq = createRequest();
      const userSessionObject = {
        user_id: 1,
      } as UserSession;
      const policyOutcome = await feedbackPolicy.applyFeedbackPolicy(mockReq, userSessionObject);
      expect(policyOutcome.isPolicyValid).toEqual(true);
      expect(policyOutcome.policyConstraint).not.toBeNull();
    });

    it('should return the policy outcome if the user request has the required parameters', async () => {
      spies.canManageFeedback.mockResolvedValueOnce(true);
      const mockReq = createRequest();
      mockReq.params = {
        feedbackId: '1',
      };
      const userSessionObject = {
        user_id: 1,
      } as UserSession;
      const policyOutcome = await feedbackPolicy.applyFeedbackPolicy(mockReq, userSessionObject);
      expect(policyOutcome.isPolicyValid).toEqual(true);
      expect(policyOutcome.policyConstraint).not.toBeNull();
    });
  });
});
