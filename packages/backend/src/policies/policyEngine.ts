import { UserSession } from "@prisma/client";
import express from "express";
import { PolicyOutcome } from "./policyTypes";
import coursePolicy from './course.policy'
import projectPolicy from "./project.policy";

const commandMap : { [policyName : string]: any} = {};
commandMap[coursePolicy.POLICY_NAME] = coursePolicy.applyCoursePolicy
commandMap[projectPolicy.POLICY_NAME] = projectPolicy.applyProjectPolicy

async function execute(req : express.Request, userSession : UserSession, policyName : string | null) : Promise<PolicyOutcome> {
    if (policyName === null) {
        // We don't apply any policy to the route
        return { isPolicyValid : true } as PolicyOutcome
    }
    
    return await commandMap[policyName](req, userSession);
}

export default {
    execute
}