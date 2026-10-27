import { Backlog, BacklogStatusType } from '@prisma/client';
import { prismaMock } from '../../models/mock/mockPrismaClient';
import github from '../../services/github.service';
import { mockBacklogData } from '../mocks/backlogData';
import { mockOpenedPRGithubPayload } from '../mocks/githubData';
import { mockDoneBacklogStatus, mockInProgressBacklogStatus, mockReturnedProjectGitLink } from '../mocks/projectData';

describe('github.service tests', () => {
  it('routes App links by stable identity and only falls back to URL for legacy links', async () => {
    prismaMock.$transaction.mockImplementationOnce((async (fn: any) => fn(prismaMock)) as any);
    prismaMock.projectGitLink.findMany.mockResolvedValue([]);
    await github.handleWebhook('https://github.com/new/name.git', 1, BacklogStatusType.done, 22, 33);
    expect(prismaMock.projectGitLink.findMany).toHaveBeenCalledWith({ where: { active: true, OR: [
      { repo: 'https://github.com/new/name.git', installation_id: null },
      { installation_id: '22', repository_id: '33' },
    ] } });
  });
  describe('handleWebhook', () => {
    it('should update backlog from todo to in_progress status', async () => {
      const MOCK_BACKLOG_ID = 2;
      const MOCK_IN_PROGRESS_STATUS = BacklogStatusType.in_progress;
      const mockReturnedBacklogs: Backlog[] = [
        {
          ...mockBacklogData,
          status: 'In progress',
        },
      ];

      prismaMock.projectGitLink.findMany.mockResolvedValueOnce([mockReturnedProjectGitLink]);
      prismaMock.backlogStatus.findFirstOrThrow.mockResolvedValueOnce(mockInProgressBacklogStatus);
      prismaMock.backlog.update.mockResolvedValue(mockReturnedBacklogs[0]);
      prismaMock.$transaction.mockResolvedValueOnce(mockReturnedBacklogs);

      const result = await github.handleWebhook(
        mockOpenedPRGithubPayload.repository.clone_url,
        MOCK_BACKLOG_ID,
        MOCK_IN_PROGRESS_STATUS,
      );
      expect(result).toEqual<Backlog[]>(mockReturnedBacklogs);
    });

    it('should update backlog from in_progress to done status', async () => {
      const MOCK_BACKLOG_ID = 2;
      const MOCK_DONE_STATUS = BacklogStatusType.done;
      const mockReturnedBacklogs: Backlog[] = [
        {
          ...mockBacklogData,
          status: 'Done',
        },
      ];
      prismaMock.projectGitLink.findMany.mockResolvedValueOnce([mockReturnedProjectGitLink]);
      prismaMock.backlogStatus.findFirstOrThrow.mockResolvedValueOnce(mockDoneBacklogStatus);
      prismaMock.backlog.update.mockResolvedValue(mockReturnedBacklogs[0]);
      prismaMock.$transaction.mockResolvedValueOnce(mockReturnedBacklogs);

      const result = await github.handleWebhook(
        mockOpenedPRGithubPayload.repository.clone_url,
        MOCK_BACKLOG_ID,
        MOCK_DONE_STATUS,
      );
      expect(result).toEqual<Backlog[]>(mockReturnedBacklogs);
    });
  });
});
