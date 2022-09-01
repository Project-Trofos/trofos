import { mockDeep, mockReset } from 'jest-mock-extended';
import { PrismaClient, Backlog } from '@prisma/client';
import backlogService from '../../services/backlog.service';
import { BacklogFields } from '../../services/types/backlog.service.types';

const prismaMock = mockDeep<PrismaClient>();

beforeEach(() => {
  mockReset(prismaMock);
});

describe('backlog.service tests', () => {
  test('createBacklog_ValidBacklog_ReturnsTrue', async () => {
    const mockReturnedBacklog: Backlog = {
      id: 1,
      summary: 'A Test Summary',
      type: 'story',
      priority: 'very_high',
      sprintId: 123,
      reporterId: 1,
      assigneeId: 1,
      points: 1,
      description: 'A test description here',
      projectId: 123,
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
    await expect(backlogService.createBacklog(backlog, prismaMock)).resolves.toEqual(true);
  });

  test('createBacklog_OmitOptionalFields_ReturnsTrue', async () => {
    const mockReturnedBacklog: Backlog = {
      id: 1,
      summary: 'A Test Summary',
      type: 'story',
      priority: null,
      sprintId: null,
      reporterId: 1,
      assigneeId: null,
      points: null,
      description: null,
      projectId: 123,
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
    await expect(backlogService.createBacklog(backlog, prismaMock)).resolves.toEqual(true);
  });
});
