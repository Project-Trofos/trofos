import { Backlog } from '@prisma/client';
import { prismaMock } from '../../models/mock/mockPrismaClient';
import backlogService from '../../services/backlog.service';
import { BacklogFields } from '../../services/types/backlog.service.types';

describe('backlog.service tests', () => {
  test('createBacklog_ValidBacklog_ReturnsBacklog', async () => {
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

  test('createBacklog_OmitOptionalFields_ReturnsBacklog', async () => {
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
