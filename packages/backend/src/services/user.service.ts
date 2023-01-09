import { User, UsersOnCourses, UsersOnProjects, UsersOnRoles } from '@prisma/client';
import bcrypt from 'bcrypt';
import prisma from '../models/prismaClient';
import { STUDENT_ROLE_ID } from '../helpers/constants';

export type Users = {
  user_email: string;
  user_id: number;
  courses: UsersOnCourses[];
  projects: UsersOnProjects[];
  basicRoles: UsersOnRoles[];
};

async function getAll(): Promise<Users[]> {
  const users = await prisma.user.findMany({
    select: {
      user_email: true,
      user_id: true,
      courses: true,
      projects: true,
      basicRoles: true,
    },
  });

  return users;
}

async function create(userEmail: string, userPassword: string): Promise<User> {
  const passwordHash = bcrypt.hashSync(userPassword, 10);
  const user = await prisma.user.create({
    data: {
      user_email: userEmail,
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
  getAll,
  create,
};
