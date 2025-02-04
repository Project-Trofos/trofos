import express from 'express';
import featureFlag from '../controllers/featureFlag';

const router = express.Router();

router.get('/feature-flags', featureFlag.getAllFeatureFlags);

export default router;
