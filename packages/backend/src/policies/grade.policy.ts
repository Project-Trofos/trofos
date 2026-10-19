import express from 'express';
import { UserSession } from '@prisma/client';
import { PolicyOutcome } from './policyTypes';
import { assertStringIsNumberOrThrow } from '../helpers/error';
import gradeConstraint from './constraints/grade.constraint';

const POLICY_NAME = 'GRADE_POLICY';

async function applyGradePolicy(req: express.Request, userSession: UserSession): Promise<PolicyOutcome> {
  const { gradeId, projectId, milestoneId } = req.params;
  const isUserAdmin = userSession.user_is_admin;
  const policyConstraint = gradeConstraint.gradePolicyConstraint(userSession.user_id, isUserAdmin);

  if (gradeId !== undefined) {
    assertStringIsNumberOrThrow(gradeId, 'gradeId must be a string!');
    return {
      isPolicyValid: await gradeConstraint.canManageGrade(userSession.user_id, Number(gradeId), isUserAdmin),
      policyConstraint,
    };
  }

  // A milestone's grade is keyed by (projectId, milestoneId). The same route shape is used both
  // to upsert the score/comment (restricted to the grade's assigned TA) and to assign a TA
  // (open to any course FACULTY), so the two are distinguished by path.
  if (projectId !== undefined && milestoneId !== undefined) {
    assertStringIsNumberOrThrow(projectId, 'projectId must be a string!');
    assertStringIsNumberOrThrow(milestoneId, 'milestoneId must be a string!');

    if (req.path.endsWith('/assign-ta')) {
      return {
        isPolicyValid: await gradeConstraint.canAssignTa(userSession.user_id, Number(projectId), isUserAdmin),
        policyConstraint,
      };
    }

    return {
      isPolicyValid: await gradeConstraint.canEditGradeValue(
        userSession.user_id,
        Number(projectId),
        Number(milestoneId),
        isUserAdmin,
      ),
      policyConstraint,
    };
  }

  // Course/project-level listing routes (and any other route with no specific record to check
  // against) have no record-level constraint to apply; filtering happens via policyConstraint.
  return {
    isPolicyValid: true,
    policyConstraint,
  };
}

export default {
  POLICY_NAME,
  applyGradePolicy,
};
