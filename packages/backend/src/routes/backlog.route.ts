import { Action } from '@prisma/client';
import express from 'express';
import backlog from '../controllers/backlog';
import comment from '../controllers/comment';
import { isAuthorizedRequest } from '../middleware/auth.middleware';

const router = express.Router();

// Routes for backlog
router.post('/newBacklog', isAuthorizedRequest(Action.update_project, null), backlog.newBacklog);
router.get('/listBacklogs/:projectId', isAuthorizedRequest(Action.read_project, null), backlog.listBacklogs);
router.get('/getBacklog/:projectId/:backlogId', isAuthorizedRequest(Action.read_project, null), backlog.getBacklog);
router.put('/updateBacklog', isAuthorizedRequest(Action.update_project, null), backlog.updateBacklog);
router.delete(
  '/deleteBacklog/:projectId/:backlogId',
  isAuthorizedRequest(Action.update_project, null),
  backlog.deleteBacklog,
);

// Routes for comment system
router.post('/createComment', isAuthorizedRequest(Action.update_project, null), comment.create);
router.get('/listComments/:projectId/:backlogId', isAuthorizedRequest(Action.update_project, null), comment.list);
router.put('/updateComment', isAuthorizedRequest(Action.update_project, null), comment.update);
router.delete('/deleteComment/:commentId', isAuthorizedRequest(Action.update_project, null), comment.remove);

export default router;
