import { User } from '@prisma/client';
import bcrypt from 'bcrypt';
import prisma from '../models/prismaClient';

async function changePassword(userId: number, newUserPassword: string): Promise<User> {
  const updatedUser = await prisma.user.update({
    where: {
      user_id: userId,
    },
    data: {
      user_password_hash: bcrypt.hashSync(newUserPassword, 10),
    },
  });

  return updatedUser;
}

export default {
  changePassword,
};
