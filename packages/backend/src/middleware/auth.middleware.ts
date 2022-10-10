/* eslint-disable import/prefer-default-export */
import StatusCodes from 'http-status-codes';
import express from 'express';
import { Action } from '@prisma/client';
import sessionService from '../services/session.service';
import roleService from '../services/role.service';
import policyEngine from '../policies/policyEngine';

const TROFOS_SESSIONCOOKIE_NAME = 'trofos_sessioncookie';

const isAuthorizedRequest =
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

      const policyOutcome = await policyEngine.execute(req, sessionInformation, policyName);

      if (!policyOutcome.isPolicyValid) {
        return res.status(StatusCodes.UNAUTHORIZED).send();
      }

      // https://stackoverflow.com/questions/18875292/passing-variables-to-the-next-middleware-using-next-in-express-js
      res.locals.policyConstraint = policyOutcome.policyConstraint;
    } catch (e) {
      console.error(e);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
    }

    return next();
  };

export { isAuthorizedRequest };
