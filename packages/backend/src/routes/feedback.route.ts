import { Action } from '@prisma/client';
import express from 'express';
import feedback from '../controllers/feedback';
import { hasAuth } from '../middleware/auth.middleware';
import feedbackPolicy from '../policies/feedback.policy';

const router = express.Router();

router.get('/', hasAuth(Action.read_feedback, feedbackPolicy.POLICY_NAME), feedback.list);

router.get('/sprint/:sprintId', hasAuth(Action.read_feedback, feedbackPolicy.POLICY_NAME), feedback.listBySprintId);

router.post('/', hasAuth(Action.create_feedback, feedbackPolicy.POLICY_NAME), feedback.create);

router.put('/:feedbackId', hasAuth(Action.update_feedback, feedbackPolicy.POLICY_NAME), feedback.update);

router.delete('/:feedbackId', hasAuth(Action.delete_feedback, feedbackPolicy.POLICY_NAME), feedback.remove);

export default router;
