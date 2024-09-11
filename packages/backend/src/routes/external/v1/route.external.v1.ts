import express from 'express';
import courseRouterExternalV1 from './course.route.external.v1';

const router = express.Router();

// TODO: add auth middleware to check api key
router.use('/course', courseRouterExternalV1);

export default router;
