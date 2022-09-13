import { Prisma } from '@prisma/client';
import prisma from '../models/prismaClient';
import crypto from 'crypto';

const PRISMA_UNIQUE_CONSTRAINT_VIOLATION_ERROR_CODE = 'P2002';

async function createUserSession(userEmail: string) : Promise<string> {

  let isSessionCreated = false;
  let sessionId = crypto.randomBytes(16).toString('base64');

  do {
    try {
      // eslint-disable-next-line no-await-in-loop
      await prisma.userSession.create({
        data : {
          session_id : sessionId,
          user_email : userEmail,
        },
      });
      isSessionCreated = true;
    } catch (e) {
      // If the session creation did not fail because of unique constraint, throw an error
      if (!(e instanceof Prisma.PrismaClientKnownRequestError)) {
        throw e;
      }
      const prismaError = e as Prisma.PrismaClientKnownRequestError;
      if (prismaError.code !== PRISMA_UNIQUE_CONSTRAINT_VIOLATION_ERROR_CODE) {
        throw e;
      }
      // If the error was due to a unique constraint violation, we generate the sessionId again.
      sessionId = crypto.randomBytes(16).toString('base64');
    }
  } while (!isSessionCreated);

  return sessionId;
}

export default {
  createUserSession,
};