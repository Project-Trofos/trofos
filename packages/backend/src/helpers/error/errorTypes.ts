/* eslint-disable import/prefer-default-export */
import { StatusCodes } from 'http-status-codes';

export class BadRequestError extends Error {
  statusCode: number;

  public constructor(msg: string) {
    super(msg);
    this.statusCode = StatusCodes.BAD_REQUEST;
  }
}

export class NotAuthorizedError extends Error {
  statusCode: number;

  public constructor(msg = "Not Authorized") {
    super(msg);
    this.statusCode = StatusCodes.UNAUTHORIZED
  }
}
