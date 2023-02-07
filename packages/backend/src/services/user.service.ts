import { User, UsersOnCourses, UsersOnProjects, UsersOnRoles, UsersOnRolesOnCourses } from '@prisma/client';
import bcrypt from 'bcrypt';
import prisma from '../models/prismaClient';
import { STUDENT_ROLE_ID } from '../helpers/constants';


const USER_DISPLAY_NAME_MAX_LENGTH =  50;

// Exclude keys from user
function exclude<User, Key extends keyof User>(
  user: User,
  keys: Key[]
): Omit<User, Key> {

  const excludedUser = user;

  keys.forEach(key => delete excludedUser[key]);

  return excludedUser
}

export type Users = {
  user_email: string;
  user_id: number;
  courses: UsersOnCourses[];
  projects: UsersOnProjects[];
  basicRoles: UsersOnRoles[];
  courseRoles: UsersOnRolesOnCourses[];
};

async function get(user_id : number) : Promise<User> {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      user_id,
    },
    include: {
      projects: true,
      courses: true,
      basicRoles: true,
      courseRoles: true,
    }
  });

  return user;
}

async function getAll(): Promise<Users[]> {
  const users = await prisma.user.findMany({
    include: {
      courses: true,
      projects: true,
      basicRoles: true,
      courseRoles: true,
    },
  });

  const usersWithoutPassword = users.map(user => exclude(user, ['user_password_hash']));

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
  create,
};
