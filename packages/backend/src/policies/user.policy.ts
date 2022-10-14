import { UserSession } from '@prisma/client';
import express from 'express';
import { PolicyOutcome } from './policyTypes';
import userConstraint from './constraints/user.constraint';

const POLICY_NAME = 'USER_POLICY';

async function applyUserPolicy(req : express.Request, userSession : UserSession) : Promise<PolicyOutcome> {
    let policyOutcome : PolicyOutcome;
    const { userId } = req.body;
    const isParamsMissing = userId === undefined;
    const isUserAdmin = userSession.user_is_admin
    
    if (isParamsMissing) {
        // Certain operations may not require parameters.
        // Policy always assumes it was called correctly.
        policyOutcome = {
            isPolicyValid : true,
            policyConstraint : userConstraint.userPolicyConstraint(userSession.user_id, isUserAdmin)
        }
    } else {
        policyOutcome = {
            isPolicyValid : await userConstraint.canManageUser(Number(userId), isUserAdmin),
            policyConstraint : userConstraint.userPolicyConstraint(Number(userId), isUserAdmin)
        }
    }

  return policyOutcome;
}

export default {
  POLICY_NAME,
  applyUserPolicy,
};
