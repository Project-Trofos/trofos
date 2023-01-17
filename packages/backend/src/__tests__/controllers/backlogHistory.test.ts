import StatusCodes from 'http-status-codes';
import { createRequest, createResponse } from 'node-mocks-http';
import backlogHistoryService from '../../services/backlogHistory.service';
import backlogHistoryController from '../../controllers/backlogHistory';
import { backlogHistoryData } from '../mocks/backlogHistoryData';

const spies = {
  getProjectBacklogHistory: jest.spyOn(backlogHistoryService, 'getProjectBacklogHistory'),
  getSprintBacklogHistory: jest.spyOn(backlogHistoryService, 'getSprintBacklogHistory'),
};

describe('backlogHistory controller tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProjectBacklogHistory', () => {
    it('should return correct backlog history', async () => {
      spies.getProjectBacklogHistory.mockResolvedValueOnce(backlogHistoryData);
      const mockReq = createRequest({
        params: {
          projectId: backlogHistoryData[0].project_id,
        },
      });
      const mockRes = createResponse();

      await backlogHistoryController.getProjectBacklogHistory(mockReq, mockRes);

      expect(spies.getProjectBacklogHistory).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(backlogHistoryData));
    });

    it('should throw error if projectId is missing', async () => {
      spies.getProjectBacklogHistory.mockResolvedValueOnce(backlogHistoryData);
      const mockReq = createRequest();
      const mockRes = createResponse();

      await backlogHistoryController.getProjectBacklogHistory(mockReq, mockRes);

      expect(spies.getProjectBacklogHistory).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('getSprintBacklogHistory', () => {
    it('should return correct backlog history', async () => {
      spies.getSprintBacklogHistory.mockResolvedValueOnce(backlogHistoryData);
      const mockReq = createRequest({
        params: {
          sprintId: backlogHistoryData[0].sprint_id,
        },
      });
      const mockRes = createResponse();

      await backlogHistoryController.getSprintBacklogHistory(mockReq, mockRes);

      expect(spies.getSprintBacklogHistory).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(backlogHistoryData));
    });

    it('should throw error if sprintId is missing', async () => {
      spies.getSprintBacklogHistory.mockResolvedValueOnce(backlogHistoryData);
      const mockReq = createRequest();
      const mockRes = createResponse();

      await backlogHistoryController.getSprintBacklogHistory(mockReq, mockRes);

      expect(spies.getSprintBacklogHistory).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });
});
