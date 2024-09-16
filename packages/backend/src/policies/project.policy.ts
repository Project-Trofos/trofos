import { UserSession } from '@prisma/client';
import express from 'express';
import { PolicyOutcome } from './policyTypes';
import projectConstraint from './constraints/project.constraint';
import { ApiKeyAuthIsValid } from '../services/types/apiKey.service.types';

const POLICY_NAME = 'PROJECT_POLICY';

async function applyProjectPolicy(req: express.Request, userSession: UserSession): Promise<PolicyOutcome> {
  let policyOutcome: PolicyOutcome;
  const { projectId } = req.params;
  const isParamsMissing = projectId === undefined;
  const isUserAdmin = userSession.user_is_admin;

  if (isParamsMissing) {
    // Certain operations may not require parameters.
    // Policy alwways assumes it was called correctly.
    policyOutcome = {
      isPolicyValid: true,
      policyConstraint: projectConstraint.projectPolicyConstraint(userSession.user_id, isUserAdmin),
    };
  } else {
    // TODO: Ask Luoyi where there is no assertProjectIdIsNumber() function

    policyOutcome = {
      isPolicyValid: await projectConstraint.canManageProject(userSession.user_id, Number(projectId), isUserAdmin),
      policyConstraint: projectConstraint.projectPolicyConstraint(userSession.user_id, isUserAdmin),
    };
  }
  return policyOutcome;
}

async function applyProjectPolicyExternalApiCall(req: express.Request, apiKeyAuth: ApiKeyAuthIsValid): Promise<PolicyOutcome> {
  let policyOutcome: PolicyOutcome;
  const { projectId } = req.params;
  const isParamsMissing = projectId === undefined;
  const isUserAdmin = apiKeyAuth.user_is_admin;

  if (isParamsMissing) {
    // Certain operations may not require parameters.
    // Policy alwways assumes it was called correctly.
    policyOutcome = {
      isPolicyValid: true,
      policyConstraint: projectConstraint.projectPolicyConstraint(apiKeyAuth.user_id, isUserAdmin),
    };
  } else {
    policyOutcome = {
      isPolicyValid: await projectConstraint.canManageProject(apiKeyAuth.user_id, Number(projectId), isUserAdmin),
      policyConstraint: projectConstraint.projectPolicyConstraint(apiKeyAuth.user_id, isUserAdmin),
    };
  }
  return policyOutcome;
}

export default {
  POLICY_NAME,
  applyProjectPolicy,
  applyProjectPolicyExternalApiCall,
};
