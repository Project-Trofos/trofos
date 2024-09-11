import express from 'express';

const router = express.Router();

router.get('/', (req: express.Request, res: express.Response) => {
  res.json({ status: 'ok' });
});

export default router;
