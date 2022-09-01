import { Project, User, UsersOnProjects } from '@prisma/client';
import prisma from '../models/prismaClient';


async function getAll(): Promise<Project[]> {
  const result = await prisma.project.findMany();

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
      id,
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


async function getUsers(id: number): Promise<User[]> {
  const result = await prisma.usersOnProjects.findMany({
    where: {
      project_id: id,
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
