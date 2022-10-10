/* eslint-disable max-classes-per-file */
// Have multiple classes in a file does not seem to be an issue: https://bobbyhadz.com/blog/javascript-export-multiple-classes#:~:text=Use%20named%20exports%20to%20export,as%20necessary%20in%20a%20file.
import { StatusCodes } from 'http-status-codes';

class BadRequestError extends Error {
  statusCode: number;

  public constructor(msg: string) {
    super(msg);
    this.statusCode = StatusCodes.BAD_REQUEST;
  }
}

class NotAuthorizedError extends Error {
  statusCode: number;

  public constructor(msg = 'Not Authorized') {
    super(msg);
    this.statusCode = StatusCodes.UNAUTHORIZED;
  }
}

export { BadRequestError, NotAuthorizedError };
