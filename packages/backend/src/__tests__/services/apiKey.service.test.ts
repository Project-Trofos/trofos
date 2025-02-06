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

  describe('authenticateApiKeyWithinTransaction', () => {
    it('should return false if no API key is found', async () => {
      prismaMock.userApiKey.findFirst.mockResolvedValueOnce(null);

      const result = await apiKeyService.authenticateApiKeyWithinTransaction(prismaMock, 'test');
      expect(result.isValidUser).toBe(false);
      expect(prismaMock.userApiKey.findFirst).toBeCalledTimes(1);
    });

    const mockUserApiKey = {
      id: 1,
      user_id: 1,
      api_key: 'mockApiKey',
      created_at: new Date(),
      last_used: null,
      active: true,
    };

    it('should return false if the API key is not active', async () => {
      prismaMock.userApiKey.findFirst.mockResolvedValueOnce({
        ...mockUserApiKey,
        active: false,
      });
      const result = await apiKeyService.authenticateApiKeyWithinTransaction(prismaMock, 'test');
      expect(result.isValidUser).toBe(false);
      expect(prismaMock.userApiKey.findFirst).toBeCalledTimes(1);
    });

    it('should return false if no role is associated with the user_id of the API key', async () => {
      prismaMock.userApiKey.findFirst.mockResolvedValueOnce(mockUserApiKey);
      prismaMock.usersOnRoles.findFirst.mockResolvedValueOnce(null);
      const result = await apiKeyService.authenticateApiKeyWithinTransaction(prismaMock, 'test');
      expect(result.isValidUser).toBe(false);
      expect(prismaMock.userApiKey.findFirst).toBeCalledTimes(1);
      expect(prismaMock.usersOnRoles.findFirst).toBeCalledTimes(1);
    });

    const mockUserOnRole = {
      user_id: 1,
      role_id: 1,
    };

    it('should return false if no user_id is associated with the API key', async () => {
      prismaMock.userApiKey.findFirst.mockResolvedValueOnce(mockUserApiKey);
      prismaMock.usersOnRoles.findFirst.mockResolvedValueOnce(mockUserOnRole);
      prismaMock.user.findUnique.mockResolvedValueOnce(null);
      const result = await apiKeyService.authenticateApiKeyWithinTransaction(prismaMock, 'test');
      expect(result.isValidUser).toBe(false);
      expect(prismaMock.userApiKey.findFirst).toBeCalledTimes(1);
      expect(prismaMock.usersOnRoles.findFirst).toBeCalledTimes(1);
      expect(prismaMock.user.findUnique).toBeCalledTimes(1);
    });

    const mockUser = {
      user_id: 1,
      user_email: 'test',
      user_display_name: 'test',
      user_password_hash: 'test',
      has_completed_tour: false,
    };

    it('should return api key auth info and update last_used if the API key is valid', async () => {
      prismaMock.userApiKey.findFirst.mockResolvedValueOnce(mockUserApiKey);
      prismaMock.usersOnRoles.findFirst.mockResolvedValueOnce(mockUserOnRole);
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser);
      prismaMock.userApiKey.update.mockResolvedValueOnce(mockUserApiKey);

      await expect(apiKeyService.authenticateApiKeyWithinTransaction(prismaMock, 'test')).resolves.toEqual({
        isValidUser: true,
        user_id: 1,
        role_id: 1,
        user_is_admin: false,
        user_email: 'test',
      });
      expect(prismaMock.userApiKey.findFirst).toBeCalledTimes(1);
      expect(prismaMock.usersOnRoles.findFirst).toBeCalledTimes(1);
      expect(prismaMock.user.findUnique).toBeCalledTimes(1);
      expect(prismaMock.userApiKey.update).toBeCalledTimes(1);
    });
  });
});
