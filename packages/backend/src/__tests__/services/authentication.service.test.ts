import bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { prismaMock } from '../../models/mock/mockPrismaClient';
import authenticationService from '../../services/authentication.service';
import { UserAuth } from '../../services/types/authentication.service.types';
import { userData } from '../mocks/userData';

describe('authentication.service tests', () => {
  describe('validateUser', () => {
    it('should return true if the user is valid', async () => {
      const prismaResponseObject: User = {
        ...userData[0],
        user_password_hash: bcrypt.hashSync('testPassword', 10),
      };
      const responseObject = {
        isValidUser: true,
        userLoginInformation: {
          user_email: 'testUser@test.com',
          user_id: 1,
        },
      } as UserAuth;
      prismaMock.user.findUnique.mockResolvedValueOnce(prismaResponseObject);
      await expect(authenticationService.validateUser('testUser@test.com', 'testPassword')).resolves.toEqual(
        responseObject,
      );
    });

    it('should return false if there is no such user', async () => {
      const responseObject = {
        isValidUser: false,
      } as UserAuth;
      prismaMock.user.findUnique.mockResolvedValueOnce(null);
      await expect(authenticationService.validateUser('testUser@test.com', 'testPassword')).resolves.toEqual(
        responseObject,
      );
    });

    it('should return false if the credentials supplied are invalid', async () => {
      const prismaResponseObject: User = {
        ...userData[0],
        user_password_hash: bcrypt.hashSync('testPassword', 10),
      };
      const responseObject = {
        isValidUser: false,
        userLoginInformation: {
          user_email: 'testUser@test.com',
          user_id: 1,
        },
      } as UserAuth;
      prismaMock.user.findUnique.mockResolvedValueOnce(prismaResponseObject);
      await expect(authenticationService.validateUser('testUser@test.com', 'wrongTestPassword')).resolves.toEqual(
        responseObject,
      );
    });

    it('should return false if the user has an account but has not set a password', async () => {
      const prismaResponseObject: User = {
        ...userData[0],
        user_password_hash: null,
      };
      const responseObject = {
        isValidUser: false,
      } as UserAuth;
      prismaMock.user.findUnique.mockResolvedValueOnce(prismaResponseObject);
      await expect(authenticationService.validateUser('testUser@test.com', 'testPassword')).resolves.toEqual(
        responseObject,
      );
    });
  });
});
