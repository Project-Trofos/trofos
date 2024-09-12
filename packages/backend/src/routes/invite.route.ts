import express from 'express';
import { hasAuthForProject } from '../middleware/auth.middleware';
import { Action } from '@prisma/client';
import projectPolicy from '../policies/project.policy';
import invite from '../controllers/invite';
import project from '../controllers/project';

const router = express.Router();

// Send project invitation to destination email
router.post(
  `/project/:projectId`,
  hasAuthForProject(Action.update_project, projectPolicy.POLICY_NAME),
  project.sendInvite,
);

router.post(`/:token`, invite.processInvite);

export default router;
