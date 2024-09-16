import { createRequest } from 'node-mocks-http';
import { UserSession } from '@prisma/client';
import policyEngine from '../../policies/policyEngine';
import { ApiKeyAuthIsValid } from '../../services/types/apiKey.service.types';

describe('policyEngine tests', () => {
  describe('execute', () => {
    it('should throw an error if there is no such policy name', async () => {
      const mockReq = createRequest();
      const userSessionObject = {} as UserSession;
      await expect(policyEngine.execute(mockReq, userSessionObject, 'UNKNOWN_POLICY')).rejects.toThrow(
        'commandMap[policyName] is not a function',
      );
    });
  });

  describe('executeExternalApiCall', () => {
    it('should throw an error if there is no such policy name', async () => {
      const mockReq = createRequest();
      const apiKeyAuth = {} as ApiKeyAuthIsValid;
      await expect(policyEngine.executeExternalApiCall(mockReq, apiKeyAuth, 'UNKNOWN_POLICY')).rejects.toThrow(
        'commandMapExternalApiCall[policyName] is not a function',
      );
    });

    it('should return valid outcome if no policy names', async () => {
      const mockReq = createRequest();
      const apiKeyAuth = {} as ApiKeyAuthIsValid;
      const policyOutcome = await policyEngine.executeExternalApiCall(mockReq, apiKeyAuth, null);
      expect(policyOutcome.isPolicyValid).toEqual(true);
    });
  });
});
