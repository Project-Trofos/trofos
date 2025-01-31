import express from 'express';
import { hasAuth } from '../middleware/auth.middleware';
import ai from '../controllers/ai'

const router = express.Router();

router.post('/userGuideQuery', hasAuth(null, null), ai.answerUserGuideQuery);

export default router;
