import { Action } from '@prisma/client';
import express from 'express';
import feedback from '../controllers/feedback';
import { hasAuth } from '../middleware/auth.middleware';
import projectPolicy from '../policies/project.policy';

const router = express.Router();

router.get('/', hasAuth(Action.read_project, projectPolicy.POLICY_NAME), feedback.list);
router.get('/:sprintId', hasAuth(Action.read_project, null), feedback.listBySprintId);

router.post('/', hasAuth(Action.create_course, null), feedback.create);

router.put('/:feedbackId', hasAuth(Action.update_course, null), feedback.update);

router.delete('/:feedbackId', hasAuth(Action.delete_course, null), feedback.remove);

export default router;
