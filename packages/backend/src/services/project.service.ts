import { Project, User, UsersOnProjects, UserSession } from '@prisma/client';
import { CURRENT_SEM, CURRENT_YEAR } from '../helpers/currentTime';
import prisma from '../models/prismaClient';
import projectPolicy from '../policies/project.policy'
import { accessibleBy } from '@casl/prisma'

async function getAll(userId : number, option?: 'all' | 'current' | 'past'): Promise<Project[]> {
  let result;

  if (option === 'current') {
    // year == current_year OR year == null and sem == null
    result = await prisma.project.findMany({
      where: {
        AND : [
          accessibleBy(projectPolicy(userId)).Project,
          {
            OR: [
              {
                AND: {
                  course_year: CURRENT_YEAR,
                  course_sem: CURRENT_SEM,
                },
              },
              {
                AND: {
                  course_year: null,
                  course_sem: null,
                },
              },
            ],
          }
        ]

      },
    });
  } else if (option === 'past') {
    // year < current_year OR year == current_year && sem < current_sem
    result = await prisma.project.findMany({
      where: {
        AND : [
          accessibleBy(projectPolicy(userId)).Project,
          {
                    OR: [
          {
            AND: {
              course_year: {
                lt: CURRENT_YEAR,
              },
            },
          },
          {
            AND: {
              course_year: CURRENT_YEAR,
              course_sem: {
                lt: CURRENT_SEM,
              },
            },
          },
        ],
          }
        ]

      },
    });
  } else {
    result = await prisma.project.findMany({
      where : accessibleBy(projectPolicy(userId)).Project,
    });
  }

  return result;
}

async function getById(id: number): Promise<Project> {

  const result = await prisma.project.findUniqueOrThrow({
    where: {
      id,
    },
  });

  return result;
}

async function create(name: string, key?: string, isPublic?: boolean, description?: string): Promise<Project> {

  const result = await prisma.project.create({
    data: {
      pname: name,
      pkey: key,
      public: isPublic,
      description,
    },
  });

  return result;
}

async function update(id: number, name?: string, isPublic?: boolean, description?: string): Promise<Project> {

  const result = await prisma.project.update({
    where: {
      id
    },
    data: {
      pname: name,
      public: isPublic,
      description,
    },
  });

  return result;
}

async function remove(id: number): Promise<Project> {

  const result = await prisma.project.delete({
    where: {
      id,
    },
  });

  return result;
}

async function getUsers(userId : number, id: number): Promise<User[]> {
  const result = await prisma.usersOnProjects.findMany({
    where: {
      AND : [
        accessibleBy(projectPolicy(userId)).Project,
        {
          project_id: id
        },
      ]

    },
    select: {
      user: true,
    },
  });

  return result.map((x) => x.user);
}

async function addUser(projectId: number, userId: number): Promise<UsersOnProjects> {

  const result = await prisma.usersOnProjects.create({
    data: {
      project_id: projectId,
      user_id: userId,
    },
  });

  return result;
}

async function removeUser(projectId: number, userId: number): Promise<UsersOnProjects> {
  
  const result = await prisma.usersOnProjects.delete({
    where: {
      project_id_user_id: {
        project_id: projectId,
        user_id: userId,
      },
    },
  });

  return result;
}

export default {
  create,
  getAll,
  getById,
  update,
  remove,
  getUsers,
  addUser,
  removeUser,
};
