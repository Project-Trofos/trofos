import { UserSession } from '@prisma/client';
import { createRequest } from 'node-mocks-http';
import userConstraint from '../../policies/constraints/user.constraint';
import userPolicy from '../../policies/user.policy';

const spies = {
  canManageUser: jest.spyOn(userConstraint, 'canManageUser'),
};

describe('user.policy tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('applyUserPolicy', () => {
    it('should return a valid outcome if the user request has no parameters', async () => {
      const mockReq = createRequest();
      const userSessionObject = {
        user_id: 1,
      } as UserSession;
      const policyOutcome = await userPolicy.applyUserPolicy(mockReq, userSessionObject);
      expect(policyOutcome.isPolicyValid).toEqual(true);
      expect(policyOutcome.policyConstraint).not.toBeNull();
    });

    it('should return the policy outcome if the user request has the required parameters', async () => {
      const mockReq = createRequest();
      mockReq.body = {
        userId: '1',
      };
      const userSessionObject = {
        user_id: 1,
      } as UserSession;
      spies.canManageUser.mockResolvedValueOnce(true);
      const policyOutcome = await userPolicy.applyUserPolicy(mockReq, userSessionObject);
      expect(policyOutcome.isPolicyValid).toEqual(true);
      expect(policyOutcome.policyConstraint).not.toBeNull();
      expect(spies.canManageUser).toBeCalled();
    });
  });
});
