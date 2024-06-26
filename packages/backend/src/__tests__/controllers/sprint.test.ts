import StatusCodes from 'http-status-codes';
import { createRequest, createResponse } from 'node-mocks-http';
import { Backlog, Retrospective, RetrospectiveVote, Sprint, SprintStatus } from '@prisma/client';
import { PrismaClientValidationError } from '@prisma/client/runtime';
import sprintController from '../../controllers/sprint';
import sprintService from '../../services/sprint.service';
import backlogService from '../../services/backlog.service';
import { SprintFields } from '../../helpers/types/sprint.service.types';
import {
  mockRetrospectiveData,
  mockRetrospectiveFields,
  mockRetrospectiveVoteData,
  mockRetrospectiveVoteFields,
  mockSprintData,
  mockSprintFields,
  mockSprintNotes,
  mockSprintToUpdate,
} from '../mocks/sprintData';
import { mockBacklogData } from '../mocks/backlogData';
import projectConstraint from '../../policies/constraints/project.constraint';

const sprintServiceSpies = {
  newSprint: jest.spyOn(sprintService, 'newSprint'),
  listSprints: jest.spyOn(sprintService, 'listSprints'),
  listSprintsByProjectId: jest.spyOn(sprintService, 'listSprintsByProjectId'),
  listActiveSprint: jest.spyOn(sprintService, 'listActiveSprint'),
  updateSprint: jest.spyOn(sprintService, 'updateSprint'),
  deleteSprint: jest.spyOn(sprintService, 'deleteSprint'),
  addRetrospective: jest.spyOn(sprintService, 'addRetrospective'),
  getRetrospectives: jest.spyOn(sprintService, 'getRetrospectives'),
  addRetrospectiveVote: jest.spyOn(sprintService, 'addRetrospectiveVote'),
  updateRetrospectiveVote: jest.spyOn(sprintService, 'updateRetrospectiveVote'),
  deleteRetrospectiveVote: jest.spyOn(sprintService, 'deleteRetrospectiveVote'),
  getSprintNotes: jest.spyOn(sprintService, 'getSprintNotes'),
};

