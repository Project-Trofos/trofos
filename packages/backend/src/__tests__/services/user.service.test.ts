import { Prisma, User } from '@prisma/client';
import { prismaMock } from '../../models/mock/mockPrismaClient';
import userService from '../../services/user.service';

const PRISMA_RECORD_NOT_FOUND = 'P2025';

describe('user.service tests', () => {
  describe('getAll', () => {
    it('should throw an error if something went wrong during the operation', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Prisma error', {
        code: PRISMA_RECORD_NOT_FOUND,
        clientVersion: 'testVersion',
      });
      prismaMock.user.findMany.mockRejectedValueOnce(prismaError);
      await expect(userService.getAll()).rejects.toThrow(prismaError);
    });

    it('should return a list of users if the request was successful', async () => {
      const prismaResponseObject = [
        {
          user_email: 'testEmail@test.com',
          user_id: 1,
        },
      ] as User[];
      prismaMock.user.findMany.mockResolvedValueOnce(prismaResponseObject);
      await expect(userService.getAll()).resolves.toEqual(prismaResponseObject);
    });
  });

  describe('create', () => {
    it('should throw an error if something went wrong during the operation', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Prisma error', {
        code: PRISMA_RECORD_NOT_FOUND,
        clientVersion: 'testVersion',
      });
      prismaMock.user.create.mockRejectedValueOnce(prismaError);
      await expect(userService.create('testUser@test.com', 'testPassword')).rejects.toThrow(prismaError);
    });

    it('should return the created user if the request was successful', async () => {
      const prismaResponseObject = {
        user_email: 'testEmail@test.com',
        user_password_hash: 'testPassword',
      } as User;
      prismaMock.user.create.mockResolvedValueOnce(prismaResponseObject);
      await expect(userService.create('testUser@test.com', 'testPassword')).resolves.toEqual(prismaResponseObject);
    });
  });
});
