import { Prisma } from '@prisma/client';
import { prismaMock } from '../../models/mock/mockPrismaClient';
import apiKeyService from '../../services/apiKey.service';

describe('apiKey.service tests', () => {
  describe('generateApiKey', () => {
    it('should generate a new entry in the userApiKey table if one does not already exist', async () => {
      const mockUserApiKey = {
        user_id: 1,
        api_key: 'mockApiKey',
        created_at: new Date(),
        last_used: null,
        active: true,
      };
      prismaMock.$transaction.mockResolvedValueOnce(mockUserApiKey);
      await expect(apiKeyService.generateApiKey(1)).resolves.toEqual({
        ...mockUserApiKey,
        api_key: expect.any(String),
      });
    });
  });

  describe('getApiKeyRecordForUser', () => {
    it('should return the userApiKey record for the user if one exists', async () => {
      const mockUserApiKey = {
        id: 1,
        user_id: 1,
        api_key: 'mockApiKey',
        created_at: new Date(),
        last_used: null,
        active: true,
      };
      prismaMock.userApiKey.findFirst.mockResolvedValueOnce(mockUserApiKey);
      await expect(apiKeyService.getApiKeyRecordForUser(1)).resolves.toEqual(mockUserApiKey);
    });
  });

  describe('authenticateApiKey', () => {
    const notValidUserObj = {
      isValidUser: false,
    };
    it('should reject if no matching key is found', async () => {
      prismaMock.userApiKey.findFirst.mockResolvedValueOnce(null);
      await expect(apiKeyService.authenticateApiKey('mockApiKey')).resolves.toEqual(notValidUserObj);
    });
  });
});
