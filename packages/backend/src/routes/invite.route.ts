import express from 'express';
import { hasAuth, hasAuthForProject } from '../middleware/auth.middleware';
import { Action } from '@prisma/client';
import projectPolicy from '../policies/project.policy';
import invite from '../controllers/invite';
import project from '../controllers/project';

const router = express.Router();

// Send project invitation to destination email
router.post(`/project/:projectId`, hasAuthForProject(Action.send_invite, projectPolicy.POLICY_NAME), invite.sendInvite);

router.get(
  `/project/:projectId`,
  hasAuthForProject(Action.send_invite, projectPolicy.POLICY_NAME),
  invite.getInfoFromProjectId,
);

router.post(`/:token`, invite.processInvite);
router.get(`/:token`, invite.getInfoFromInvite);

export default router;
