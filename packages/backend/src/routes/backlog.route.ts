import { Action } from '@prisma/client';
import express from 'express';
import backlog from '../controllers/backlog';
import { isAuthorizedRequest } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/newBacklog', isAuthorizedRequest(Action.update_project), backlog.newBacklog);
router.get('/listBacklogs/:projectId', isAuthorizedRequest(Action.read_project), backlog.listBacklogs);
router.get('/getBacklog/:projectId/:backlogId', isAuthorizedRequest(Action.read_project), backlog.getBacklog);

export default router;
