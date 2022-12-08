import express from 'express';
import { StatusCodes } from 'http-status-codes';
import getErrorMessage from './errorMessage';
import { BadRequestError } from './errorTypes';

export function getDefaultErrorRes(error: unknown, res: express.Response) {
  console.error(error);
  if (error instanceof BadRequestError) {
    return res.status(error.statusCode).json({ error: getErrorMessage(error) });
  }
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) });
}
