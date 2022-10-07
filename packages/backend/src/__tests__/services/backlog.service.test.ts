import { Backlog } from '@prisma/client';
import { prismaMock } from '../../models/mock/mockPrismaClient';
import backlogService from '../../services/backlog.service';
import { BacklogFields } from '../../helpers/types/backlog.service.types';

describe('backlog.service tests', () => {
  describe('create backlog', () => {
    const mockReturnedProject = {
      id: 1,
      pname: 'c1',
      created_at: new Date(Date.now()),
      course_id: null,
      course_sem: null,
      course_year: null,
      pkey: 'TEST',
      description: 'd1',
      public: false,
      backlog_counter: 1,
    };

    const mockReturnedUpdatedProject = {
      id: 1,
      pname: 'c1',
      created_at: new Date(Date.now()),
      course_id: null,
      course_sem: null,
      course_year: null,
      pkey: 'TEST',
      description: 'd1',
      public: false,
      backlog_counter: 2,
    };

    it('should create and return backlog when called with valid fields', async () => {
      const mockReturnedBacklog: Backlog = {
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

      const backlog: BacklogFields = {
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
      prismaMock.project.findUniqueOrThrow.mockResolvedValue(mockReturnedProject);
      prismaMock.backlog.create.mockResolvedValue(mockReturnedBacklog);
      prismaMock.project.update.mockResolvedValue(mockReturnedUpdatedProject);
      prismaMock.$transaction.mockResolvedValue([mockReturnedBacklog, 2]);
      await expect(backlogService.newBacklog(backlog)).resolves.toEqual(mockReturnedBacklog);
    });

    it('should create and return backlog when optional fields are omitted', async () => {
      const mockReturnedBacklog: Backlog = {
        backlog_id: 1,
        summary: 'A Test Summary',
        type: 'story',
        priority: null,
        sprint_id: null,
        reporter_id: 1,
        assignee_id: null,
        points: null,
        description: null,
        project_id: 123,
      };

      const backlog: BacklogFields = {
        assigneeId: undefined,
        description: undefined,
        points: undefined,
        priority: undefined,
        projectId: 123,
        reporterId: 1,
        summary: 'A Test Summary',
        sprintId: undefined,
        type: 'story',
      };
      prismaMock.project.findUniqueOrThrow.mockResolvedValue(mockReturnedProject);
      prismaMock.backlog.create.mockResolvedValue(mockReturnedBacklog);
      prismaMock.project.update.mockResolvedValue(mockReturnedUpdatedProject);
      prismaMock.$transaction.mockResolvedValue([mockReturnedBacklog, 2]);
      await expect(backlogService.newBacklog(backlog)).resolves.toEqual(mockReturnedBacklog);
    });
  });

  describe('get backlogs', () => {
    it('should return backlogs when called with valid project id', async () => {
      const mockReturnedBacklogs: Backlog[] = [
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
      const projectId = 123;
      prismaMock.backlog.findMany.mockResolvedValueOnce(mockReturnedBacklogs);
      await expect(backlogService.listBacklogs(projectId)).resolves.toEqual(mockReturnedBacklogs);
    });
  });

  describe('get single backlog', () => {
    it('should return single backlog', async () => {
      const mockReturnedBacklog: Backlog = {
        backlog_id: 1,
        summary: 'A Test Summary Updated',
        type: 'story',
        priority: 'very_high',
        sprint_id: 123,
        reporter_id: 1,
        assignee_id: 1,
        points: 1,
        description: 'A test description here',
        project_id: 123,
      };
      const mockProjectId = 123;
      const mockBacklogId = 1;
      prismaMock.backlog.findUnique.mockResolvedValue(mockReturnedBacklog);
      await expect(backlogService.getBacklog(mockProjectId, mockBacklogId)).resolves.toEqual(mockReturnedBacklog);
    });
  });

  describe('update backlog', () => {
    it('should update and return backlog', async () => {
      const mockReturnedBacklog: Backlog = {
        backlog_id: 1,
        summary: 'A Test Summary Updated',
        type: 'story',
        priority: 'very_high',
        sprint_id: 123,
        reporter_id: 1,
        assignee_id: 1,
        points: 1,
        description: 'A test description here',
        project_id: 123,
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
});
