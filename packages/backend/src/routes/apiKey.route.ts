import express from 'express';
import { Action } from '@prisma/client';
import { hasAuth } from '../middleware/auth.middleware';
import apiKey from '../controllers/apiKey';
const router = express.Router();

// Routes for api keys
router.post('/generate', hasAuth(Action.create_api_key, null), apiKey.generateApiKey);
router.get('/me', hasAuth(Action.read_api_key, null), apiKey.getApiKeyRecordForUser);

export default router;
