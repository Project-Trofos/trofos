import { mockDeep, mockReset } from 'jest-mock-extended';
import { Prisma, PrismaClient, UserSession } from '@prisma/client';
import sessionService from '../../services/session.service';

const prismaMock = mockDeep<PrismaClient>();
const PRISMA_UNIQUE_CONSTRAINT_VIOLATION = 'P2002';

beforeEach(() => {
  mockReset(prismaMock);
});

describe('session.service tests', () => {
  test('NoUniqueConstraintViolation_SessionCreatedAfterOneTry', async () => {
    const prismaResponseObject : UserSession = {
      session_id : 'testSessionId',
      user_email : 'testUser@test.com',
      session_expiry : new Date('2022-08-31T15:19:39.104Z'),
    };
    prismaMock.userSession.create.mockResolvedValueOnce(prismaResponseObject);
    await sessionService.createUserSession('testUser@test.com', prismaMock);
    expect(prismaMock.userSession.create).toHaveBeenCalledTimes(1);
  });

  test('UniqueConstraintViolation_SessionCreatedAfterOneTry', async () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError('unique constraint violation', PRISMA_UNIQUE_CONSTRAINT_VIOLATION, 'testVersion');
    const prismaResponseObject : UserSession = {
      session_id : 'testSessionId',
      user_email : 'testUser@test.com',
      session_expiry : new Date('2022-08-31T15:19:39.104Z'),
    };
    prismaMock.userSession.create.mockRejectedValueOnce(prismaError);
    prismaMock.userSession.create.mockResolvedValueOnce(prismaResponseObject);
    await sessionService.createUserSession('testUser@test.com', prismaMock);
    expect(prismaMock.userSession.create).toHaveBeenCalledTimes(2);
  });

  test('NonUniqueConstraintPrismaError_SessionCreatedAfterOneTry', async () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError('unique constraint violation', 'testErrorCode', 'testVersion');
    prismaMock.userSession.create.mockRejectedValueOnce(prismaError);
    await expect(sessionService.createUserSession('testUser@test.com', prismaMock)).rejects.toThrow(prismaError);
    expect(prismaMock.userSession.create).toHaveBeenCalledTimes(1);
  });

  test('NonUniqueConstraintPrismaError_SessionCreatedAfterOneTry', async () => {
    const nonPrismaError = new Error('not a prisma error');
    prismaMock.userSession.create.mockRejectedValueOnce(nonPrismaError);
    await expect(sessionService.createUserSession('testUser@test.com', prismaMock)).rejects.toThrow(nonPrismaError);
    expect(prismaMock.userSession.create).toHaveBeenCalledTimes(1);
  });
});




