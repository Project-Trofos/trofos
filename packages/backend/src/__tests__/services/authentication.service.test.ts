import bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { response } from 'express';
import { prismaMock } from '../../models/mock/mockPrismaClient';
import authenticationService from '../../services/authentication.service';
import { UserAuth } from '../../services/types/authentication.service.types';

describe('authentication.service tests', () => {
  test('ValidUser_ReturnsTrue', async () => {
    const prismaResponseObject : User = {
      user_id : 1,
      user_email : 'testUser@test.com',
      user_password_hash : bcrypt.hashSync('testPassword', 10),
    };
    const responseObject = {
      isValidUser : true,
      userLoginInformation : {
        user_email : 'testUser@test.com',
        user_id : 1,
      }
    } as UserAuth
    prismaMock.user.findUnique.mockResolvedValueOnce(prismaResponseObject);
    await expect(authenticationService.validateUser('testUser@test.com', 'testPassword')).resolves.toEqual(responseObject);
  });

  test('InvalidUser_NoSuchUser_ReturnsFalse', async () => {
    const responseObject = {
      isValidUser : false,
    } as UserAuth
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    await expect(authenticationService.validateUser('testUser@test.com', 'testPassword')).resolves.toEqual(responseObject);
  });

  test('InvalidUser_InvalidCredentials_ReturnsFalse', async () => {
    const prismaResponseObject : User = {
      user_id : 1,
      user_email : 'testUser@test.com',
      user_password_hash : bcrypt.hashSync('testPassword', 10),
    };
    const responseObject = {
      isValidUser : false,
      userLoginInformation : {
        user_email : 'testUser@test.com',
        user_id : 1,
      }
    } as UserAuth
    prismaMock.user.findUnique.mockResolvedValueOnce(prismaResponseObject);
    await expect(authenticationService.validateUser('testUser@test.com', 'wrongTestPassword')).resolves.toEqual(responseObject);
  });

  test('InvalidUser_UserHasNoPasswordSet_ReturnsFalse', async () => {
    const prismaResponseObject : User = {
      user_id : 1,
      user_email : 'testUser@test.com',
      user_password_hash : null,
    };
    const responseObject = {
      isValidUser : false,
    } as UserAuth
    prismaMock.user.findUnique.mockResolvedValueOnce(prismaResponseObject);
    await expect(authenticationService.validateUser('testUser@test.com', 'testPassword')).resolves.toEqual(responseObject);
  });
});