import { Feature, Sprint, SprintStatus } from '@prisma/client';
import { prismaMock } from '../../models/mock/mockPrismaClient';
import sprintService from '../../services/sprint.service';
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
import { BadRequestError } from '../../helpers/error';
import projectConstraint from '../../policies/constraints/project.constraint';

const SPRINT_EXIST_ERR_MSG = 'An active sprint already exists';

describe('sprint.service tests', () => {
  describe('create sprint', () => {
    it('should create and return sprint when called with valid fields', async () => {
      prismaMock.sprint.create.mockResolvedValue(mockSprintData);
      await expect(sprintService.newSprint(mockSprintFields)).resolves.toEqual(mockSprintData);
    });

    it('should create and return sprint when optional fields are omitted', async () => {
      const mockReturnedSprint: Sprint = {
        ...mockSprintData,
        start_date: null,
        end_date: null,
        goals: null,
      };

      const sprint: SprintFields = {
        ...mockSprintFields,
        dates: undefined,
        goals: undefined,
      };
      prismaMock.sprint.create.mockResolvedValue(mockReturnedSprint);
      await expect(sprintService.newSprint(sprint)).resolves.toEqual(mockReturnedSprint);
    });
  });

  describe('get sprints', () => {
    it('should return sprints when called with valid project policy constraint', async () => {
      const projectPolicyConstraint = projectConstraint.projectPolicyConstraint(1, true);

      const mockReturnedSprints: Sprint[] = [
        mockSprintData,
        {
          ...mockSprintData,
          id: 2,
          name: 'Sprint 2',
        },
      ];
      prismaMock.sprint.findMany.mockResolvedValueOnce(mockReturnedSprints);
      await expect(sprintService.listSprints(projectPolicyConstraint)).resolves.toEqual(mockReturnedSprints);
    });
  });

  describe('get sprints by project id', () => {
    it('should return sprints when called with valid project id', async () => {
      const mockReturnedSprints: Sprint[] = [
        mockSprintData,
        {
          ...mockSprintData,
          id: 2,
          name: 'Sprint 2',
        },
      ];
      const projectId = 123;
      prismaMock.sprint.findMany.mockResolvedValueOnce(mockReturnedSprints);
      await expect(sprintService.listSprintsByProjectId(projectId)).resolves.toEqual(mockReturnedSprints);
    });
  });

  describe('get active sprints by project id', () => {
    it('should return active sprint when called with valid project id', async () => {
      const mockReturnedSprint: Sprint = {
        ...mockSprintData,
        status: SprintStatus.current,
      };
      const projectId = 123;
      prismaMock.sprint.findFirst.mockResolvedValueOnce(mockReturnedSprint);
      await expect(sprintService.listActiveSprint(projectId)).resolves.toEqual(mockReturnedSprint);
    });
  });

  describe('update sprint', () => {
    it('should update and return sprint', async () => {
      const mockReturnedSprint: Sprint = {
        ...mockSprintData,
        duration: 2,
        end_date: new Date('2022-10-23 07:03:56'),
        goals: 'Updated goals',
      };

      prismaMock.sprint.update.mockResolvedValue(mockReturnedSprint);
      await expect(sprintService.updateSprint(mockSprintToUpdate)).resolves.toEqual(mockReturnedSprint);
    });

    it('should update and return sprint with null dates if the input "dates" is null', async () => {
      const mockReturnedSprint: Sprint = {
        ...mockSprintData,
        duration: 2,
        start_date: null,
        end_date: null,
        goals: 'Updated goals',
      };

      const sprintToUpdate: Omit<SprintFields, 'projectId'> & { sprintId: number } = {
        ...mockSprintToUpdate,
        dates: null,
      };
      prismaMock.sprint.update.mockResolvedValue(mockReturnedSprint);
      await expect(sprintService.updateSprint(sprintToUpdate)).resolves.toEqual(mockReturnedSprint);
    });
  });

  describe('update sprint status', () => {
    it('should update current and completed sprints and return updated sprint if status is current', async () => {
      const mockReturnedSprint: Sprint = {
        ...mockSprintData,
        status: 'current',
      };

      const sprintToUpdate: {
        sprintId: number;
        status: 'upcoming' | 'current' | 'completed' | 'closed';
        projectId: number;
      } = {
        sprintId: 1,
        status: 'current',
        projectId: 123,
      };
      prismaMock.sprint.findFirstOrThrow.mockResolvedValueOnce(mockSprintData);
      prismaMock.sprint.findFirst.mockResolvedValueOnce(null);
      prismaMock.sprint.update.mockResolvedValue(mockReturnedSprint);
      prismaMock.sprint.updateMany.mockResolvedValue({ count: 0 });
      prismaMock.$transaction.mockResolvedValue(mockReturnedSprint);
      await expect(sprintService.updateSprintStatus(sprintToUpdate, "user")).resolves.toEqual(mockReturnedSprint);
    });

    it('should only update current sprint and return sprint if status is not current', async () => {
      const mockReturnedSprint: Sprint = {
        ...mockSprintData,
        status: 'completed',
      };

      const sprintToUpdate: {
        sprintId: number;
        status: 'upcoming' | 'current' | 'completed' | 'closed';
        projectId: number;
      } = {
        sprintId: 1,
        status: 'completed',
        projectId: 123,
      };
      prismaMock.sprint.findFirstOrThrow.mockResolvedValueOnce({
        ...mockSprintData,
        status: 'current',
      });
      // ignore sprint insights
      prismaMock.featureFlag.findUnique.mockResolvedValueOnce({ id: 1, feature_name: Feature.ai_insights , active: false });
      prismaMock.$transaction.mockResolvedValue(mockReturnedSprint);
      await expect(sprintService.updateSprintStatus(sprintToUpdate, "user")).resolves.toEqual(mockReturnedSprint);
    });

    it('should throw a BadRequestError if there is already an active sprint', async () => {
      const sprintToUpdate: {
        sprintId: number;
        status: 'upcoming' | 'current' | 'completed' | 'closed';
        projectId: number;
      } = {
        sprintId: 1,
        status: 'current',
        projectId: 123,
      };
      prismaMock.sprint.findFirstOrThrow.mockResolvedValueOnce(mockSprintData);
      prismaMock.$transaction.mockRejectedValueOnce(new BadRequestError(SPRINT_EXIST_ERR_MSG));
      await expect(sprintService.updateSprintStatus(sprintToUpdate, "user")).rejects.toThrow(SPRINT_EXIST_ERR_MSG);
    });
  });

  describe('delete sprint', () => {
    it('should return single sprint that got deleted', async () => {
      const mockSprintId = 1;
      prismaMock.sprint.delete.mockResolvedValue(mockSprintData);
      await expect(sprintService.deleteSprint(mockSprintId)).resolves.toEqual(mockSprintData);
    });
  });

  describe('add retrospective', () => {
    it('should add and return retrospective with valid fields', async () => {
      const mockReturnedRetrospective = mockRetrospectiveData;

      prismaMock.retrospective.create.mockResolvedValueOnce(mockReturnedRetrospective);
      await expect(
        sprintService.addRetrospective(
          mockRetrospectiveFields.sprintId,
          mockRetrospectiveFields.content,
          mockRetrospectiveFields.type,
        ),
      ).resolves.toEqual(mockReturnedRetrospective);
    });
  });

  describe('get retrospectives', () => {
    it('should return retrospectives with valid fields', async () => {
      const mockReturnedRetrospectives = [mockRetrospectiveData];

      prismaMock.retrospective.findMany.mockResolvedValueOnce(mockReturnedRetrospectives);
      await expect(
        sprintService.getRetrospectives(mockRetrospectiveFields.sprintId, mockRetrospectiveVoteFields.userId),
      ).resolves.toEqual(mockReturnedRetrospectives);
    });
  });

  describe('add retrospective vote', () => {
    it('should add and return retrospective vote with valid fields', async () => {
      const mockReturnedRetrospectiveVote = mockRetrospectiveVoteData;

      prismaMock.$transaction.mockResolvedValueOnce(mockReturnedRetrospectiveVote);
      await expect(
        sprintService.addRetrospectiveVote(
          mockRetrospectiveVoteFields.retroId,
          mockRetrospectiveVoteFields.userId,
          mockRetrospectiveVoteFields.type,
        ),
      ).resolves.toEqual(mockReturnedRetrospectiveVote);
    });
  });

  describe('update retrospective vote', () => {
    it('should update and return retrospective vote with valid fields', async () => {
      const mockReturnedRetrospectiveVote = mockRetrospectiveVoteData;

      prismaMock.$transaction.mockResolvedValueOnce(mockReturnedRetrospectiveVote);
      await expect(
        sprintService.updateRetrospectiveVote(
          mockRetrospectiveVoteFields.retroId,
          mockRetrospectiveVoteFields.userId,
          mockRetrospectiveVoteFields.type,
        ),
      ).resolves.toEqual(mockReturnedRetrospectiveVote);
    });
  });

  describe('delete retrospective vote', () => {
    it('should delete and return retrospective with valid fields', async () => {
      const mockReturnedRetrospectiveVote = mockRetrospectiveVoteData;

      prismaMock.$transaction.mockResolvedValueOnce(mockReturnedRetrospectiveVote);
      await expect(
        sprintService.deleteRetrospectiveVote(mockRetrospectiveVoteFields.retroId, mockRetrospectiveVoteFields.userId),
      ).resolves.toEqual(mockReturnedRetrospectiveVote);
    });
  });

  describe('get sprint notes', () => {
    it('should return sprint notes', async () => {
      const mockReturnedSprintNotes = { ...mockSprintData, ...mockSprintNotes };
      const mockSprintId = 1;

      prismaMock.sprint.findFirstOrThrow.mockResolvedValueOnce(mockReturnedSprintNotes);
      await expect(sprintService.getSprintNotes(mockSprintId)).resolves.toEqual(mockReturnedSprintNotes);
    });
  });
});
