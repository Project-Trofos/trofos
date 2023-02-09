import { Action } from '@prisma/client';
import express from 'express';
import backlog from '../controllers/backlog';
import backlogHistory from '../controllers/backlogHistory';
import comment from '../controllers/comment';
import { hasAuth } from '../middleware/auth.middleware';
import projectPolicy from '../policies/project.policy';

const router = express.Router();

// Routes for backlog
router.post('/newBacklog', hasAuth(Action.update_project, null), backlog.newBacklog);
router.get('/listBacklogs/:projectId', hasAuth(Action.read_project, null), backlog.listBacklogsByProjectId);
router.get('/listBacklogs', hasAuth(Action.read_project, projectPolicy.POLICY_NAME), backlog.listBacklogs);
router.get('/getBacklog/:projectId/:backlogId', hasAuth(Action.read_project, null), backlog.getBacklog);
router.put('/updateBacklog', hasAuth(Action.update_project, null), backlog.updateBacklog);
router.delete('/deleteBacklog/:projectId/:backlogId', hasAuth(Action.update_project, null), backlog.deleteBacklog);

// Routes for backlog history
router.get('/getHistory', hasAuth(Action.read_project, projectPolicy.POLICY_NAME), backlogHistory.getBacklogHistory);
router.get(
  '/getHistory/project/:projectId',
  hasAuth(Action.read_project, null),
  backlogHistory.getProjectBacklogHistory,
);
router.get('/getHistory/sprint/:sprintId', hasAuth(Action.read_project, null), backlogHistory.getSprintBacklogHistory);

// Routes for comment system
router.post('/createComment', hasAuth(Action.update_project, null), comment.create);
router.get('/listComments/:projectId/:backlogId', hasAuth(Action.update_project, null), comment.list);
router.put('/updateComment', hasAuth(Action.update_project, null), comment.update);
router.delete('/deleteComment/:commentId', hasAuth(Action.update_project, null), comment.remove);

export default router;
