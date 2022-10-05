import { UserSession } from ".prisma/client";
import express from "express";
import { PolicyOutcome } from "./policyTypes";
import policyCourse from './policyCourse'
import policyProject from "./policyProject";

const commandMap : { [policyName : string]: any} = {};
commandMap[policyCourse.POLICY_NAME] = policyCourse.applyCoursePolicy
commandMap[policyProject.POLICY_NAME] = policyProject.applyProjectPolicy

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