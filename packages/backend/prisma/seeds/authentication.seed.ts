/* eslint-disable import/prefer-default-export */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

async function createUserSeed(prisma: PrismaClient) {
  const users = await prisma.user.createMany({
    data : [
      {
        user_id : 1,
        user_email : 'testUser@test.com',
        user_password_hash : bcrypt.hashSync('testPassword', 10),
      },
      {
        user_id : 2,
        user_email : 'testFaculty@test.com',
        user_password_hash : bcrypt.hashSync('testPassword', 10),
      },
    ],
  });
  
  console.log('created user %s', users);
}

export { createUserSeed };
