import { UserSession } from '@prisma/client'
import express from 'express'
import { PolicyOutcome } from './policyTypes'
import userConstraint from './constraints/user.constraint'

const POLICY_NAME = 'USER_POLICY'

async function applyUserPolicy(req : express.Request, _userSession : UserSession) : Promise<PolicyOutcome> {
    let policyOutcome : PolicyOutcome;
    const { userId } = req.params;
    const isParamsMissing = userId === undefined;
    
    // TOOD: Admin flag not implemented yet. For a future feature
    const isUserAdmin = false
    if (isParamsMissing) {
        // Certain operations may not require parameters.
        // Policy alwways assumes it was called correctly.
        policyOutcome = {
            isPolicyValid : true,
            policyConstraint : userConstraint.userPolicyConstraint(Number(userId), isUserAdmin)
        }
    } else {
        policyOutcome = {
            isPolicyValid : await userConstraint.canManageUser(Number(userId), isUserAdmin),
            policyConstraint : userConstraint.userPolicyConstraint(Number(userId), isUserAdmin)
        }
    }

    return policyOutcome
}

export default {
    POLICY_NAME,
    applyUserPolicy
}
