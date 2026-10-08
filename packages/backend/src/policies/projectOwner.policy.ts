import { UserSession } from '@prisma/client';
import express from 'express';
import prisma from '../models/prismaClient';
import projectConstraint from './constraints/project.constraint';
import { PolicyOutcome } from './policyTypes';

const POLICY_NAME = 'PROJECT_OWNER_POLICY';

async function applyProjectOwnerPolicy(
  req: express.Request,
  userSession: UserSession,
): Promise<PolicyOutcome> {
  const projectId = Number(req.params.projectId);

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      owner_id: userSession.user_id,
    },
  });

  return {
    isPolicyValid: project !== null,
    policyConstraint: projectConstraint.projectPolicyConstraint(
      userSession.user_id,
      userSession.user_is_admin,
    ),
  };
}

export default {
  POLICY_NAME,
  applyProjectOwnerPolicy,
};