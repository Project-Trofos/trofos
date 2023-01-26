import { Prisma, Settings } from '@prisma/client';
import { prismaMock } from '../../models/mock/mockPrismaClient';
import settingsService from '../../services/settings.service';

describe('settings.service tests', () => {
  describe('get', () => {
    it('should return an error if no settings were found', async () => {
      const expectedError = new Error('Settings table is empty!');
      prismaMock.settings.findFirstOrThrow.mockRejectedValueOnce(expectedError);
      await expect(settingsService.get()).rejects.toThrow(expectedError);
    });

    it('should return a settings object if an entry was found', async () => {
      const settingsObject: Settings = {
        id: 1,
        current_sem: 1,
        current_year: 2022,
      };
      prismaMock.settings.findFirstOrThrow.mockResolvedValueOnce(settingsObject);
      await expect(settingsService.get()).resolves.toEqual(settingsObject);
    });
  });

  describe('update', () => {
    it('should return an error if there was a failure while deleting the old settings', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Prisma error', {
        code: 'testError',
        clientVersion: 'testVersion',
      });
      const settingsObject: Settings = {
        id: 1,
        current_sem: 1,
        current_year: 2022,
      };
      prismaMock.settings.deleteMany.mockRejectedValueOnce(prismaError);
      prismaMock.$transaction.mockRejectedValueOnce(prismaError);
      await expect(settingsService.update(settingsObject)).rejects.toEqual(prismaError);
    });

    it('should return an error if there was a failure while creating the new settings', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Prisma error', {
        code: 'testError',
        clientVersion: 'testVersion',
      });
      const settingsObject: Settings = {
        id: 1,
        current_sem: 1,
        current_year: 2022,
      };
      const prismaDeleteManyObject = { count: 1 };
      prismaMock.settings.deleteMany.mockResolvedValueOnce(prismaDeleteManyObject);
      prismaMock.settings.create.mockRejectedValueOnce(prismaError);
      prismaMock.$transaction.mockRejectedValueOnce(prismaError);
      await expect(settingsService.update(settingsObject)).rejects.toEqual(prismaError);
    });

    it('should return the updated settings if the query was successful', async () => {
      const settingsObject: Settings = {
        id: 1,
        current_sem: 1,
        current_year: 2022,
      };
      const prismaDeleteManyObject = { count: 1 };
      prismaMock.settings.deleteMany.mockResolvedValueOnce(prismaDeleteManyObject);
      prismaMock.settings.create.mockResolvedValueOnce(settingsObject);
      prismaMock.$transaction.mockResolvedValueOnce(settingsObject);
      await expect(settingsService.update(settingsObject)).resolves.toEqual(settingsObject);
    });
  });
});
