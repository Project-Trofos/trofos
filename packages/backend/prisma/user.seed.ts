/* eslint-disable import/prefer-default-export */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import {
  USER_1_ID,
  USER_2_ID,
  USER_3_ID,
  BACKLOG_USER_1_ID,
  BACKLOG_USER_2_ID,
  USER_1_EMAIL,
  USER_2_EMAIL,
  USER_3_EMAIL,
  BACKLOG_USER_1_EMAIL,
  BACKLOG_USER_2_EMAIL,
} from './constants';

async function createUserTableSeed(prisma: PrismaClient) {
  const users = await prisma.user.createMany({
    data: [
      {
        user_id: USER_1_ID,
        user_email: USER_1_EMAIL,
        user_password_hash: bcrypt.hashSync('testPassword', 10),
      },
      {
        user_id: USER_2_ID,
        user_email: USER_2_EMAIL,
        user_password_hash: bcrypt.hashSync('testPassword', 10),
      },
      {
        user_id: USER_3_ID,
        user_email: USER_3_EMAIL,
        user_password_hash: bcrypt.hashSync('testPassword', 10),
      },
      {
        user_id: BACKLOG_USER_1_ID,
        user_email: BACKLOG_USER_1_EMAIL,
        user_password_hash: bcrypt.hashSync('testPassword', 10),
      },
      {
        user_id: BACKLOG_USER_2_ID,
        user_email: BACKLOG_USER_2_EMAIL,
        user_password_hash: bcrypt.hashSync('testPassword', 10),
      },
    ],
  });

  console.log('created users table seed %s', users);
}

export { createUserTableSeed };
