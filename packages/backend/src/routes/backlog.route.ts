import { Action } from '@prisma/client';
import express from 'express';
import backlog from '../controllers/backlog';
import backlogHistory from '../controllers/backlogHistory';
import comment from '../controllers/comment';
import { hasAuth } from '../middleware/auth.middleware';

const router = express.Router();

// Routes for backlog
<<<<<<< HEAD
router.post('/newBacklog', hasAuth(Action.update_project, null), backlog.newBacklog);
router.get('/listBacklogs/:projectId', hasAuth(Action.read_project, null), backlog.listBacklogs);
router.get('/listUnassignedBacklogs/:projectId', hasAuth(Action.read_project, null), backlog.listBacklogs);
router.get('/getBacklog/:projectId/:backlogId', hasAuth(Action.read_project, null), backlog.getBacklog);
router.put('/updateBacklog', hasAuth(Action.update_project, null), backlog.updateBacklog);
router.delete('/deleteBacklog/:projectId/:backlogId', hasAuth(Action.update_project, null), backlog.deleteBacklog);
=======
router.post('/newBacklog', isAuthorizedRequest(Action.update_project, null), backlog.newBacklog);
router.get('/listBacklogs/:projectId', isAuthorizedRequest(Action.read_project, null), backlog.listBacklogs);
router.get('/getBacklog/:projectId/:backlogId', isAuthorizedRequest(Action.read_project, null), backlog.getBacklog);
router.put('/updateBacklog', isAuthorizedRequest(Action.update_project, null), backlog.updateBacklog);
router.delete(
  '/deleteBacklog/:projectId/:backlogId',
  isAuthorizedRequest(Action.update_project, null),
  backlog.deleteBacklog,
);
>>>>>>> 731ff68f8dea97c16b8284448897e554bf8d9751

// Routes for backlog history
router.get(
  '/getHistory/project/:projectId',
  isAuthorizedRequest(Action.read_project, null),
  backlogHistory.getProjectBacklogHistory,
);
router.get(
  '/getHistory/sprint/:sprintId',
  isAuthorizedRequest(Action.read_project, null),
  backlogHistory.getSprintBacklogHistory,
);

// Routes for comment system
router.post('/createComment', hasAuth(Action.update_project, null), comment.create);
router.get('/listComments/:projectId/:backlogId', hasAuth(Action.update_project, null), comment.list);
router.put('/updateComment', hasAuth(Action.update_project, null), comment.update);
router.delete('/deleteComment/:commentId', hasAuth(Action.update_project, null), comment.remove);

export default router;
