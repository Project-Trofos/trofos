import { Action } from '@prisma/client';
import express from 'express';
import { hasAuth } from '../middleware/auth.middleware';
import issue from '../controllers/issue';

const router = express.Router();

router.get('/:issueId', hasAuth(Action.read_project, null), issue.getIssue);
router.post('/', hasAuth(Action.update_project, null), issue.newIssue);
router.put('/:issueId', hasAuth(Action.update_project, null), issue.updateIssue);
router.delete('/:issueId', hasAuth(Action.update_project, null), issue.deleteIssue);
router.post('/:issueId/backlog', hasAuth(Action.update_project, null), issue.createBacklog);

export default router;
