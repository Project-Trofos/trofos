import { Backlog } from '@prisma/client';
import { prismaMock } from '../../models/mock/mockPrismaClient';
import backlogService from '../../services/backlog.service';
import { BacklogFields } from '../../services/types/backlog.service.types';

describe('backlog.service tests',  ()=> {
  describe('backlog.service create backlog', () => {
    it('should create and return backlog when called with valid fields', async () => {
      const mockReturnedBacklog: Backlog = {
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
      prismaMock.backlog.create.mockResolvedValue(mockReturnedBacklog);
      await expect(backlogService.createBacklog(backlog)).resolves.toEqual(mockReturnedBacklog);
    });
  
    it('should create and return backlog when optional fields are omitted', async () => {
      const mockReturnedBacklog: Backlog = {
        id: 1,
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
      prismaMock.backlog.create.mockResolvedValueOnce(mockReturnedBacklog);
      await expect(backlogService.createBacklog(backlog)).resolves.toEqual(mockReturnedBacklog);
    });
  });
  
  describe('backlog.service get backlogs', () => {
    it('should return backlogs when called with valid project id', async () => {
      const mockReturnedBacklogs: Backlog[] = [
        {
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
        },
        {
          id: 2,
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
      await expect(backlogService.getBacklogs(projectId)).resolves.toEqual(mockReturnedBacklogs);
    });
  });
});
