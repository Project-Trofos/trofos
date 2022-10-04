import StatusCodes from 'http-status-codes';
import { createRequest, createResponse } from 'node-mocks-http';
import { Backlog } from '@prisma/client';
import { PrismaClientValidationError } from '@prisma/client/runtime';
import backlogController from '../../controllers/backlog';
import backlogService from '../../services/backlog.service';
import { BacklogFields } from '../../helpers/types/backlog.service.types';

const backlogServiceSpies = {
  newBacklog: jest.spyOn(backlogService, 'newBacklog'),
  listBacklogs: jest.spyOn(backlogService, 'listBacklogs'),
};

describe('backlogController tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create backlog', () => {
    const mockBacklog: BacklogFields = {
      assigneeId: 1,
      description: 'A test description here',
      points: 1,
      priority: 'very_high',
      projectId: 123,
      reporterId: 1,
      summary: 'A Test Summary',
      sprintId: 123,
      type: 'story',
    };

    const expectedBacklog: Backlog = {
      backlog_id: 1,
      summary: 'A Test Summary',
      type: 'story',
      priority: 'very_high',
      sprint_id: 123,
      reporter_id: 1,
      assignee_id: 1,
      points: 1,
      description: 'A test description here',
      project_id: 123,
    };

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
        {
          backlog_id: 1,
          summary: 'A Test Summary',
          type: 'story',
          priority: 'very_high',
          sprint_id: 123,
          reporter_id: 1,
          assignee_id: 1,
          points: 1,
          description: 'A test description here',
          project_id: 123,
        },
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
        },
      ];
      backlogServiceSpies.listBacklogs.mockResolvedValueOnce(expectedBacklogs);

      await backlogController.listBacklogs(mockRequest, mockResponse);
      expect(backlogServiceSpies.listBacklogs).toHaveBeenCalledWith(mockProjectId.projectId);
      expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
      expect(mockResponse._getData()).toEqual(JSON.stringify(expectedBacklogs));
    });

    it('should throw an error and return status 500 when projectId is missing', async () => {
      const mockMissingProjectIdRequest = createRequest({
        body: {},
      });
      await backlogController.listBacklogs(mockMissingProjectIdRequest, mockResponse);
      expect(backlogServiceSpies.listBacklogs).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('should throw an error and return status 500 when backlogs failed to be retrieved', async () => {
      backlogServiceSpies.listBacklogs.mockRejectedValueOnce(new PrismaClientValidationError('Test error msg'));

      await backlogController.listBacklogs(mockRequest, mockResponse);
      expect(backlogServiceSpies.listBacklogs).toHaveBeenCalledWith(mockProjectId.projectId);
      expect(mockResponse.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    });
  });
});
