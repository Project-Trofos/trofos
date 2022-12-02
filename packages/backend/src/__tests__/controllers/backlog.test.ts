import StatusCodes from 'http-status-codes';
import { createRequest, createResponse } from 'node-mocks-http';
import { Backlog } from '@prisma/client';
import { PrismaClientValidationError } from '@prisma/client/runtime';
import backlogController from '../../controllers/backlog';
import backlogService from '../../services/backlog.service';
import { BacklogFields } from '../../helpers/types/backlog.service.types';
import { mockBacklogData, mockBacklogFields } from '../mocks/backlogData';

const backlogServiceSpies = {
  newBacklog: jest.spyOn(backlogService, 'newBacklog'),
  listBacklogs: jest.spyOn(backlogService, 'listBacklogs'),
  getBacklog: jest.spyOn(backlogService, 'getBacklog'),
  updateBacklog: jest.spyOn(backlogService, 'updateBacklog'),
  deleteBacklog: jest.spyOn(backlogService, 'deleteBacklog'),
};

describe('backlogController tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create backlog', () => {
    const mockBacklog: BacklogFields = mockBacklogFields;

    const expectedBacklog: Backlog = mockBacklogData;

    const mockRequest = createRequest({
      body: mockBacklog,
    });

    const mockResponse = createResponse();

    it('should return new backlog and status 200 when new backlog is successfully created', async () => {
      backlogServiceSpies.newBacklog.mockResolvedValueOnce(expectedBacklog);

      await backlogController.newBacklog(mockRequest, mockResponse);
      expect(backlogServiceSpies.newBacklog).toHaveBeenCalledWith(mockBacklog);
      expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
      expect(mockResponse._getData()).toEqual(JSON.stringify(expectedBacklog));
    });

    it('should throw an error and return status 500 when new backlog failed to be created', async () => {
      backlogServiceSpies.newBacklog.mockRejectedValueOnce(new PrismaClientValidationError('Test error msg'));

      await backlogController.newBacklog(mockRequest, mockResponse);
      expect(backlogServiceSpies.newBacklog).toHaveBeenCalledWith(mockBacklog);
      expect(mockResponse.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    });
  });

  describe('list backlogs', () => {
    const mockProjectId = {
      projectId: 123,
    };

    const mockRequest = createRequest({
      params: mockProjectId,
    });

    const mockResponse = createResponse();

    it('should return array of backlogs and status 200 when called with valid projectId', async () => {
      const expectedBacklogs: Backlog[] = [
        mockBacklogData,
        {
          backlog_id: 2,
          summary: 'Another Test Summary',
          type: 'task',
          priority: 'high',
          sprint_id: 123,
          reporter_id: 1,
          assignee_id: 2,
          points: 1,
          description: 'Another test description here',
          project_id: 123,
          status: 'todo',
        },
      ];
      backlogServiceSpies.listBacklogs.mockResolvedValueOnce(expectedBacklogs);

      await backlogController.listBacklogs(mockRequest, mockResponse);
      expect(backlogServiceSpies.listBacklogs).toHaveBeenCalledWith(mockProjectId.projectId, false);
      expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
      expect(mockResponse._getData()).toEqual(JSON.stringify(expectedBacklogs));
    });

    it('should call listBacklogs with true param and return status 200 when called with valid projectId', async () => {
      const mockRequestForUnassignedBacklogs = createRequest({
        params: mockProjectId,
        originalUrl: '/listUnassignedBacklogs/123',
      });

      const expectedBacklogs: Backlog[] = [
        {
          ...mockBacklogData,
          sprint_id: null,
        },
      ];

      backlogServiceSpies.listBacklogs.mockResolvedValueOnce(expectedBacklogs);

      await backlogController.listBacklogs(mockRequestForUnassignedBacklogs, mockResponse);
      expect(backlogServiceSpies.listBacklogs).toHaveBeenCalledWith(mockProjectId.projectId, true);
      expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
    });

    it('should throw an error and return status 400 when projectId is missing', async () => {
      const mockMissingProjectIdRequest = createRequest({
        body: {},
      });
      await backlogController.listBacklogs(mockMissingProjectIdRequest, mockResponse);
      expect(backlogServiceSpies.listBacklogs).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });

    it('should throw an error and return status 500 when backlogs failed to be retrieved', async () => {
      backlogServiceSpies.listBacklogs.mockRejectedValueOnce(new PrismaClientValidationError('Test error msg'));

      await backlogController.listBacklogs(mockRequest, mockResponse);
      expect(backlogServiceSpies.listBacklogs).toHaveBeenCalledWith(mockProjectId.projectId, false);
      expect(mockResponse.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    });
  });

  describe('get single backlog', () => {
    const mockBacklogToRetrieve = {
      projectId: 123,
      backlogId: 1,
    };

    const mockRequest = createRequest({
      params: mockBacklogToRetrieve,
    });

    const mockResponse = createResponse();

    it('should return single backlog and status 200 when called with valid fields', async () => {
      const expectedBacklog: Backlog = mockBacklogData;
      backlogServiceSpies.getBacklog.mockResolvedValueOnce(expectedBacklog);

      await backlogController.getBacklog(mockRequest, mockResponse);
      expect(backlogServiceSpies.getBacklog).toHaveBeenCalledWith(
        mockBacklogToRetrieve.projectId,
        mockBacklogToRetrieve.backlogId,
      );
      expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
      expect(mockResponse._getData()).toEqual(JSON.stringify(expectedBacklog));
    });

    it('should throw an error and return status 400 when projectId is missing', async () => {
      const mockMissingProjectIdRequest = createRequest({
        params: {
          ...mockBacklogToRetrieve,
          projectId: undefined,
        },
      });
      await backlogController.getBacklog(mockMissingProjectIdRequest, mockResponse);
      expect(backlogServiceSpies.getBacklog).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });

    it('should throw an error and return status 400 when backlogId is missing', async () => {
      const mockMissingBacklogIdRequest = createRequest({
        body: {
          ...mockBacklogToRetrieve,
          backlogId: undefined,
        },
      });
      await backlogController.getBacklog(mockMissingBacklogIdRequest, mockResponse);
      expect(backlogServiceSpies.getBacklog).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });

    it('should throw an error and return status 500 when backlog failed to be retrieved', async () => {
      backlogServiceSpies.getBacklog.mockRejectedValueOnce(new PrismaClientValidationError('Test error msg'));

      await backlogController.getBacklog(mockRequest, mockResponse);
      expect(backlogServiceSpies.getBacklog).toHaveBeenCalledWith(
        mockBacklogToRetrieve.projectId,
        mockBacklogToRetrieve.backlogId,
      );
      expect(mockResponse.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('should throw an error and return status 404 when backlog does not exist', async () => {
      backlogServiceSpies.getBacklog.mockResolvedValueOnce(null);

      await backlogController.getBacklog(mockRequest, mockResponse);
      expect(backlogServiceSpies.getBacklog).toHaveBeenCalledWith(
        mockBacklogToRetrieve.projectId,
        mockBacklogToRetrieve.backlogId,
      );
      expect(mockResponse.statusCode).toEqual(StatusCodes.NOT_FOUND);
    });
  });

  describe('update backlog', () => {
    const mockBacklogToUpdate = {
      projectId: 123,
      backlogId: 1,
      fieldToUpdate: {
        summary: 'Updated Summary',
      },
    };

    const mockRequest = createRequest({
      body: mockBacklogToUpdate,
    });

    const mockResponse = createResponse();

    it('should return updated backlog and status 200 when called with valid fields', async () => {
      const expectedBacklog: Backlog = {
        ...mockBacklogData,
        summary: 'Updated Summary',
      };
      backlogServiceSpies.updateBacklog.mockResolvedValueOnce(expectedBacklog);

      await backlogController.updateBacklog(mockRequest, mockResponse);
      expect(backlogServiceSpies.updateBacklog).toHaveBeenCalledWith(mockBacklogToUpdate);
      expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
      expect(mockResponse._getData()).toEqual(JSON.stringify(expectedBacklog));
    });

    it('should throw an error and return status 400 when projectId is missing', async () => {
      const mockMissingProjectIdRequest = createRequest({
        body: {
          ...mockBacklogToUpdate,
          projectId: undefined,
        },
      });
      await backlogController.updateBacklog(mockMissingProjectIdRequest, mockResponse);
      expect(backlogServiceSpies.updateBacklog).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });

    it('should throw an error and return status 400 when backlogId is missing', async () => {
      const mockMissingBacklogIdRequest = createRequest({
        body: {
          ...mockBacklogToUpdate,
          backlogId: undefined,
        },
      });
      await backlogController.updateBacklog(mockMissingBacklogIdRequest, mockResponse);
      expect(backlogServiceSpies.updateBacklog).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });

    it('should throw an error and return status 500 when backlog failed to update', async () => {
      backlogServiceSpies.updateBacklog.mockRejectedValueOnce(new PrismaClientValidationError('Test error msg'));

      await backlogController.updateBacklog(mockRequest, mockResponse);
      expect(backlogServiceSpies.updateBacklog).toHaveBeenCalledWith(mockBacklogToUpdate);
      expect(mockResponse.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    });
  });

  describe('delete backlog', () => {
    const mockBacklogToDelete = {
      projectId: 123,
      backlogId: 1,
    };

    const mockRequest = createRequest({
      params: mockBacklogToDelete,
    });

    const mockResponse = createResponse();

    it('should return backlog and status 200 when called with valid fields', async () => {
      const expectedBacklog: Backlog = mockBacklogData;
      backlogServiceSpies.deleteBacklog.mockResolvedValueOnce(expectedBacklog);

      await backlogController.deleteBacklog(mockRequest, mockResponse);
      expect(backlogServiceSpies.deleteBacklog).toHaveBeenCalledWith(
        mockBacklogToDelete.projectId,
        mockBacklogToDelete.backlogId,
      );
      expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
      expect(mockResponse._getData()).toEqual(JSON.stringify(expectedBacklog));
    });

    it('should throw an error and return status 400 when projectId is missing', async () => {
      const mockMissingProjectIdRequest = createRequest({
        params: {
          ...mockBacklogToDelete,
          projectId: undefined,
        },
      });
      await backlogController.deleteBacklog(mockMissingProjectIdRequest, mockResponse);
      expect(backlogServiceSpies.deleteBacklog).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });

    it('should throw an error and return status 400 when backlogId is missing', async () => {
      const mockMissingBacklogIdRequest = createRequest({
        body: {
          ...mockBacklogToDelete,
          backlogId: undefined,
        },
      });
      await backlogController.deleteBacklog(mockMissingBacklogIdRequest, mockResponse);
      expect(backlogServiceSpies.deleteBacklog).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });

    it('should throw an error and return status 500 when backlog failed to be deleted', async () => {
      backlogServiceSpies.deleteBacklog.mockRejectedValueOnce(new PrismaClientValidationError('Test error msg'));

      await backlogController.deleteBacklog(mockRequest, mockResponse);
      expect(backlogServiceSpies.deleteBacklog).toHaveBeenCalledWith(
        mockBacklogToDelete.projectId,
        mockBacklogToDelete.backlogId,
      );
      expect(mockResponse.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    });
  });
});
