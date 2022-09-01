import express from 'express';
import StatusCodes from 'http-status-codes';
import { mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { PrismaClientValidationError } from '@prisma/client/runtime';
import backlogController from '../../controllers/backlog';
import backlogService from '../../services/backlog.service';
import { BacklogFields } from '../../services/types/backlog.service.types';

const backlogServiceCreateBacklogSpy = jest.spyOn(backlogService, 'createBacklog');
const prismaMock = mockDeep<PrismaClient>();

describe('backlogController tests', () => {
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

  const mockRequest = {
    body : mockBacklog,
  } as express.Request;

  const mockResponse = {
    send() {},
    status(s : number) {this.statusCode = s; return this;},
  } as express.Response;

  test('newBacklog_validBacklog_ReturnsHTTP200', async () => {
    backlogServiceCreateBacklogSpy.mockResolvedValueOnce(true);

    await backlogController.newBacklog(mockRequest, mockResponse, prismaMock);
    expect(backlogServiceCreateBacklogSpy).toHaveBeenCalledWith(mockBacklog, prismaMock);
    expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
  });

  test('newBacklog_FailedToCreateBacklog_ReturnsHTTP500', async () => {
    backlogServiceCreateBacklogSpy.mockResolvedValueOnce(false);

    await backlogController.newBacklog(mockRequest, mockResponse, prismaMock);
    expect(backlogServiceCreateBacklogSpy).toHaveBeenCalledWith(mockBacklog, prismaMock);
    expect(mockResponse.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
  });

  test('newBacklog_createBacklogThrowsError_ReturnsHTTP500', async () => {
    backlogServiceCreateBacklogSpy.mockRejectedValueOnce(new PrismaClientValidationError('Test error msg'));
		
    await backlogController.newBacklog(mockRequest, mockResponse, prismaMock);
    expect(backlogServiceCreateBacklogSpy).toHaveBeenCalledWith(mockBacklog, prismaMock);
    expect(mockResponse.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
  });
});
