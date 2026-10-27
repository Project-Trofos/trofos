import { BacklogStatusType } from '@prisma/client';
import express from 'express';
import { getDefaultErrorRes } from '../helpers/error';
import { assertGithubPayloadIsValid } from '../helpers/error/assertions';
import githubService from '../services/github.service';
import prisma from '../models/prismaClient';

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
    if (event === 'installation' || event === 'installation_repositories') {
      const payload = req.body;
      if (!Number.isSafeInteger(payload?.installation?.id) || typeof payload?.action !== 'string') {
        res.status(400).json({ error: 'Invalid installation event' });
        return;
      }
      if (event === 'installation' && ['deleted', 'suspend'].includes(payload.action)) {
        await prisma.projectGitLink.updateMany({ where: { installation_id: String(payload.installation.id) }, data: { active: false } });
      }
      if (event === 'installation_repositories' && payload.action === 'removed') {
        if (!Array.isArray(payload.repositories_removed) || !payload.repositories_removed.every((r: { id?: number }) => Number.isSafeInteger(r?.id))) {
          res.status(400).json({ error: 'Invalid removed repositories' });
          return;
        }
        await prisma.projectGitLink.updateMany({ where: {
          installation_id: String(payload.installation.id),
          repository_id: { in: payload.repositories_removed.map((r: { id: number }) => String(r.id)) },
        }, data: { active: false } });
      }
      res.json({ message: 'Installation event processed. Reconnect to restore removed access.' });
      return;
    }
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
      await githubService.handleWebhook(payload.repository.clone_url, backlogId, status, payload.installation?.id, payload.repository.id);
    }

    res.json({ message: 'Webhook processed' });
  } catch (error) {
    getDefaultErrorRes(error, res);
  }
}

export default {
  handleWebhook,
};
