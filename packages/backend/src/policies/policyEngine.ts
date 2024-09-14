import { UserSession } from '@prisma/client';
import express from 'express';
import { PolicyOutcome } from './policyTypes';
import coursePolicy from './course.policy';
import projectPolicy from './project.policy';
import userPolicy from './user.policy';
import feedbackPolicy from './feedback.policy';
import { ApiKeyAuthIsValid } from '../services/types/apiKey.service.types';

const commandMap: { [policyName: string]: any } = {};
commandMap[coursePolicy.POLICY_NAME] = coursePolicy.applyCoursePolicy;
commandMap[projectPolicy.POLICY_NAME] = projectPolicy.applyProjectPolicy;
commandMap[userPolicy.POLICY_NAME] = userPolicy.applyUserPolicy;
commandMap[feedbackPolicy.POLICY_NAME] = feedbackPolicy.applyFeedbackPolicy;

const commandMapExternalApiCall: { [policyName: string]: any } = {};
commandMapExternalApiCall[coursePolicy.POLICY_NAME] = coursePolicy.applyCoursePolicyExternalApiCall;
commandMapExternalApiCall[projectPolicy.POLICY_NAME] = projectPolicy.applyProjectPolicyExternalApiCall;

async function execute(
  req: express.Request,
  userSession: UserSession,
  policyName: string | null,
): Promise<PolicyOutcome> {
  if (policyName === null) {
    // We don't apply any policy to the route
    return { isPolicyValid: true } as PolicyOutcome;
  }

  const policyOutcome = await commandMap[policyName](req, userSession);
  return policyOutcome;
}

async function executeExternalApiCall(
  req: express.Request,
  apiKeyAuth: ApiKeyAuthIsValid,
  policyName: string | null,
): Promise<PolicyOutcome> {
  if (policyName === null) {
    // We don't apply any policy to the route
    return { isPolicyValid: true } as PolicyOutcome;
  }

  const policyOutcome = await commandMapExternalApiCall[policyName](req, apiKeyAuth);
  return policyOutcome;
}

export default {
  execute,
  executeExternalApiCall,
};
