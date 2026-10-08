import { createHmac, timingSafeEqual } from 'crypto';
import express from 'express';

const rawBody = express.raw({ type: 'application/json', limit: '1mb', inflate: false });

export const verifyGithubWebhook: express.RequestHandler = (req, res, next) => {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) {
    res.status(503).json({ error: 'GitHub webhook is not configured' });
    return;
  }
  if (!req.is('application/json') || (req.get('content-encoding') || 'identity').toLowerCase() !== 'identity') {
    res.status(415).json({ error: 'Uncompressed application/json is required' });
    return;
  }

  rawBody(req, res, (error) => {
    if (error) {
      res.status(error.type === 'entity.too.large' ? 413 : 400).json({ error: 'Invalid webhook body' });
      return;
    }
    const signature = req.get('x-hub-signature-256');
    if (!signature || !/^sha256=[a-fA-F0-9]{64}$/.test(signature) || !Buffer.isBuffer(req.body)) {
      res.status(401).json({ error: 'Invalid webhook signature' });
      return;
    }
    const expected = createHmac('sha256', secret).update(req.body).digest();
    const supplied = Buffer.from(signature.slice(7), 'hex');
    if (!timingSafeEqual(expected, supplied)) {
      res.status(401).json({ error: 'Invalid webhook signature' });
      return;
    }
    try {
      req.body = JSON.parse(req.body.toString('utf8'));
    } catch {
      res.status(400).json({ error: 'Invalid webhook JSON' });
      return;
    }
    next();
  });
};
