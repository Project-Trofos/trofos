import express from 'express';
import courseRouterExternalV1 from './course.route.external.v1';
import projectRouterExternalV1 from './project.route.external.v1';

const router = express.Router();

router.use('/course', courseRouterExternalV1);

router.use('/project', projectRouterExternalV1);

export default router;
