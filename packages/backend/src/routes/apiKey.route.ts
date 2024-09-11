import express from 'express';
import { hasAuth } from '../middleware/auth.middleware';
import apiKey from '../controllers/apiKey';
const router = express.Router();

// Routes for api keys
router.post('/generate', hasAuth(null, null), apiKey.generateApiKey);
router.get('/me/key', hasAuth(null, null), apiKey.getApiKeyRecordForUser);

export default router;
