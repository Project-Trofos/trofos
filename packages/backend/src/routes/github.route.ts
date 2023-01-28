import express from 'express';
import githubController from '../controllers/github';

const router = express.Router();

router.get('/', (req: express.Request, res: express.Response) => {
  res.json({ status: 'ok' });
});

router.post('/', githubController.handleWebhook);

export default router;
