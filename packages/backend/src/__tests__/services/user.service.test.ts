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

  const prismaResponseObject: User = {
    user_email: 'testEmail@test.com',
    user_id: 1,
    user_display_name: 'Test User',
    user_password_hash: null,
    has_completed_tour: false,
  };

  describe('get', () => {
    it('should throw an error if something went wrong during the operation', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Prisma error', {
        code: PRISMA_RECORD_NOT_FOUND,
        clientVersion: 'testVersion',
      });
      prismaMock.user.findUniqueOrThrow.mockRejectedValueOnce(prismaError);
      await expect(userService.get(1)).rejects.toThrow(prismaError);
    });

    it('should return ther user if the request was successful', async () => {
      prismaMock.user.findUniqueOrThrow.mockResolvedValueOnce(prismaResponseObject);
      await expect(userService.get(1)).resolves.toEqual(prismaResponseObject);
    });
  });

  describe('findByEmail', () => {
    it('should return null if email not found', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);

      const result = await userService.findByEmail('nonexistingemail@test.com');
      expect(result).toEqual(null);
    });

    it('should return existing email', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(prismaResponseObject);

      const result = await userService.findByEmail(prismaResponseObject.user_email);
      expect(result).toEqual(prismaResponseObject);
    });
  });

  describe('getByEmail', () => {
    it('should throw an error if something went wrong during the operation', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Prisma error', {
        code: PRISMA_RECORD_NOT_FOUND,
        clientVersion: 'testVersion',
      });
      prismaMock.user.findUniqueOrThrow.mockRejectedValueOnce(prismaError);
      await expect(userService.getByEmail(prismaResponseObject.user_email)).rejects.toThrow(prismaError);
    });

    it('should return existing email', async () => {
      prismaMock.user.findUniqueOrThrow.mockResolvedValueOnce(prismaResponseObject);

      const result = await userService.getByEmail(prismaResponseObject.user_email);
      expect(result).toEqual(prismaResponseObject);
    });
  });
});
