import { Action } from '@prisma/client';
import express from 'express';
import feedback from '../controllers/feedback';
import { hasAuth } from '../middleware/auth.middleware';
import feedbackPolicy from '../policies/feedback.policy';

const router = express.Router();

router.get(`/`, hasAuth(Action.read_feedback, feedbackPolicy.POLICY_NAME), feedback.list);

export default router;
