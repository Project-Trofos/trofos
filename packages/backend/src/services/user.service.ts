import { User, UsersOnCourses, UsersOnProjects, UsersOnRoles, UsersOnRolesOnCourses } from '@prisma/client';
import bcrypt from 'bcrypt';
import prisma from '../models/prismaClient';
import { STUDENT_ROLE_ID } from '../helpers/constants';


const USER_DISPLAY_NAME_MAX_LENGTH =  50;

export type Users = {
  user_email: string;
  user_id: number;
  courses: UsersOnCourses[];
  projects: UsersOnProjects[];
  basicRoles: UsersOnRoles[];
  courseRoles: UsersOnRolesOnCourses[];
};

async function get(user_id : number) : Promise<User> {
  return await prisma.user.findUniqueOrThrow({
    where: {
      user_id: user_id,
    },
    include: {
      projects: true,
      courses: true,
      basicRoles: true,
      courseRoles: true,
    }
  });
}

async function getAll(): Promise<Users[]> {
  const users = await prisma.user.findMany({
    select: {
      user_email: true,
      user_display_name: true,
      user_id: true,
      courses: true,
      projects: true,
      basicRoles: true,
      courseRoles: true,
    },
  });

  return users;
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
