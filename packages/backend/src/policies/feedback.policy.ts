import express from 'express';
import { UserSession } from '@prisma/client';
import { PolicyOutcome } from './policyTypes';
import { assertStringIsNumberOrThrow } from '../helpers/error';
import feedbackConstraint from './constraints/feedback.constraint';

const POLICY_NAME = 'FEEDBACK_POLICY';

async function applyFeedbackPolicy(req: express.Request, userSession: UserSession): Promise<PolicyOutcome> {
  let policyOutcome: PolicyOutcome;
  const { feedbackId } = req.params;
  const isParamsMissing = feedbackId === undefined;
  const isUserAdmin = userSession.user_is_admin;

  if (isParamsMissing) {
    // Certain operations may not require parameters.
    // Policy always assumes it was called correctly.
    policyOutcome = {
      isPolicyValid: true,
      policyConstraint: feedbackConstraint.feedbackPolicyConstraint(userSession.user_id, isUserAdmin),
    };
  } else {
    assertStringIsNumberOrThrow(feedbackId, 'feedbackId must be a string!');

    policyOutcome = {
      isPolicyValid: await feedbackConstraint.canManageFeedback(userSession.user_id, Number(feedbackId), isUserAdmin),
      policyConstraint: feedbackConstraint.feedbackPolicyConstraint(userSession.user_id, isUserAdmin),
    };
  }
  return policyOutcome;
}

export default {
  POLICY_NAME,
  applyFeedbackPolicy,
};
