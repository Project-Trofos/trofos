import { mockDeep, mockReset } from 'jest-mock-extended';
import bcrypt from 'bcrypt';
import { PrismaClient, User } from '@prisma/client';
import authenticationService from '../../services/authentication.service';

const prismaMock = mockDeep<PrismaClient>();

beforeEach(() => {
  mockReset(prismaMock);
});

describe('authentication.service tests', () => {
  test('ValidUser_ReturnsTrue', async () => {
    const prismaResponseObject : User = {
      user_id : 1,
      user_email : 'testUser@test.com',
      user_password_hash : bcrypt.hashSync('testPassword', 10),
    };
    prismaMock.user.findUnique.mockResolvedValueOnce(prismaResponseObject);
    await expect(authenticationService.validateUser('testUser@test.com', 'testPassword', prismaMock)).resolves.toEqual(true);
  });

  test('InvalidUser_NoSuchUser_ReturnsFalse', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    await expect(authenticationService.validateUser('testUser@test.com', 'testPassword', prismaMock)).resolves.toEqual(false);
  });

  test('InvalidUser_InvalidCredentials_ReturnsFalse', async () => {
    const prismaResponseObject : User = {
      user_id : 1,
      user_email : 'testUser@test.com',
      user_password_hash : bcrypt.hashSync('testPassword', 10),
    };
    prismaMock.user.findUnique.mockResolvedValueOnce(prismaResponseObject);
    await expect(authenticationService.validateUser('testUser@test.com', 'wrongTestPassword', prismaMock)).resolves.toEqual(false);
  });

  test('InvalidUser_UserHasNoPasswordSet_ReturnsFalse', async () => {
    const prismaResponseObject : User = {
      user_id : 1,
      user_email : 'testUser@test.com',
      user_password_hash : null,
    };
    prismaMock.user.findUnique.mockResolvedValueOnce(prismaResponseObject);
    await expect(authenticationService.validateUser('testUser@test.com', 'testPassword', prismaMock)).resolves.toEqual(false);
  });
});