import express from 'express';
import { StatusCodes } from 'http-status-codes';
import getErrorMessage from './errorMessage';
import { BadRequestError, NotAuthorizedError, ConflictError } from './errorTypes';
import { getLogger } from '@trofos-nus/common';

const logger = getLogger();

export function getDefaultErrorRes(error: unknown, res: express.Response) {
  logger.error(error, 'Request error');
  if (error instanceof BadRequestError || error instanceof NotAuthorizedError) {
    return res.status(error.statusCode).json({ error: getErrorMessage(error) });
  }
  if (error instanceof ConflictError) {
    return res.status(error.statusCode).json({ error: getErrorMessage(error), details: error.details });
  }
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) });
}
