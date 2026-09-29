import express from 'express';
import { hasAuth } from '../middleware/auth.middleware';
import ai from '../controllers/ai';
import { checkFeatureFlag } from '../middleware/feature_flag.middleware';
import { Feature } from '@prisma/client';

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

router.post('/courseAutofill', hasAuth(null, null), checkFeatureFlag(Feature.ai_autofill), ai.autofillCourse);

router.post('/sprintAutofill', hasAuth(null, null), checkFeatureFlag(Feature.ai_autofill), ai.autofillSprint);

export default router;
