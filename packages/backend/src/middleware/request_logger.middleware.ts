import type { RequestHandler } from 'express';
import pinoHttp from 'pino-http';
import { getLogger } from '../logger/logger';

function requestLogger(): RequestHandler {
  const logger = getLogger();

  return pinoHttp({
    logger,
    customProps: function (req) {
      return {
        request_method: req.method,
        request_url: req.path,
      };
    },
    customLogLevel: function (req, res, err) {
      if (res.statusCode >= 400 && res.statusCode < 500) {
        return 'warn';
      } else if (res.statusCode >= 500 || err) {
        return 'error';
      } else if (res.statusCode >= 300 && res.statusCode < 400) {
        return 'silent';
      }
      return 'debug';
    },
  });
}

export default requestLogger;
