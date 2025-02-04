import express from 'express';
import { hasAuth } from '../middleware/auth.middleware';
import ai from '../controllers/ai'
import { checkFeatureFlag } from '../middleware/feature_flag.middleware';
import { Feature } from '@prisma/client';

const router = express.Router();

router.post('/userGuideQuery', hasAuth(null, null), checkFeatureFlag(Feature.user_guide_copilot), ai.answerUserGuideQuery);

export default router;
