import express from 'express';
import { Action, Feature } from '@prisma/client';
import { hasAuth } from '../middleware/auth.middleware';
import ai from '../controllers/ai';
import { checkFeatureFlag } from '../middleware/feature_flag.middleware';

const router = express.Router();

router.post(
  '/userGuideQuery',
  hasAuth(null, null),
  checkFeatureFlag(Feature.user_guide_copilot),
  ai.answerUserGuideQuery,
);

router.post(
  '/recommendUserGuide',
  hasAuth(null, null),
  checkFeatureFlag(Feature.user_guide_recommender),
  ai.getUserGuideRecommendations,
);

router.post('/parseWorkItem', hasAuth(Action.update_project, null), ai.parseWorkItem);

export default router;
