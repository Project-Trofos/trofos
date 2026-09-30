import express from 'express';
import { hasAuth } from '../middleware/auth.middleware';
import ai from '../controllers/ai';
import { checkFeatureFlag } from '../middleware/feature_flag.middleware';
import { Action, Feature } from '@prisma/client';

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

// Gated by the same permission as the form each one fills, so only users who can create the entity spend AI calls
router.post(
  '/courseAutofill',
  hasAuth(Action.create_course, null),
  checkFeatureFlag(Feature.ai_autofill),
  ai.autofillCourse,
);

router.post(
  '/sprintAutofill',
  hasAuth(Action.update_project, null),
  checkFeatureFlag(Feature.ai_autofill),
  ai.autofillSprint,
);

export default router;
