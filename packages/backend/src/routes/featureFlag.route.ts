import express from 'express';
import featureFlag from '../controllers/featureFlag';
import { hasAuth } from '../middleware/auth.middleware';
import { Action } from '@prisma/client';

const router = express.Router();

router.get('/', featureFlag.getAllFeatureFlags);

router.post('/toggle', hasAuth(Action.admin, null), featureFlag.toggleFeatureFlag);

export default router;
