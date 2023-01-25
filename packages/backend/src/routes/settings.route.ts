import { Action } from '@prisma/client';
import express from 'express';
import settings from '../controllers/settings';
import { isAuthorizedRequest } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', isAuthorizedRequest(Action.admin, null), settings.getSettings);
router.post('/', isAuthorizedRequest(Action.admin, null), settings.updateSettings);

export default router;
