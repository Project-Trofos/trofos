import { UserSession } from '@prisma/client';
import { createRequest } from 'node-mocks-http';
import projectPolicy from '../../policies/project.policy';
import projectConstraint from '../../policies/constraints/project.constraint';
import { ApiKeyAuthIsValid } from '../../services/types/apiKey.service.types';

const spies = {
  canManageProject: jest.spyOn(projectConstraint, 'canManageProject'),
};

describe('project.policy tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('applyProjectPolicy', () => {
    it('should return a valid outcome if the user request has no parameters', async () => {
      const mockReq = createRequest();
      const userSessionObject = {
        user_id: 1,
      } as UserSession;
      const policyOutcome = await projectPolicy.applyProjectPolicy(mockReq, userSessionObject);
      expect(policyOutcome.isPolicyValid).toEqual(true);
      expect(policyOutcome.policyConstraint).not.toBeNull();
    });

    it('should return the policy outcome if the user request has the required parameters', async () => {
      const mockReq = createRequest();
      mockReq.params = {
        projectId: '1',
      };
      const userSessionObject = {
        user_id: 1,
      } as UserSession;
      spies.canManageProject.mockResolvedValue(true);
      const policyOutcome = await projectPolicy.applyProjectPolicy(mockReq, userSessionObject);
      expect(policyOutcome.isPolicyValid).toEqual(true);
      expect(policyOutcome.policyConstraint).not.toBeNull();
      expect(spies.canManageProject).toBeCalled();
    });
  });

  describe('applyProjectPolicyExternalApiCall', () => {
    it('should return a valid outcome if the user request has no parameters', async () => {
      const mockReq = createRequest();
      const apiKeyAuth = {
        user_id: 1,
      } as ApiKeyAuthIsValid;
      const policyOutcome = await projectPolicy.applyProjectPolicyExternalApiCall(mockReq, apiKeyAuth);
      expect(policyOutcome.isPolicyValid).toEqual(true);
      expect(policyOutcome.policyConstraint).not.toBeNull();
    });

    it('should return the policy outcome if the user request has the required parameters', async () => {
      const mockReq = createRequest();
      mockReq.params = {
        projectId: '1',
      };
      const apiKeyAuth = {
        user_id: 1,
      } as ApiKeyAuthIsValid;
      spies.canManageProject.mockResolvedValue(true);
      const policyOutcome = await projectPolicy.applyProjectPolicyExternalApiCall(mockReq, apiKeyAuth);
      expect(policyOutcome.isPolicyValid).toEqual(true);
      expect(policyOutcome.policyConstraint).not.toBeNull();
      expect(spies.canManageProject).toBeCalled();
    });
  });
});