const backlogServiceSpies = {
  listUnassignedBacklogs: jest.spyOn(backlogService, 'listUnassignedBacklogs'),
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
    const projectPolicyConstraint = projectConstraint.projectPolicyConstraint(1, true);
    const mockRequest = createRequest();
    const mockResponse = createResponse();
    mockResponse.locals.policyConstraint = projectPolicyConstraint;

    it('should return array of sprints and status 200 when called with valid policy constraint', async () => {
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
      expect(sprintServiceSpies.listSprints).toHaveBeenCalledWith(projectPolicyConstraint);
      expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
      expect(mockResponse._getData()).toEqual(JSON.stringify(expectedSprints));
    });
  });

  describe('list sprints by project id', () => {
    const mockProjectId = {
      projectId: 123,
    };

    const mockRequest = createRequest({
      params: mockProjectId,
    });

    it('should return array of sprints and status 200 when called with valid projectId', async () => {
      const expectedSprints: { sprints: Sprint[]; unassignedBacklogs: Backlog[] } = {
        sprints: [
          mockSprintData,
          {
            ...mockSprintData,
            id: 2,
            name: 'Sprint 2',
          },
        ],
        unassignedBacklogs: [mockBacklogData],
      };
      sprintServiceSpies.listSprintsByProjectId.mockResolvedValueOnce(expectedSprints.sprints);
      backlogServiceSpies.listUnassignedBacklogs.mockResolvedValueOnce(expectedSprints.unassignedBacklogs);
      const mockResponse = createResponse();

      await sprintController.listSprintsByProjectId(mockRequest, mockResponse);
      expect(sprintServiceSpies.listSprintsByProjectId).toHaveBeenCalledWith(mockProjectId.projectId);
      expect(backlogServiceSpies.listUnassignedBacklogs).toHaveBeenCalledWith(mockProjectId.projectId);
      expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
      expect(mockResponse._getData()).toEqual(JSON.stringify(expectedSprints));
    });

    it('should throw an error and return status 400 when projectId is missing', async () => {
      const mockMissingProjectIdRequest = createRequest({
        body: {},
      });
      const mockResponse = createResponse();

      await sprintController.listSprintsByProjectId(mockMissingProjectIdRequest, mockResponse);
      expect(sprintServiceSpies.listSprintsByProjectId).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });

    it('should throw an error and return status 500 when sprints failed to be retrieved', async () => {
      sprintServiceSpies.listSprintsByProjectId.mockRejectedValueOnce(
        new PrismaClientValidationError('Test error msg'),
      );
      const mockResponse = createResponse();

      await sprintController.listSprintsByProjectId(mockRequest, mockResponse);
      expect(sprintServiceSpies.listSprintsByProjectId).toHaveBeenCalledWith(mockProjectId.projectId);
      expect(mockResponse.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    });
  });

  describe('list active sprints by project id', () => {
    const mockProjectId = {
      projectId: 123,
    };

    const mockRequest = createRequest({
      params: mockProjectId,
    });

    it('should return active sprint and status 200 when called with valid projectId', async () => {
      const expectedSprint: Sprint = {
        ...mockSprintData,
        status: SprintStatus.current,
      };
      sprintServiceSpies.listActiveSprint.mockResolvedValueOnce(expectedSprint);
      const mockResponse = createResponse();

      await sprintController.listActiveSprint(mockRequest, mockResponse);
      expect(sprintServiceSpies.listActiveSprint).toHaveBeenCalledWith(mockProjectId.projectId);
      expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
      expect(mockResponse._getData()).toEqual(JSON.stringify(expectedSprint));
    });

    it('should throw an error and return status 400 when projectId is missing', async () => {
      const mockMissingProjectIdRequest = createRequest({
        body: {},
      });
      const mockResponse = createResponse();

      await sprintController.listActiveSprint(mockMissingProjectIdRequest, mockResponse);
      expect(sprintServiceSpies.listActiveSprint).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
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

  describe('add retrospective', () => {
    const mockRequest = createRequest({
      body: mockRetrospectiveFields,
    });

    const mockResponse = createResponse();

    it('should return new retrospective and status 200 when new retrospective is successfully created', async () => {
      const expectedRetrospective: Retrospective = mockRetrospectiveData;
      sprintServiceSpies.addRetrospective.mockResolvedValueOnce(expectedRetrospective);

      await sprintController.addRetrospective(mockRequest, mockResponse);
      expect(sprintServiceSpies.addRetrospective).toHaveBeenCalledWith(
        mockRetrospectiveFields.sprintId,
        mockRetrospectiveFields.content,
        mockRetrospectiveFields.type,
      );
      expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
      expect(mockResponse._getData()).toEqual(JSON.stringify(expectedRetrospective));
    });

    it('should throw an error and return status 400 when sprintId is missing', async () => {
      const mockInvalidSprintId = {
        ...mockRetrospectiveFields,
        sprintId: undefined,
      };

      const mockInvalidRequest = createRequest({
        body: mockInvalidSprintId,
      });

      await sprintController.addRetrospective(mockInvalidRequest, mockResponse);
      expect(sprintServiceSpies.addRetrospective).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('get retrospectives', () => {
    const mockRequest = createRequest({
      params: { sprintId: mockRetrospectiveFields.sprintId, type: mockRetrospectiveFields.type },
    });

    const mockResponse = createResponse({ locals: { userSession: { user_id: mockRetrospectiveVoteFields.userId } } });

    it('should return retrospectives and status 200 when called with valid sprintId', async () => {
      const expectedRetrospectives: Retrospective[] = [mockRetrospectiveData];
      sprintServiceSpies.getRetrospectives.mockResolvedValueOnce(expectedRetrospectives);

      await sprintController.getRetrospectives(mockRequest, mockResponse);
      expect(sprintServiceSpies.getRetrospectives).toHaveBeenCalledWith(
        mockRetrospectiveFields.sprintId,
        mockRetrospectiveVoteFields.userId,
        mockRetrospectiveFields.type,
      );
      expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
      expect(mockResponse._getData()).toEqual(JSON.stringify(expectedRetrospectives));
    });

    it('should throw an error and return status 400 when sprintId is missing', async () => {
      const mockInvalidSprintId = {
        ...mockRetrospectiveFields,
        sprintId: undefined,
      };

      const mockInvalidRequest = createRequest({
        body: mockInvalidSprintId,
      });

      await sprintController.getRetrospectives(mockInvalidRequest, mockResponse);
      expect(sprintServiceSpies.getRetrospectives).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('add retrospective vote', () => {
    const mockRequest = createRequest({
      body: mockRetrospectiveVoteFields,
    });

    const mockResponse = createResponse({ locals: { userSession: { user_id: mockRetrospectiveVoteFields.userId } } });

    it('should return new retrospective vote and status 200 when new retrospective vote is successfully created', async () => {
      const expectedRetrospectiveVote: RetrospectiveVote = mockRetrospectiveVoteData;
      sprintServiceSpies.addRetrospectiveVote.mockResolvedValueOnce(expectedRetrospectiveVote);

      await sprintController.addRetrospectiveVote(mockRequest, mockResponse);
      expect(sprintServiceSpies.addRetrospectiveVote).toHaveBeenCalledWith(
        mockRetrospectiveVoteFields.retroId,
        mockRetrospectiveVoteFields.userId,
        mockRetrospectiveVoteFields.type,
      );
      expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
      expect(mockResponse._getData()).toEqual(JSON.stringify(expectedRetrospectiveVote));
    });

    it('should throw an error and return status 400 when retroId is missing', async () => {
      const mockInvalidSprintId = {
        ...mockRetrospectiveVoteFields,
        retroId: undefined,
      };

      const mockInvalidRequest = createRequest({
        body: mockInvalidSprintId,
      });

      await sprintController.addRetrospectiveVote(mockInvalidRequest, mockResponse);
      expect(sprintServiceSpies.addRetrospectiveVote).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('update retrospective vote', () => {
    const mockRequest = createRequest({
      body: mockRetrospectiveVoteFields,
    });

    const mockResponse = createResponse({ locals: { userSession: { user_id: mockRetrospectiveVoteFields.userId } } });

    it('should return updated retrospective vote and status 200 when retrospective vote is successfully updated', async () => {
      const expectedRetrospectiveVote: RetrospectiveVote = mockRetrospectiveVoteData;
      sprintServiceSpies.updateRetrospectiveVote.mockResolvedValueOnce(expectedRetrospectiveVote);

      await sprintController.updateRetrospectiveVote(mockRequest, mockResponse);
      expect(sprintServiceSpies.updateRetrospectiveVote).toHaveBeenCalledWith(
        mockRetrospectiveVoteFields.retroId,
        mockRetrospectiveVoteFields.userId,
        mockRetrospectiveVoteFields.type,
      );
      expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
      expect(mockResponse._getData()).toEqual(JSON.stringify(expectedRetrospectiveVote));
    });

    it('should throw an error and return status 400 when retroId is missing', async () => {
      const mockInvalidSprintId = {
        ...mockRetrospectiveVoteFields,
        retroId: undefined,
      };

      const mockInvalidRequest = createRequest({
        body: mockInvalidSprintId,
      });

      await sprintController.updateRetrospectiveVote(mockInvalidRequest, mockResponse);
      expect(sprintServiceSpies.updateRetrospectiveVote).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('delete retrospective vote', () => {
    const mockRequest = createRequest({
      params: { retroId: mockRetrospectiveVoteFields.retroId },
    });

    const mockResponse = createResponse({ locals: { userSession: { user_id: mockRetrospectiveVoteFields.userId } } });

    it('should return deleted retrospective vote and status 200 when retrospective is successfully deleted', async () => {
      const expectedRetrospectiveVote: RetrospectiveVote = mockRetrospectiveVoteData;
      sprintServiceSpies.deleteRetrospectiveVote.mockResolvedValueOnce(expectedRetrospectiveVote);

      await sprintController.deleteRetrospectiveVote(mockRequest, mockResponse);
      expect(sprintServiceSpies.deleteRetrospectiveVote).toHaveBeenCalledWith(
        mockRetrospectiveVoteFields.retroId,
        mockRetrospectiveVoteFields.userId,
      );
      expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
      expect(mockResponse._getData()).toEqual(JSON.stringify(expectedRetrospectiveVote));
    });

    it('should throw an error and return status 400 when sprintId is missing', async () => {
      const mockInvalidSprintId = {
        ...mockRetrospectiveVoteFields,
        retroId: undefined,
      };

      const mockInvalidRequest = createRequest({
        body: mockInvalidSprintId,
      });

      await sprintController.deleteRetrospectiveVote(mockInvalidRequest, mockResponse);
      expect(sprintServiceSpies.deleteRetrospectiveVote).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('get sprint notes', () => {
    const mockSprintId = 1;
    const mockRequest = createRequest({
      params: {
        sprintId: mockSprintId,
      },
    });
    const mockResponse = createResponse();

    it('should return sprint notes', async () => {
      const expectedSprintNotes = mockSprintNotes;
      sprintServiceSpies.getSprintNotes.mockResolvedValueOnce(expectedSprintNotes);

      await sprintController.getSprintNotes(mockRequest, mockResponse);
      expect(sprintServiceSpies.getSprintNotes).toHaveBeenCalledWith(mockSprintId);
      expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
      expect(mockResponse._getData()).toEqual(JSON.stringify(expectedSprintNotes));
    });
  });
});
