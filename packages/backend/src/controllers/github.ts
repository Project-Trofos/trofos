import { BacklogStatusType } from '@prisma/client';
import express from 'express';
import { getDefaultErrorRes } from '../helpers/error';
import { assertGithubPayloadIsValid } from '../helpers/error/assertions';
import githubService from '../services/github.service';

// Support the existing [123] and [PROJECT-123] PR title conventions.
function extractBacklogId(title: string): number | null {
  const matches = title.match(/\[(?:[A-Za-z][A-Za-z0-9_-]*-)?([0-9]+)\]/);
  const id = matches ? Number(matches[1]) : 0;
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

async function handleWebhook(req: express.Request, res: express.Response) {
  try {
    const event = req.get('x-github-event');
    if (!event) {
      res.status(400).json({ error: 'Missing GitHub event type' });
      return;
    }
    // Log routing metadata only, never payloads or authentication headers.
    console.info('GitHub webhook', { event, deliveryId: req.get('x-github-delivery') });
    if (event !== 'pull_request') {
      res.json({ message: event === 'ping' ? 'Webhook ping received' : 'Webhook event ignored' });
      return;
    }
    const payload = req.body;
    if (!payload || typeof payload.action !== 'string' || Array.isArray(payload)) {
      res.status(400).json({ error: 'Invalid pull request event' });
      return;
    }
    if (payload.action !== 'opened' && payload.action !== 'closed') {
      res.json({ message: 'Webhook action ignored' });
      return;
    }
    assertGithubPayloadIsValid(payload);

    if (payload.action === 'opened' || (payload.action === 'closed' && payload.pull_request.merged)) {
      const backlogId = extractBacklogId(payload.pull_request.title);
      if (!backlogId) {
        res.json({ message: 'No backlog id detected in PR title.' });
        return;
      }

      const status = payload.action === 'opened' ? BacklogStatusType.in_progress : BacklogStatusType.done;
      await githubService.handleWebhook(payload.repository.clone_url, backlogId, status);
    }

    res.json({ message: 'Webhook processed' });
  } catch (error) {
    getDefaultErrorRes(error, res);
  }
}

export default {
  handleWebhook,
};
