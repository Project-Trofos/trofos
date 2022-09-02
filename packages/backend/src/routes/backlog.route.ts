import express from 'express';
import backlog from '../controllers/backlog';

const router = express.Router();

router.post('/newBacklog', backlog.newBacklog);

export default router;
