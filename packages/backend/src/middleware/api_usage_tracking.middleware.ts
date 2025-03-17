import express from 'express';
import prisma from '../models/prismaClient';
import sessionService from '../services/session.service';
import { ApiMethodType } from '@prisma/client';
import StatusCodes from 'http-status-codes';

const TROFOS_SESSIONCOOKIE_NAME = 'trofos_sessioncookie';

function parseApiMethod(method: string): ApiMethodType {
  const methodMap = {
    GET: ApiMethodType.get,
    POST: ApiMethodType.post,
    PUT: ApiMethodType.put,
    DELETE: ApiMethodType.delete,
  };

  if (!(method in methodMap)) {
    throw new Error(`Unknown API method: ${method}`);
  }

  return methodMap[method as keyof typeof methodMap];
}

async function trackApiUsage(req: express.Request, res: express.Response, next: express.NextFunction) {
  const startTime = Date.now();

  res.on('finish', async () => {
    const responseTime = Date.now() - startTime;
    const sessionId = req.cookies[TROFOS_SESSIONCOOKIE_NAME];

    if (sessionId === undefined) {
      return res.status(StatusCodes.UNAUTHORIZED).send();
    }

    try {
      const sessionInfo = await sessionService.getUserSession(sessionId);

      if (!sessionInfo.user_id) {
        console.log('No user ID found, skipping API usage tracking');
        return;
      }

      const apiPath = `${req.baseUrl}${req.route?.path || req.path}`.replace(/^\/api(\/|$)/, '/'); //remove /api prefix
      const method = parseApiMethod(req.method);

      if (!apiPath || apiPath === '/') {
        return;
      }

      if (!method || method === ApiMethodType.get) {
        return;
      }

      // Create the API usage record
      await prisma.apiUsage.create({
        data: {
          user_id: sessionInfo.user_id,
          path: apiPath,
          method: method,
          session_id: sessionId,
          request_body: req.body ? JSON.parse(JSON.stringify(req.body)) : null,
          response_code: res.statusCode,
          response_time: responseTime,
        },
      });
    } catch (error) {
      console.error('Error tracking API usage:', error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
    }
  });

  next();
}

export { trackApiUsage };
