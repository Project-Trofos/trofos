import StatusCodes from 'http-status-codes';
import { createRequest, createResponse } from 'node-mocks-http';
import { Settings } from '@prisma/client';
import settingsService from '../../services/settings.service';
import settings from '../../controllers/settings';

const spies = {
  settingsServiceGet: jest.spyOn(settingsService, 'get'),
  settingsServiceUpdate: jest.spyOn(settingsService, 'update'),
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('settings.controller tests', () => {
  describe('get', () => {
    it('should return status 500 INTERNAL SERVICE ERROR if an error occured during the query', async () => {
      const settingsServiceError = new Error('Something went wrong while querying settings');
      spies.settingsServiceGet.mockRejectedValueOnce(settingsServiceError);
      const mockReq = createRequest();
      const mockRes = createResponse();
      await settings.getSettings(mockReq, mockRes);
      expect(mockRes.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('should return the application settings if the query was successful', async () => {
      const settingsObject: Settings = {
        id: 1,
        current_sem: 1,
        current_year: 2022,
      };
      spies.settingsServiceGet.mockResolvedValueOnce(settingsObject);
      const mockReq = createRequest();
      const mockRes = createResponse();
      await settings.getSettings(mockReq, mockRes);
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getJSONData()).toEqual(settingsObject);
    });
  });

  describe('update', () => {
    it('should return status 500 INTERNAL SERVICE ERROR if an error occured during the query', async () => {
      const settingsServiceError = new Error('Something went wrong while querying settings');
      spies.settingsServiceUpdate.mockRejectedValueOnce(settingsServiceError);
      const mockReq = createRequest();
      const mockRes = createResponse();
      await settings.updateSettings(mockReq, mockRes);
      expect(mockRes.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('should return the application settings if the query was successful', async () => {
      const settingsObject: Settings = {
        id: 1,
        current_sem: 1,
        current_year: 2022,
      };
      spies.settingsServiceUpdate.mockResolvedValueOnce(settingsObject);
      const mockReq = createRequest();
      const mockRes = createResponse();
      await settings.updateSettings(mockReq, mockRes);
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getJSONData()).toEqual(settingsObject);
    });
  });
});
