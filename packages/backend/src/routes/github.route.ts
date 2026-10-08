import express from 'express';
import githubController from '../controllers/github';
import { verifyGithubWebhook } from '../middleware/githubWebhook.middleware';

const router = express.Router();

router.get('/', (req: express.Request, res: express.Response) => {
  res.json({ status: 'ok' });
});

router.post('/', verifyGithubWebhook, githubController.handleWebhook);

export default router;
