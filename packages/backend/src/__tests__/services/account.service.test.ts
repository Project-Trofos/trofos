import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import { prismaMock } from '../../models/mock/mockPrismaClient';
import accountService from '../../services/account.service';

const PRISMA_RECORD_NOT_FOUND = 'P2025';

describe('account.service tests', () => {
  describe('changePassword', () => {
    it("should successfuly change the user's password if a valid userId and old password is supplied", async () => {
      const oldHashedPassword = bcrypt.hashSync('oldUserPassword', 10);
      const mockFindUser = {
        user_email: 'testEmail@test.com',
        user_id: 1,
        user_display_name: "Test User", 
        user_password_hash: oldHashedPassword,
      };
      const hashedPassword = bcrypt.hashSync('newUserPassword', 10);
      const mockUpdateUser = {
        user_email: 'testEmail@test.com',
        user_id: 1,
        user_display_name: "Test User", 
        user_password_hash: hashedPassword,
      };
      prismaMock.user.findFirstOrThrow.mockResolvedValueOnce(mockFindUser);
      prismaMock.user.update.mockResolvedValueOnce(mockUpdateUser);
      await expect(accountService.changePassword(1, 'oldUserPassword', 'newUserPassword')).resolves.toEqual(
        mockUpdateUser,
      );
    });

    it('should throw an error if an invalid userId is supplied', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Record does not exist', {
        code: PRISMA_RECORD_NOT_FOUND,
        clientVersion: 'testVersion',
      });
      prismaMock.user.findFirstOrThrow.mockRejectedValueOnce(prismaError);
      await expect(accountService.changePassword(1, 'oldUserPassword', 'newUserPassword')).rejects.toThrow(prismaError);
    });

    it('should throw an error if the wrong old password is supplied', async () => {
      const serviceError = new Error('Your old password has been entered incorrectly. Please enter it again.');
      const oldHashedPassword = bcrypt.hashSync('oldUserPassword', 10);
      const mockFindUser = {
        user_email: 'testEmail@test.com',
        user_id: 1,
        user_display_name: "Test User",
        user_password_hash: oldHashedPassword,
      };
      prismaMock.user.findFirstOrThrow.mockResolvedValueOnce(mockFindUser);
      await expect(accountService.changePassword(1, 'oldUserPasswordWrong', 'newUserPassword')).rejects.toThrow(
        serviceError,
      );
    });
  });

  describe('changeDisplayName', () => {
    it("should successfully change the user's display name if a valid display name is supplied", async () => {
      const mockUpdateUser = {
        user_id: 1,
        user_email: "testEmail@test.com",
        user_display_name: "New Display Name",
        user_password_hash: null
      };
      prismaMock.user.update.mockResolvedValueOnce(mockUpdateUser);
      await expect(accountService.changeDisplayName(1, 'New Display Name')).resolves.toEqual(mockUpdateUser);
    })
  });
});
