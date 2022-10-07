import express from "express";
import { UserSession } from "@prisma/client";
import { PolicyOutcome } from './policyTypes';
import {
    assertCourseSemIsNumber,
    assertCourseYearIsNumber,
} from '../helpers/error';
import courseConstraint from './constraints/course.constraint'


const POLICY_NAME = 'COURSE_POLICY' 

async function applyCoursePolicy(req : express.Request, userSession : UserSession) : Promise<PolicyOutcome> {
    let policyOutcome : PolicyOutcome;
    const { courseId, courseYear, courseSem } = req.params;
    const isParamsMissing = courseId === undefined || courseYear === undefined || courseSem === undefined

    // TODO: Admin flag not implemented yet. For a future feature
    const isUserAdmin = false 
    if (isParamsMissing) {
        // Certain operations may not require parameters.
        // Policy alwways assumes it was called correctly.
        policyOutcome = {
            isPolicyValid : true,
            policyConstraint : courseConstraint.coursePolicyConstraint(userSession.user_id, isUserAdmin)
        }
    } else {
        assertCourseYearIsNumber(courseYear);
        assertCourseSemIsNumber(courseSem);
    
        policyOutcome = {
            isPolicyValid : await courseConstraint.canManageCourse(userSession.user_id, courseId, Number(courseYear), Number(courseSem), isUserAdmin),
            policyConstraint : courseConstraint.coursePolicyConstraint(userSession.user_id, isUserAdmin)
        }
    }
    return policyOutcome
}

export default {
    POLICY_NAME,
    applyCoursePolicy
}
