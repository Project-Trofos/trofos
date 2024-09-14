import express from 'express';
import { hasAuthForExternalApi } from '../../../middleware/auth.middleware';
import { Action } from '@prisma/client';

const router = express.Router();

router.get('/', hasAuthForExternalApi(Action.create_api_key), (req: express.Request, res: express.Response) => {
  res.json({ status: 'ok' });
});

export default router;
