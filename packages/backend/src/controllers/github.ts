import { BacklogStatusType } from '@prisma/client';
import express from 'express';
import { getDefaultErrorRes } from '../helpers/error';
import { assertGithubPayloadIsValid } from '../helpers/error/assertions';
import githubService from '../services/github.service';

// Get backlog id from the commit title
function extractBacklogId(title: string): number | null {
  const matches = title.match(/\[(.*-)?(.*?)\]/);
  if (matches && matches.length === 3) {
    return Number(matches[2]) || null;
  }

  return null;
}

async function handleWebhook(req: express.Request, res: express.Response) {
  try {
    const payload = req.body;
    assertGithubPayloadIsValid(payload);

    if (payload.action === 'opened' || (payload.action === 'closed' && payload.pull_request.merged)) {
      const backlogId = extractBacklogId(payload.pull_request.title);
      if (!backlogId) {
        res.json({ message: 'No backlog id detected in PR title.' });
        return;
      }

      const status = payload.action === 'opened' ? BacklogStatusType.in_progress : BacklogStatusType.done;
      githubService.handleWebhook(payload.repository.clone_url, backlogId, status);
    }

    res.json({ message: 'Webhook processed' });
  } catch (error) {
    getDefaultErrorRes(error, res);
  }
}

export default {
  handleWebhook,
};
