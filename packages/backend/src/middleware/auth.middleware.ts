/* eslint-disable import/prefer-default-export */
import StatusCodes from 'http-status-codes';
import express from 'express';
import { Action, UserSession } from '@prisma/client';
import sessionService from '../services/session.service';
import roleService from '../services/role.service';
import policyEngine from '../policies/policyEngine';
import { PolicyOutcome } from '../policies/policyTypes';

const TROFOS_SESSIONCOOKIE_NAME = 'trofos_sessioncookie';

// Authorises user against basic role
const hasAuth =
  (routeAction: Action | null, policyName: string | null) =>
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const sessionId = req.cookies[TROFOS_SESSIONCOOKIE_NAME];
    if (sessionId === undefined) {
      return res.status(StatusCodes.UNAUTHORIZED).send();
    }

    try {
      const sessionInformation = await sessionService.getUserSession(sessionId);
      const isValidAction = await roleService.isActionAllowed(sessionInformation.user_role_id, routeAction);

      if (!isValidAction) {
        return res.status(StatusCodes.UNAUTHORIZED).send();
      }

      const policyOutcome = await checkPolicyOutcome(req, res, sessionInformation, policyName);

      if (!policyOutcome.isPolicyValid) {
        return res.status(StatusCodes.UNAUTHORIZED).send();
      }

    } catch (e) {
      console.error(e);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
    }

    return next();
  };

// Authorises user against project role
const hasAuthForProject =
  (routeAction: Action | null, policyName: string | null) => 
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const sessionId = req.cookies[TROFOS_SESSIONCOOKIE_NAME];
      if (sessionId === undefined) {
          return res.status(StatusCodes.UNAUTHORIZED).send();
      }

      try {
          const projectId = Number(req.params.projectId);

          const sessionInformation = await sessionService.getUserSession(sessionId);
          const userActions = await roleService.getUserRoleActionsForProject(sessionInformation.user_email, projectId);

          const matchingAction = userActions.role.actions.filter((roleAction) => roleAction.action === routeAction);

          if (routeAction && matchingAction.length === 0) {
              return res.status(StatusCodes.UNAUTHORIZED).send();
          }

          const policyOutcome = await checkPolicyOutcome(req, res, sessionInformation, policyName);

          if (!policyOutcome.isPolicyValid) {
            return res.status(StatusCodes.UNAUTHORIZED).send();
          }

      } catch (e) {
          console.error(e);
          return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
      }

      return next();
  };

// Authorises user against course role
const hasAuthForCourse =
  (routeAction: Action | null, policyName: string | null) => 
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const sessionId = req.cookies[TROFOS_SESSIONCOOKIE_NAME];
      if (sessionId === undefined) {
          return res.status(StatusCodes.UNAUTHORIZED).send();
      }

      try {
          const courseId = Number(req.params.courseId);
          const sessionInformation = await sessionService.getUserSession(sessionId);
          const userActions = await roleService.getUserRoleActionsForCourse(sessionInformation.user_email, courseId);

          const matchingAction = userActions.role.actions.filter((roleAction) => roleAction.action === routeAction);

          if (routeAction && matchingAction.length === 0) {
              return res.status(StatusCodes.UNAUTHORIZED).send();
          }

          const policyOutcome = await checkPolicyOutcome(req, res, sessionInformation, policyName);

          if (!policyOutcome.isPolicyValid) {
            return res.status(StatusCodes.UNAUTHORIZED).send();
          }

      } catch (e) {
          console.error(e);
          return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
      }

      return next();
  };

const checkPolicyOutcome = async (req: express.Request, res: express.Response, sessionInformation: UserSession, policyName: string | null) : Promise<PolicyOutcome> => {
  const policyOutcome = await policyEngine.execute(req, sessionInformation, policyName);

  if (policyOutcome.isPolicyValid) {
    // https://stackoverflow.com/questions/18875292/passing-variables-to-the-next-middleware-using-next-in-express-js
    res.locals.policyConstraint = policyOutcome.policyConstraint;
    res.locals.userSession = sessionInformation;
  }

  return policyOutcome;

}

export { hasAuth, hasAuthForProject, hasAuthForCourse };
