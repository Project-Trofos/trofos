import { BacklogStatusType } from '@prisma/client';
import express from 'express';
import { getDefaultErrorRes } from '../helpers/error';
import { assertGithubPayloadIsValid } from '../helpers/error/assertions';
import githubService from '../services/github.service';

function extractBacklogId(title: string): string | null {
  const matches = title.match(/\[(.*?)\]/);
  if (matches) {
    return matches[1];
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
        res.json({ status: 'ok', message: 'No backlog id detected in PR title.' });
        return;
      }

      const status = payload.action === 'opened' ? BacklogStatusType.in_progress : BacklogStatusType.done;
      githubService.handleWebhook(payload.repository.clone_url, Number(backlogId), status);
    }

    res.json({ status: 'ok', message: 'Backlog updated' });
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

export default {
  handleWebhook,
};
