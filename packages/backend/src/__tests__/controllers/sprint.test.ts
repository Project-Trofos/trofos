import StatusCodes from 'http-status-codes';
import { createRequest, createResponse } from 'node-mocks-http';
import { Sprint } from '@prisma/client';
import { PrismaClientValidationError } from '@prisma/client/runtime';
import sprintController from '../../controllers/sprint';
import sprintService from '../../services/sprint.service';
import { SprintFields } from '../../helpers/types/sprint.service.types';

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
    const mockSprint: SprintFields = {
      name: 'Sprint 1',
      duration: 1,
      dates: ['2022-10-09 07:03:56', '2022-10-16 07:03:56'],
      projectId: 123,
      goals: 'Some test goals',
    };

    const expectedSprint: Sprint = {
			id: 1,
			name: 'Sprint 1',
			duration: 1,
			start_date: new Date('2022-10-09 07:03:56'),
			end_date: new Date('2022-10-16 07:03:56'),
			project_id: 123,
			goals: 'Some test goals',
		};

    const mockRequest = createRequest({
      body: mockSprint,
    });

    const mockResponse = createResponse();

    it('should return new sprint and status 200 when new sprint is successfully created', async () => {
      sprintServiceSpies.newSprint.mockResolvedValueOnce(expectedSprint);

      await sprintController.newSprint(mockRequest, mockResponse);
      expect(sprintServiceSpies.newSprint).toHaveBeenCalledWith(mockSprint);
      expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
      expect(mockResponse._getData()).toEqual(JSON.stringify(expectedSprint));
    });

    it('should throw an error and return status 500 when new sprint failed to be created', async () => {
      sprintServiceSpies.newSprint.mockRejectedValueOnce(new PrismaClientValidationError('Test error msg'));

      await sprintController.newSprint(mockRequest, mockResponse);
      expect(sprintServiceSpies.newSprint).toHaveBeenCalledWith(mockSprint);
      expect(mockResponse.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    });

		it('should throw an error and return status 500 when duration is negative', async () => {
			const mockNegativeDurationSprint: SprintFields = {
				name: 'Sprint 1',
				duration: -1,
				dates: ['2022-10-09 07:03:56', '2022-10-16 07:03:56'],
				projectId: 123,
				goals: 'Some test goals',
			};

			const mockRequest = createRequest({
				body: mockNegativeDurationSprint,
			});

      await sprintController.newSprint(mockRequest, mockResponse);
      expect(sprintServiceSpies.newSprint).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    });

		it('should throw an error and return status 500 when duration is more than 4', async () => {
			const mockInvalidDurationSprint: SprintFields = {
				name: 'Sprint 1',
				duration: 5,
				dates: ['2022-10-09 07:03:56', '2022-10-16 07:03:56'],
				projectId: 123,
				goals: 'Some test goals',
			};

			const mockRequest = createRequest({
				body: mockInvalidDurationSprint,
			});

      await sprintController.newSprint(mockRequest, mockResponse);
      expect(sprintServiceSpies.newSprint).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    });

		it('should throw an error and return status 500 when there is only one date', async () => {
			const mockMissingStartDateSprint: SprintFields = {
				name: 'Sprint 1',
				duration: 1,
				dates: ['2022-10-16 07:03:56'],
				projectId: 123,
				goals: 'Some test goals',
			};

			const mockRequest = createRequest({
				body: mockMissingStartDateSprint,
			});

      await sprintController.newSprint(mockRequest, mockResponse);
      expect(sprintServiceSpies.newSprint).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
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
        {
					id: 1,
					name: 'Sprint 1',
					duration: 1,
					start_date: new Date('2022-10-09 07:03:56'),
					end_date: new Date('2022-10-16 07:03:56'),
					project_id: 123,
					goals: 'Some test goals',
				},
        {
					id: 2,
					name: 'Sprint 2',
					duration: 1,
					start_date: new Date('2022-10-16 07:03:56'),
					end_date: new Date('2022-10-23 07:03:56'),
					project_id: 123,
					goals: 'Some test goals',
				},
      ];
      sprintServiceSpies.listSprints.mockResolvedValueOnce(expectedSprints);

      await sprintController.listSprints(mockRequest, mockResponse);
      expect(sprintServiceSpies.listSprints).toHaveBeenCalledWith(mockProjectId.projectId);
      expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
      expect(mockResponse._getData()).toEqual(JSON.stringify(expectedSprints));
    });

    it('should throw an error and return status 500 when projectId is missing', async () => {
      const mockMissingProjectIdRequest = createRequest({
        body: {},
      });

      await sprintController.listSprints(mockMissingProjectIdRequest, mockResponse);
      expect(sprintServiceSpies.listSprints).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('should throw an error and return status 500 when sprints failed to be retrieved', async () => {
      sprintServiceSpies.listSprints.mockRejectedValueOnce(new PrismaClientValidationError('Test error msg'));

      await sprintController.listSprints(mockRequest, mockResponse);
      expect(sprintServiceSpies.listSprints).toHaveBeenCalledWith(mockProjectId.projectId);
      expect(mockResponse.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    });
  });

  describe('update sprint', () => {
    const mockSprintToUpdate = {
      sprintId: 1,
			duration: 2,
			name: 'Sprint 1',
			dates: ['2022-10-09 07:03:56', '2022-10-23 07:03:56'],
			goals: 'Updated goals',
    };

    const mockRequest = createRequest({
      body: mockSprintToUpdate,
    });

    const mockResponse = createResponse();

    it('should return updated sprint and status 200 when called with valid fields', async () => {
      const expectedSprint: Sprint = {
				id: 1,
				name: 'Sprint 1',
				duration: 2,
				start_date: new Date('2022-10-09 07:03:56'),
				end_date: new Date('2022-10-23 07:03:56'),
				project_id: 123,
				goals: 'Updated goals',
			};

      sprintServiceSpies.updateSprint.mockResolvedValueOnce(expectedSprint);

      await sprintController.updateSprint(mockRequest, mockResponse);
      expect(sprintServiceSpies.updateSprint).toHaveBeenCalledWith(mockSprintToUpdate);
      expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
      expect(mockResponse._getData()).toEqual(JSON.stringify(expectedSprint));
    });

    it('should throw an error and return status 500 when sprintId is missing', async () => {
      const mockMissingSprintIdRequest = createRequest({
        body: {
          ...mockSprintToUpdate,
          sprintId: undefined,
        },
      });

      await sprintController.updateSprint(mockMissingSprintIdRequest, mockResponse);
      expect(sprintServiceSpies.updateSprint).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('should throw an error and return status 500 when sprint failed to update', async () => {
      sprintServiceSpies.updateSprint.mockRejectedValueOnce(new PrismaClientValidationError('Test error msg'));

      await sprintController.updateSprint(mockRequest, mockResponse);
      expect(sprintServiceSpies.updateSprint).toHaveBeenCalledWith(mockSprintToUpdate);
      expect(mockResponse.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    });

		it('should throw an error and return status 500 when duration is negative', async () => {
			const mockNegativeDurationSprint = {
				sprintId: 1,
				duration: -1,
				name: 'Sprint 1',
				dates: ['2022-10-09 07:03:56', '2022-10-23 07:03:56'],
				goals: 'Updated goals',
			};

			const mockRequest = createRequest({
				body: mockNegativeDurationSprint,
			});

      await sprintController.updateSprint(mockRequest, mockResponse);
      expect(sprintServiceSpies.updateSprint).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    });

		it('should throw an error and return status 500 when duration is more than 4', async () => {
			const mockNegativeDurationSprint = {
				sprintId: 1,
				duration: 5,
				name: 'Sprint 1',
				dates: ['2022-10-09 07:03:56', '2022-10-23 07:03:56'],
				goals: 'Updated goals',
			};

			const mockRequest = createRequest({
				body: mockNegativeDurationSprint,
			});

      await sprintController.updateSprint(mockRequest, mockResponse);
      expect(sprintServiceSpies.updateSprint).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    });

		it('should throw an error and return status 500 when there is only one date', async () => {
			const mockNegativeDurationSprint = {
				sprintId: 1,
				duration: 1,
				name: 'Sprint 1',
				dates: ['2022-10-09 07:03:56'],
				goals: 'Updated goals',
			};

			const mockRequest = createRequest({
				body: mockNegativeDurationSprint,
			});

      await sprintController.updateSprint(mockRequest, mockResponse);
      expect(sprintServiceSpies.updateSprint).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
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
      const expectedSprint: Sprint = {
				id: 1,
				name: 'Sprint 1',
				duration: 1,
				start_date: new Date('2022-10-09 07:03:56'),
				end_date: new Date('2022-10-16 07:03:56'),
				project_id: 123,
				goals: 'Some test goals',
			};
      sprintServiceSpies.deleteSprint.mockResolvedValueOnce(expectedSprint);

      await sprintController.deleteSprint(mockRequest, mockResponse);
      expect(sprintServiceSpies.deleteSprint).toHaveBeenCalledWith(mockSprintToDelete.sprintId);
      expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
      expect(mockResponse._getData()).toEqual(JSON.stringify(expectedSprint));
    });

    it('should throw an error and return status 500 when sprintId is missing', async () => {
      const mockMissingSprintIdRequest = createRequest({
        body: {
          ...mockSprintToDelete,
          sprintId: undefined,
        },
      });
      await sprintController.deleteSprint(mockMissingSprintIdRequest, mockResponse);
      expect(sprintServiceSpies.deleteSprint).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('should throw an error and return status 500 when sprint failed to be deleted', async () => {
      sprintServiceSpies.deleteSprint.mockRejectedValueOnce(new PrismaClientValidationError('Test error msg'));

      await sprintController.deleteSprint(mockRequest, mockResponse);
      expect(sprintServiceSpies.deleteSprint).toHaveBeenCalledWith(mockSprintToDelete.sprintId);
      expect(mockResponse.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    });
  });
});
