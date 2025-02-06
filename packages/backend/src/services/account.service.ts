import { User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import prisma from '../models/prismaClient';
import { STUDENT_ROLE_ID } from '../helpers/constants';
import { UpdateUserData } from '../helpers/types/user.service.types';

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

async function updateUser(userId: number, updateData: UpdateUserData): Promise<User> {
  const updatedUser = await prisma.user.update({
    where: {
      user_id: userId,
    },
    data: updateData,
  });

  return updatedUser;
}

// User registration
async function register(userEmail: string, userPassword: string, userDisplayName: string): Promise<User> {
  const passwordHash = bcrypt.hashSync(userPassword, 10);
  const user = await prisma.user.create({
    data: {
      user_email: userEmail,
      user_display_name: userDisplayName,
      user_password_hash: passwordHash,
      basicRoles: {
        create: [
          {
            role_id: STUDENT_ROLE_ID,
          },
        ],
      },
    },
  });

  return user;
}

export default {
  changePassword,
  updateUser,
  register,
};
