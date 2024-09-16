import express from 'express';
import { hasAuthForExternalApi, hasAuthForProjectExternalApi } from '../../../middleware/auth.middleware';
import projectPolicy from '../../../policies/project.policy';
import project from '../../../controllers/project';
import { Action } from '@prisma/client';

const router = express.Router();

router.get('/', hasAuthForExternalApi(Action.read_project, projectPolicy.POLICY_NAME), project.getAll);

router.get('/:projectId', hasAuthForProjectExternalApi(Action.read_project, projectPolicy.POLICY_NAME), project.get);

export default router;
