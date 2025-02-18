import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prismaMock } from '../../models/mock/mockPrismaClient';
import accountService from '../../services/account.service';
import { userData } from '../mocks/userData';
import { UpdateUserData } from '../../helpers/types/user.service.types';

const PRISMA_RECORD_NOT_FOUND = 'P2025';

describe('account.service tests', () => {
  describe('changePassword', () => {
    it("should successfuly change the user's password if a valid userId and old password is supplied", async () => {
      const oldHashedPassword = bcrypt.hashSync('oldUserPassword', 10);
      const mockFindUser = {
        ...userData[0],
        user_password_hash: oldHashedPassword,
      };
      const hashedPassword = bcrypt.hashSync('newUserPassword', 10);
      const mockUpdateUser = {
        ...userData[0],
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
        ...userData[0],
        user_password_hash: oldHashedPassword,
      };
      prismaMock.user.findFirstOrThrow.mockResolvedValueOnce(mockFindUser);
      await expect(accountService.changePassword(1, 'oldUserPasswordWrong', 'newUserPassword')).rejects.toThrow(
        serviceError,
      );
    });
  });

  describe('updateUser', () => {
    it("should successfully update the user's data if the fields supplied are valid", async () => {
      const newDisplayName = 'New Display Name';
      const mockUpdateUser = {
        ...userData[0],
        user_display_name: newDisplayName,
        user_password_hash: null,
      };
      const updatedData: UpdateUserData = { user_display_name: newDisplayName };
      prismaMock.user.update.mockResolvedValueOnce(mockUpdateUser);
      await expect(accountService.updateUser(1, updatedData)).resolves.toEqual(mockUpdateUser);
    });
  });
});
