import express from 'express';
import { Feature } from '@prisma/client';
import { hasAuth, hasAuthForProject } from '../middleware/auth.middleware';
import { checkFeatureFlag } from '../middleware/feature_flag.middleware';
import invite from '../controllers/invite';
import projectOwnerPolicy from '../policies/projectOwner.policy';

const router = express.Router();

// Create or retrieve a reusable project invitation link
router.post(
  `/project/:projectId`,
  checkFeatureFlag(Feature.project_invite_links),
  hasAuthForProject(null, projectOwnerPolicy.POLICY_NAME),
  invite.createOrGetInviteLink,
);

router.get(
  `/project/:projectId`,
  checkFeatureFlag(Feature.project_invite_links),
  hasAuthForProject(null, projectOwnerPolicy.POLICY_NAME),
  invite.getInfoFromProjectId,
);

router.post(`/:token`, checkFeatureFlag(Feature.project_invite_links), hasAuth(null, null), invite.processInvite);
router.get(`/:token`, checkFeatureFlag(Feature.project_invite_links), invite.getInfoFromInvite);

export default router;
