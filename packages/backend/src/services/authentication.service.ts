import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';


async function validateUser(userEmail: string, userPassword: string, prisma: PrismaClient) : Promise<boolean> {
  const userLoginInformation = await prisma.user.findUnique({
    where: {
      user_email : userEmail,
    },
  });
    
  if (!userLoginInformation?.user_password_hash) {
    return false;
  }

  const storedPassword = userLoginInformation.user_password_hash as string;
  const isValidUser = await bcrypt.compare(userPassword, storedPassword);

  return isValidUser;
}


export default {
  validateUser,
};