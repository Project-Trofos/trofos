import type { RequestHandler } from 'express';
import { randomUUID } from 'node:crypto';
import pinoHttp from 'pino-http';
import { getLogger } from '../logger/loggerProvider';

function requestLogger(): RequestHandler {
  const logger = getLogger();

  return pinoHttp({
    logger,
    customProps: function (req) {
      return {
        request_method: req.method,
        request_url: req.originalUrl || req.url,
      };
    },
    customSuccessObject: function (req, res, val) {
      return {
        ...val,
        response_status_code: res.statusCode,
      };
    },
    customErrorObject: function (req, res, err, val) {
      return {
        ...val,
        response_status_code: res.statusCode,
      };
    },
    genReqId: function (req, res) {
      const existingID = req.id ?? req.headers['x-request-id'];
      if (existingID) return existingID;

      const id = randomUUID();
      res.setHeader('X-Request-Id', id);
      return id;
    },
    customLogLevel: function (req, res, err) {
      if (res.statusCode >= 500 || err) {
        return 'error';
      } else if (res.statusCode >= 400) {
        return 'warn';
      } else if (res.statusCode >= 300) {
        if (res.statusCode === 304) return 'debug'; // caching
        return 'info';
      } else if (res.statusCode >= 200) {
        return 'info';
      }
      return 'debug';
    },
  });
}

export default requestLogger;
