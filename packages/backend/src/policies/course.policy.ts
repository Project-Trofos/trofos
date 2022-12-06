import express from 'express';
import { UserSession } from '@prisma/client';
import { PolicyOutcome } from './policyTypes';
import { assertCourseIdIsValid } from '../helpers/error';
import courseConstraint from './constraints/course.constraint';

const POLICY_NAME = 'COURSE_POLICY';

async function applyCoursePolicy(req: express.Request, userSession: UserSession): Promise<PolicyOutcome> {
  let policyOutcome: PolicyOutcome;
  const { courseId } = req.params;
  const isParamsMissing = courseId === undefined;
  const isUserAdmin = userSession.user_is_admin;

  if (isParamsMissing) {
    // Certain operations may not require parameters.
    // Policy alwways assumes it was called correctly.
    policyOutcome = {
      isPolicyValid: true,
      policyConstraint: courseConstraint.coursePolicyConstraint(userSession.user_id, isUserAdmin),
    };
  } else {
    assertCourseIdIsValid(courseId);

    policyOutcome = {
      isPolicyValid: await courseConstraint.canManageCourse(userSession.user_id, Number(courseId), isUserAdmin),
      policyConstraint: courseConstraint.coursePolicyConstraint(userSession.user_id, isUserAdmin),
    };
  }
  return policyOutcome;
}

export default {
  POLICY_NAME,
  applyCoursePolicy,
};
