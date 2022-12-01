import { Backlog, BacklogStatusType } from '@prisma/client';
import { prismaMock } from '../../models/mock/mockPrismaClient';
import backlogService from '../../services/backlog.service';
import { BacklogFields } from '../../helpers/types/backlog.service.types';
import { mockBacklogReturnedProject } from '../mocks/projectData';
import { mockBacklogData, mockBacklogFields } from '../mocks/backlogData';

describe('backlog.service tests', () => {
  describe('create backlog', () => {
    const mockReturnedProject = mockBacklogReturnedProject;

    const mockReturnedUpdatedProject = {
      ...mockReturnedProject,
      backlog_counter: 1,
    };

    it('should create and return backlog when called with valid fields', async () => {
      const mockReturnedBacklog: Backlog = mockBacklogData;
      const backlog: BacklogFields = mockBacklogFields;

      prismaMock.project.findUniqueOrThrow.mockResolvedValue(mockReturnedProject);
      prismaMock.backlog.create.mockResolvedValue(mockReturnedBacklog);
      prismaMock.project.update.mockResolvedValue(mockReturnedUpdatedProject);
      prismaMock.$transaction.mockResolvedValue([mockReturnedBacklog, 2]);
      await expect(backlogService.newBacklog(backlog)).resolves.toEqual(mockReturnedBacklog);
    });

    it('should create and return backlog when optional fields are omitted', async () => {
      const mockReturnedBacklog: Backlog = {
        ...mockBacklogData,
        priority: null,
        sprint_id: null,
        assignee_id: null,
        points: null,
        description: null,
      };

      const backlog: BacklogFields = {
        ...mockBacklogFields,
        assigneeId: undefined,
        description: undefined,
        points: undefined,
        priority: undefined,
        sprintId: undefined,
      };
      prismaMock.project.findUniqueOrThrow.mockResolvedValue(mockReturnedProject);
      prismaMock.backlog.create.mockResolvedValue(mockReturnedBacklog);
      prismaMock.project.update.mockResolvedValue(mockReturnedUpdatedProject);
      prismaMock.$transaction.mockResolvedValue([mockReturnedBacklog, 2]);
      await expect(backlogService.newBacklog(backlog)).resolves.toEqual(mockReturnedBacklog);
    });

    it('should create and return backlog with default status when present', async () => {
      const mockReturnedBacklog: Backlog = mockBacklogData;
      const backlog: BacklogFields = mockBacklogFields;

      const mockDefaultStatus = {
        project_id: 123,
        name: 'Triage',
        type: BacklogStatusType.in_progress,
        order: 1,
      };

      prismaMock.project.findUniqueOrThrow.mockResolvedValue(mockReturnedProject);
      prismaMock.backlogStatus.findFirst.mockResolvedValue(mockDefaultStatus);
      prismaMock.backlog.create.mockResolvedValue(mockReturnedBacklog);
      prismaMock.project.update.mockResolvedValue(mockReturnedUpdatedProject);
      prismaMock.$transaction.mockResolvedValue([mockReturnedBacklog, 2]);
      await expect(backlogService.newBacklog(backlog)).resolves.toEqual(mockReturnedBacklog);
    });
  });

  describe('get backlogs', () => {
    it('should return backlogs when called with valid project id', async () => {
      const mockReturnedBacklogs: Backlog[] = [
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
      const projectId = 123;
      prismaMock.backlog.findMany.mockResolvedValueOnce(mockReturnedBacklogs);
      await expect(backlogService.listBacklogs(projectId, false)).resolves.toEqual(mockReturnedBacklogs);
    });

    it('should return unassigned backlogs when shouldListUnassignedBacklogs is true', async () => {
      const mockReturnedBacklogs: Backlog[] = [{ ...mockBacklogData, sprint_id: null }];
      const projectId = 123;
      prismaMock.backlog.findMany.mockResolvedValueOnce(mockReturnedBacklogs);
      await expect(backlogService.listBacklogs(projectId, true)).resolves.toEqual(mockReturnedBacklogs);
    });
  });

  describe('get single backlog', () => {
    it('should return single backlog', async () => {
      const mockReturnedBacklog: Backlog = mockBacklogData;
      const mockProjectId = 123;
      const mockBacklogId = 1;
      prismaMock.backlog.findUnique.mockResolvedValue(mockReturnedBacklog);
      await expect(backlogService.getBacklog(mockProjectId, mockBacklogId)).resolves.toEqual(mockReturnedBacklog);
    });
  });

  describe('update backlog', () => {
    it('should update and return backlog', async () => {
      const mockReturnedBacklog: Backlog = {
        ...mockBacklogData,
        summary: 'A Test Summary Updated',
      };

      const backlogToUpdate = {
        projectId: 123,
        backlogId: 1,
        fieldToUpdate: {
          summary: 'A Test Summary Updated',
        },
      };
      prismaMock.backlog.update.mockResolvedValue(mockReturnedBacklog);
      await expect(backlogService.updateBacklog(backlogToUpdate)).resolves.toEqual(mockReturnedBacklog);
    });
  });

  describe('delete backlog', () => {
    it('should return single backlog that got deleted', async () => {
      const mockReturnedBacklog: Backlog = mockBacklogData;
      const mockProjectId = 123;
      const mockBacklogId = 1;
      prismaMock.backlog.delete.mockResolvedValue(mockReturnedBacklog);
      await expect(backlogService.deleteBacklog(mockProjectId, mockBacklogId)).resolves.toEqual(mockReturnedBacklog);
    });
  });
});
