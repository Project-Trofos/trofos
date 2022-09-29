import { Prisma, UserSession } from '@prisma/client';
import { prismaMock } from '../../models/mock/mockPrismaClient';
import sessionService from '../../services/session.service';

const PRISMA_UNIQUE_CONSTRAINT_VIOLATION = 'P2002';
const PRISMA_RECORD_NOT_FOUND = 'P2025';

describe('session.service.createUserSession tests', () => {
  test('NoUniqueConstraintViolation_SessionCreatedAfterOneTry', async () => {
    const prismaResponseObject : UserSession = {
      session_id : 'testSessionId',
      user_email : 'testUser@test.com',
      session_expiry : new Date('2022-08-31T15:19:39.104Z'),
      user_role_id : 1,
    };
    prismaMock.userSession.create.mockResolvedValueOnce(prismaResponseObject);
    await sessionService.createUserSession('testUser@test.com', 1);
    expect(prismaMock.userSession.create).toHaveBeenCalledTimes(1);
  });

  test('UniqueConstraintViolation_SessionCreatedAfterOneTry', async () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError('unique constraint violation', PRISMA_UNIQUE_CONSTRAINT_VIOLATION, 'testVersion');
    const prismaResponseObject : UserSession = {
      session_id : 'testSessionId',
      user_email : 'testUser@test.com',
      session_expiry : new Date('2022-08-31T15:19:39.104Z'),
      user_role_id : 1,
    };
    prismaMock.userSession.create.mockRejectedValueOnce(prismaError);
    prismaMock.userSession.create.mockResolvedValueOnce(prismaResponseObject);
    await sessionService.createUserSession('testUser@test.com', 1);
    expect(prismaMock.userSession.create).toHaveBeenCalledTimes(2);
  });

  test('NonUniqueConstraintPrismaError_SessionCreatedAfterOneTry', async () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError('unique constraint violation', 'testErrorCode', 'testVersion');
    prismaMock.userSession.create.mockRejectedValueOnce(prismaError);
    await expect(sessionService.createUserSession('testUser@test.com', 1)).rejects.toThrow(prismaError);
    expect(prismaMock.userSession.create).toHaveBeenCalledTimes(1);
  });

  test('NonUniqueConstraintPrismaError_SessionCreatedAfterOneTry', async () => {
    const nonPrismaError = new Error('not a prisma error');
    prismaMock.userSession.create.mockRejectedValueOnce(nonPrismaError);
    await expect(sessionService.createUserSession('testUser@test.com', 1)).rejects.toThrow(nonPrismaError);
    expect(prismaMock.userSession.create).toHaveBeenCalledTimes(1);
  });
});

describe('session.service.deleteUserSession tests', () => {
  test('ValidSessionId_DeletesSession', async () => {
    const prismaResponseObject : UserSession = {
      session_id : 'testSessionId',
      user_email : 'testUser@test.com',
      session_expiry : new Date('2022-08-31T15:19:39.104Z'),
      user_role_id : 1,
    };
    prismaMock.userSession.delete.mockResolvedValueOnce(prismaResponseObject);
    await expect(sessionService.deleteUserSession('testSessionId'));
    expect(prismaMock.userSession.delete).toHaveBeenCalledTimes(1);
  });

  test('InvalidSessionId_ThrowsError', async () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError('Record to delete does not exist.', PRISMA_RECORD_NOT_FOUND, 'testVersion');
    prismaMock.userSession.delete.mockRejectedValueOnce(prismaError);
    await expect(sessionService.deleteUserSession('testSessionId')).rejects.toThrow(prismaError);
    expect(prismaMock.userSession.delete).toHaveBeenCalledTimes(1);
  });
});

describe('session.service.getUserSession tests', () => {
  test('ValidSessionId_ReturnsUserInfo', async () => {
    const prismaResponseObject : UserSession = {
      session_id : 'testSessionId',
      user_email : 'testUser@test.com',
      session_expiry : new Date('2022-08-31T15:19:39.104Z'),
      user_role_id : 1,
    };
    prismaMock.userSession.findFirstOrThrow.mockResolvedValueOnce(prismaResponseObject);
    await expect(sessionService.getUserSession('testSessionId')).resolves.toEqual(prismaResponseObject);
    expect(prismaMock.userSession.findFirstOrThrow).toHaveBeenCalledTimes(1);
  });

  test('InvalidSessionId_ThrowsError', async () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError('Record to fetch does not exist.', PRISMA_RECORD_NOT_FOUND, 'testVersion');
    prismaMock.userSession.findFirstOrThrow.mockRejectedValueOnce(prismaError);
    await expect(sessionService.getUserSession('testSessionId')).rejects.toThrow(prismaError);
    expect(prismaMock.userSession.findFirstOrThrow).toHaveBeenCalledTimes(1);
  });
});




