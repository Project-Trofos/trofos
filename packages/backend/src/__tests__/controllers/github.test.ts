import StatusCodes from 'http-status-codes';
import { createRequest, createResponse } from 'node-mocks-http';
import github from '../../services/github.service';
import githubController from '../../controllers/github';
import { mockOpenedPRGithubPayload } from '../mocks/githubData';
import { mockBacklogData } from '../mocks/backlogData';

const spies = {
  handleWebhook: jest.spyOn(github, 'handleWebhook'),
};

describe('github controller tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const WEBHOOK_PROCESSED = { message: 'Webhook processed' };
  const NO_BACKLOG_ID = { message: 'No backlog id detected in PR title.' };

  describe('handleWebhook', () => {
    it('should process webhook', async () => {
      spies.handleWebhook.mockResolvedValueOnce([mockBacklogData]);

      const mockReq = createRequest({
        body: mockOpenedPRGithubPayload,
      });
      const mockRes = createResponse();

      await githubController.handleWebhook(mockReq, mockRes);

      expect(spies.handleWebhook).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(WEBHOOK_PROCESSED));
    });

    it('should not process webhook', async () => {
      spies.handleWebhook.mockResolvedValueOnce([mockBacklogData]);

      const mockReq = createRequest({
        body: {
          ...mockOpenedPRGithubPayload,
          pull_request: { title: 'No Backlog Id', merged: false },
        },
      });
      const mockRes = createResponse();

      await githubController.handleWebhook(mockReq, mockRes);

      expect(spies.handleWebhook).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(NO_BACKLOG_ID));
    });
  });
});
