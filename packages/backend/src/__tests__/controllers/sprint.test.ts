import StatusCodes from 'http-status-codes';
import { createRequest, createResponse } from 'node-mocks-http';
import { Sprint } from '@prisma/client';
import { PrismaClientValidationError } from '@prisma/client/runtime';
import sprintController from '../../controllers/sprint';
import sprintService from '../../services/sprint.service';
import { SprintFields } from '../../helpers/types/sprint.service.types';
import { mockSprintData, mockSprintFields, mockSprintToUpdate } from '../mocks/sprintData';

const sprintServiceSpies = {
  newSprint: jest.spyOn(sprintService, 'newSprint'),
  listSprints: jest.spyOn(sprintService, 'listSprints'),
  updateSprint: jest.spyOn(sprintService, 'updateSprint'),
  deleteSprint: jest.spyOn(sprintService, 'deleteSprint'),
};

describe('sprintController tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create sprint', () => {
    const mockRequest = createRequest({
      body: mockSprintFields,
    });

    const mockResponse = createResponse();

    it('should return new sprint and status 200 when new sprint is successfully created', async () => {
      const expectedSprint: Sprint = mockSprintData;
      sprintServiceSpies.newSprint.mockResolvedValueOnce(expectedSprint);

      await sprintController.newSprint(mockRequest, mockResponse);
      expect(sprintServiceSpies.newSprint).toHaveBeenCalledWith(mockSprintFields);
      expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
      expect(mockResponse._getData()).toEqual(JSON.stringify(expectedSprint));
    });

    it('should throw an error and return status 500 when new sprint failed to be created', async () => {
      sprintServiceSpies.newSprint.mockRejectedValueOnce(new PrismaClientValidationError('Test error msg'));

      await sprintController.newSprint(mockRequest, mockResponse);
      expect(sprintServiceSpies.newSprint).toHaveBeenCalledWith(mockSprintFields);
      expect(mockResponse.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('should throw an error and return status 400 when duration is negative', async () => {
      const mockNegativeDurationSprint: SprintFields = {
        ...mockSprintFields,
        duration: -1,
      };

      const mockInvalidRequest = createRequest({
        body: mockNegativeDurationSprint,
      });

      await sprintController.newSprint(mockInvalidRequest, mockResponse);
      expect(sprintServiceSpies.newSprint).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });

    it('should throw an error and return status 400 when duration is more than 4', async () => {
      const mockInvalidDurationSprint: SprintFields = {
        ...mockSprintFields,
        duration: 5,
      };

      const mockInvalidRequest = createRequest({
        body: mockInvalidDurationSprint,
      });

      await sprintController.newSprint(mockInvalidRequest, mockResponse);
      expect(sprintServiceSpies.newSprint).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });

    it('should throw an error and return status 400 when there is only one date', async () => {
      const mockMissingStartDateSprint: SprintFields = {
        ...mockSprintFields,
        dates: ['2022-10-16 07:03:56'],
      };

      const mockInvalidRequest = createRequest({
        body: mockMissingStartDateSprint,
      });

      await sprintController.newSprint(mockInvalidRequest, mockResponse);
      expect(sprintServiceSpies.newSprint).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('list sprints', () => {
    const mockProjectId = {
      projectId: 123,
    };

    const mockRequest = createRequest({
      params: mockProjectId,
    });

    const mockResponse = createResponse();

    it('should return array of sprints and status 200 when called with valid projectId', async () => {
      const expectedSprints: Sprint[] = [
        mockSprintData,
        {
          ...mockSprintData,
          id: 2,
          name: 'Sprint 2',
        },
      ];
      sprintServiceSpies.listSprints.mockResolvedValueOnce(expectedSprints);

      await sprintController.listSprints(mockRequest, mockResponse);
      expect(sprintServiceSpies.listSprints).toHaveBeenCalledWith(mockProjectId.projectId);
      expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
      expect(mockResponse._getData()).toEqual(JSON.stringify(expectedSprints));
    });

    it('should throw an error and return status 400 when projectId is missing', async () => {
      const mockMissingProjectIdRequest = createRequest({
        body: {},
      });

      await sprintController.listSprints(mockMissingProjectIdRequest, mockResponse);
      expect(sprintServiceSpies.listSprints).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });

    it('should throw an error and return status 500 when sprints failed to be retrieved', async () => {
      sprintServiceSpies.listSprints.mockRejectedValueOnce(new PrismaClientValidationError('Test error msg'));

      await sprintController.listSprints(mockRequest, mockResponse);
      expect(sprintServiceSpies.listSprints).toHaveBeenCalledWith(mockProjectId.projectId);
      expect(mockResponse.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    });
  });

  describe('update sprint', () => {
    const mockRequest = createRequest({
      body: mockSprintToUpdate,
    });

    const mockResponse = createResponse();

    it('should return updated sprint and status 200 when called with valid fields', async () => {
      const expectedSprint: Sprint = {
        ...mockSprintData,
        duration: 2,
        end_date: new Date('2022-10-23 07:03:56'),
        goals: 'Updated goals',
      };

      sprintServiceSpies.updateSprint.mockResolvedValueOnce(expectedSprint);

      await sprintController.updateSprint(mockRequest, mockResponse);
      expect(sprintServiceSpies.updateSprint).toHaveBeenCalledWith(mockSprintToUpdate);
      expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
      expect(mockResponse._getData()).toEqual(JSON.stringify(expectedSprint));
    });

    it('should throw an error and return status 400 when sprintId is missing', async () => {
      const mockMissingSprintIdRequest = createRequest({
        body: {
          ...mockSprintToUpdate,
          sprintId: undefined,
        },
      });

      await sprintController.updateSprint(mockMissingSprintIdRequest, mockResponse);
      expect(sprintServiceSpies.updateSprint).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });

    it('should throw an error and return status 500 when sprint failed to update', async () => {
      sprintServiceSpies.updateSprint.mockRejectedValueOnce(new PrismaClientValidationError('Test error msg'));

      await sprintController.updateSprint(mockRequest, mockResponse);
      expect(sprintServiceSpies.updateSprint).toHaveBeenCalledWith(mockSprintToUpdate);
      expect(mockResponse.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('should throw an error and return status 400 when duration is negative', async () => {
      const mockNegativeDurationSprint = {
        ...mockSprintToUpdate,
        duration: -1,
      };

      const mockInvalidRequest = createRequest({
        body: mockNegativeDurationSprint,
      });

      await sprintController.updateSprint(mockInvalidRequest, mockResponse);
      expect(sprintServiceSpies.updateSprint).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });

    it('should throw an error and return status 400 when duration is more than 4', async () => {
      const mockNegativeDurationSprint = {
        ...mockSprintToUpdate,
        duration: 5,
      };

      const mockInvalidRequest = createRequest({
        body: mockNegativeDurationSprint,
      });

      await sprintController.updateSprint(mockInvalidRequest, mockResponse);
      expect(sprintServiceSpies.updateSprint).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });

    it('should throw an error and return status 400 when there is only one date', async () => {
      const mockNegativeDurationSprint = {
        ...mockSprintToUpdate,
        dates: ['2022-10-09 07:03:56'],
      };

      const mockInvalidRequest = createRequest({
        body: mockNegativeDurationSprint,
      });

      await sprintController.updateSprint(mockInvalidRequest, mockResponse);
      expect(sprintServiceSpies.updateSprint).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('delete sprint', () => {
    const mockSprintToDelete = {
      sprintId: 1,
    };

    const mockRequest = createRequest({
      params: mockSprintToDelete,
    });

    const mockResponse = createResponse();

    it('should return sprint and status 200 when called with valid fields', async () => {
      const expectedSprint: Sprint = mockSprintData;
      sprintServiceSpies.deleteSprint.mockResolvedValueOnce(expectedSprint);

      await sprintController.deleteSprint(mockRequest, mockResponse);
      expect(sprintServiceSpies.deleteSprint).toHaveBeenCalledWith(mockSprintToDelete.sprintId);
      expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
      expect(mockResponse._getData()).toEqual(JSON.stringify(expectedSprint));
    });

    it('should throw an error and return status 400 when sprintId is missing', async () => {
      const mockMissingSprintIdRequest = createRequest({
        body: {
          sprintId: undefined,
        },
      });
      await sprintController.deleteSprint(mockMissingSprintIdRequest, mockResponse);
      expect(sprintServiceSpies.deleteSprint).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });

    it('should throw an error and return status 500 when sprint failed to be deleted', async () => {
      sprintServiceSpies.deleteSprint.mockRejectedValueOnce(new PrismaClientValidationError('Test error msg'));

      await sprintController.deleteSprint(mockRequest, mockResponse);
      expect(sprintServiceSpies.deleteSprint).toHaveBeenCalledWith(mockSprintToDelete.sprintId);
      expect(mockResponse.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    });
  });
});
