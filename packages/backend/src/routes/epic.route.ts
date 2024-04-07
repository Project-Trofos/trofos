import { Action } from '@prisma/client';
import express from 'express';
import backlog from '../controllers/backlog';
import { hasAuth } from '../middleware/auth.middleware';

const router = express.Router();

// Routes for epics
router.post('/newEpic', hasAuth(Action.update_project, null), backlog.createEpic);
router.get('/backlogs/:epicId', hasAuth(Action.read_project, null), backlog.getBacklogsForEpic);
router.get('/project/:projectId', hasAuth(Action.read_project, null), backlog.getEpicsForProject);
router.post('/addBacklog', hasAuth(Action.update_project, null), backlog.addBacklogToEpic);
router.post('/removeBacklog', hasAuth(Action.update_project, null), backlog.removeBacklogFromEpic);
router.delete('/:epicId', hasAuth(Action.update_project, null), backlog.deleteEpic);

export default router;