import StatusCodes from 'http-status-codes';
import apiKeyService from '../../services/apiKey.service';
import apiKey from '../../controllers/apiKey';
import { createRequest, createResponse } from 'node-mocks-http';

const spies = {
  apiKeyServiceGeneratesApiKey: jest.spyOn(apiKeyService, 'generateApiKey'),
  apiKeyServiceGetApiKeyRecordForUser: jest.spyOn(apiKeyService, 'getApiKeyRecordForUser'),
};

const sampleApiKey = {
  user_id: 123,
  api_key: '123456',
  id: 1,
  active: true,
  last_used: new Date(),
  created_at: new Date(),
};

afterEach(() => {
  jest.clearAllMocks();
})

describe('apiKey.controller tests', () => {
  describe('Generate Api key', () => {
    it('should return 200 and the generated api key', async () => {
      spies.apiKeyServiceGeneratesApiKey.mockResolvedValueOnce(sampleApiKey);
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockRes.locals.userSession = { user_id: 123 };  
      await apiKey.generateApiKey(mockReq, mockRes);
      expect(mockRes.statusCode).toBe(StatusCodes.OK);
      expect(JSON.stringify(mockRes._getJSONData())).toEqual(JSON.stringify(sampleApiKey));
    });

    it('should return 500 INTERNAL SERVER ERROR if error occurs during generation', async () => {
      const generateApiKeyError = new Error('Error generating api key');
      spies.apiKeyServiceGeneratesApiKey.mockRejectedValueOnce(generateApiKeyError);
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockRes.locals.userSession = { user_id: 123 };
      await apiKey.generateApiKey(mockReq, mockRes);
      expect(spies.apiKeyServiceGeneratesApiKey).toHaveBeenCalledTimes(1);
      expect(mockRes.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    });
  });

  describe('Get Api key record for user', () => {
    it('should return 200 and the api key record for the user', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockRes.locals.userSession = { user_id: 123 };
      spies.apiKeyServiceGetApiKeyRecordForUser.mockResolvedValueOnce(sampleApiKey);
      await apiKey.getApiKeyRecordForUser(mockReq, mockRes);
      expect(mockRes.statusCode).toBe(StatusCodes.OK);
      expect(JSON.stringify(mockRes._getJSONData())).toEqual(JSON.stringify(sampleApiKey));
    });

    it('should return 500 INTERNAL SERVER ERROR if error occurs during retrieval', async () => {
      const getApiKeyRecordError = new Error('Error getting api key record');
      spies.apiKeyServiceGetApiKeyRecordForUser.mockRejectedValueOnce(getApiKeyRecordError);
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockRes.locals.userSession = { user_id: 123 };
      await apiKey.getApiKeyRecordForUser(mockReq, mockRes);
      expect(spies.apiKeyServiceGetApiKeyRecordForUser).toHaveBeenCalledTimes(1);
      expect(mockRes.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    });

  });

});
