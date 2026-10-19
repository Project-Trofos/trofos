import express from 'express';
import { StatusCodes } from 'http-status-codes';
import getErrorMessage from './errorMessage';
import { BadRequestError, NotAuthorizedError, ConflictError } from './errorTypes';

export function getDefaultErrorRes(error: unknown, res: express.Response) {
  console.error(error);
  if (error instanceof BadRequestError || error instanceof NotAuthorizedError) {
    return res.status(error.statusCode).json({ error: getErrorMessage(error) });
  }
  if (error instanceof ConflictError) {
    return res.status(error.statusCode).json({ error: getErrorMessage(error), details: error.details });
  }
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) });
}
