import { Action } from '@prisma/client';
import express from 'express';
import settings from '../controllers/settings';
import { hasAuth } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', hasAuth(null, null), settings.getSettings);
router.post('/', hasAuth(Action.admin, null), settings.updateSettings);

export default router;
