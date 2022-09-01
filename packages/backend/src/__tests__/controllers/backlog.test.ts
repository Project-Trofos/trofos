import StatusCodes from 'http-status-codes';
import { createRequest, createResponse } from 'node-mocks-http';
import { Backlog } from '@prisma/client';
import { PrismaClientValidationError } from '@prisma/client/runtime';
import backlogController from '../../controllers/backlog';
import backlogService from '../../services/backlog.service';
import { BacklogFields } from '../../services/types/backlog.service.types';

const spies = {
  createBacklog: jest.spyOn(backlogService, 'createBacklog'),
};

describe('backlogController tests', () => {
  const mockBacklog: BacklogFields = {
    assignee_id: 1,
    description: 'A test description here',
    points: 1,
    priority: 'very_high',
    project_id: 123,
    reporter_id: 1,
    summary: 'A Test Summary',
    sprint_id: 123,
    type: 'story',
  };

  const expectedBacklog: Backlog = {
    id: 1,
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
    body : mockBacklog,
  });

  const mockResponse = createResponse();

  test('newBacklog_validBacklog_ReturnsHTTP200AndBacklog', async () => {
    spies.createBacklog.mockResolvedValueOnce(expectedBacklog);

    await backlogController.newBacklog(mockRequest, mockResponse);
    expect(spies.createBacklog).toHaveBeenCalledWith(mockBacklog);
    expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
    // eslint-disable-next-line no-underscore-dangle
    expect(mockResponse._getData()).toEqual(JSON.stringify(expectedBacklog));
  });

  test('newBacklog_createBacklogThrowsError_ReturnsHTTP500', async () => {
    spies.createBacklog.mockRejectedValueOnce(new PrismaClientValidationError('Test error msg'));

    await backlogController.newBacklog(mockRequest, mockResponse);
    expect(spies.createBacklog).toHaveBeenCalledWith(mockBacklog);
    expect(mockResponse.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
  });
});
