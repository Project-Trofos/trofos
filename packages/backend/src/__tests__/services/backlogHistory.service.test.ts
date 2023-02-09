import { prismaMock } from '../../models/mock/mockPrismaClient';
import projectConstraint from '../../policies/constraints/project.constraint';
import backlogHistoryService from '../../services/backlogHistory.service';

import { backlogHistoryData } from '../mocks/backlogHistoryData';

describe('backlogHistory.service tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBacklogHistory', () => {
    const projectPolicyConstraint = projectConstraint.projectPolicyConstraint(1, true);
    it('should return correct data', async () => {
      prismaMock.backlogHistory.findMany.mockResolvedValue(backlogHistoryData);
      await expect(backlogHistoryService.getBacklogHistory(projectPolicyConstraint)).resolves.toEqual(
        backlogHistoryData,
      );
    });
  });

  describe('getProjectBacklogHistory', () => {
    it('should return correct data', async () => {
      prismaMock.backlogHistory.findMany.mockResolvedValue(backlogHistoryData);
      await expect(backlogHistoryService.getProjectBacklogHistory(backlogHistoryData[0].project_id)).resolves.toEqual(
        backlogHistoryData,
      );
    });
  });

  describe('getSprintBacklogHistory', () => {
    it('should return correct data', async () => {
      prismaMock.backlogHistory.findMany.mockResolvedValue(backlogHistoryData);
      await expect(
        backlogHistoryService.getSprintBacklogHistory(backlogHistoryData[0].sprint_id ?? 1),
      ).resolves.toEqual(backlogHistoryData);
    });
  });
});
