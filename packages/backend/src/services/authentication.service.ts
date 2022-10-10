import bcrypt from 'bcrypt';
import prisma from '../models/prismaClient';
import { UserAuth } from './types/authentication.service.types';

async function validateUser(userEmail: string, userPassword: string): Promise<UserAuth> {
  let userAuth;
  const userLoginInformation = await prisma.user.findUnique({
    where: {
      user_email: userEmail,
    },
  });

  if (!userLoginInformation?.user_password_hash) {
    userAuth = {
      isValidUser: false,
    } as UserAuth;

    return userAuth;
  }

  const storedPassword = userLoginInformation.user_password_hash as string;
  const isValidUser = await bcrypt.compare(userPassword, storedPassword);

  userAuth = {
    isValidUser,
    userLoginInformation: {
      user_email: userLoginInformation.user_email,
      user_id: userLoginInformation.user_id,
    },
  } as UserAuth;

  return userAuth;
}

export default {
  validateUser,
};
