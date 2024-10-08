import { User, UsersOnProjects, UsersOnRoles, UsersOnRolesOnCourses } from '@prisma/client';
import bcrypt from 'bcryptjs';
import prisma from '../models/prismaClient';
import { STUDENT_ROLE_ID } from '../helpers/constants';
import { exclude } from '../helpers/common';

const USER_DISPLAY_NAME_MAX_LENGTH = 50;

export type Users = {
  user_email: string;
  user_id: number;
  projects: UsersOnProjects[];
  basicRoles: UsersOnRoles[];
  courses: UsersOnRolesOnCourses[];
};

async function get(user_id: number): Promise<User> {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      user_id,
    },
    include: {
      projects: true,
      basicRoles: true,
      courses: true,
    },
  });

  return user;
}

// This is used to query if an email is registered, can return null
async function findByEmail(user_email: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: {
      user_email: user_email,
    },
  });

  return user;
}

// This is used to get a user by email, will throw error if not found
async function getByEmail(user_email: string): Promise<User> {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      user_email,
    },
  });

  return user;
}

async function getAll(): Promise<Users[]> {
  const users = await prisma.user.findMany({
    include: {
      projects: true,
      basicRoles: true,
      courses: true,
    },
  });

  const usersWithoutPassword = users.map((user) => exclude(user, ['user_password_hash']));

  return usersWithoutPassword;
}

async function create(userEmail: string, userPassword: string): Promise<User> {
  const passwordHash = bcrypt.hashSync(userPassword, 10);
  const user = await prisma.user.create({
    data: {
      user_email: userEmail,
      user_display_name: userEmail.slice(0, USER_DISPLAY_NAME_MAX_LENGTH),
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
  get,
  findByEmail,
  getByEmail,
  create,
};
