import { User } from '@prisma/client';
import bcrypt from 'bcrypt';
import prisma from '../models/prismaClient';

async function changePassword(userId: number, oldUserPassword: string, newUserPassword: string): Promise<User> {
  const newPasswordHash = bcrypt.hashSync(newUserPassword, 10);

  // Ensures that the correct password is supplied for the user's account
  const user = await prisma.user.findFirstOrThrow({
    where: {
      user_id: userId,
    },
  });

  const isValidUser = bcrypt.compareSync(oldUserPassword, user.user_password_hash as string);

  if (!isValidUser) {
    throw new Error('Your old password has been entered incorrectly. Please enter it again.');
  }

  const updatedUser = await prisma.user.update({
    where: {
      user_id: userId,
    },
    data: {
      user_password_hash: newPasswordHash,
    },
  });

  return updatedUser;
}

export default {
  changePassword,
};
