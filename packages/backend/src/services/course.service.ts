import { Course, Project, User, UsersOnCourses } from '@prisma/client';
import prisma from '../models/prismaClient';


async function getAll(): Promise<Course[]> {
  const result = await prisma.course.findMany();

  return result;
}


async function getById(id: number): Promise<Course> {
  const result = await prisma.course.findUniqueOrThrow({
    where: {
      id,
    },
  });

  return result;
}


async function create(name: string, isPublic?: boolean, description?: string): Promise<Course> {
  const result = await prisma.course.create({
    data: {
      cname: name,
      public: isPublic,
      description,
    },
  });

  return result;
}


async function update(id: number, name?: string, isPublic?: boolean, description?: string): Promise<Course> {
  const result = await prisma.course.update({
    where: {
      id,
    },
    data: {
      cname: name,
      public: isPublic,
      description,
    },
  });

  return result;
}


async function remove(id: number): Promise<Course> {
  const result = await prisma.course.delete({
    where: {
      id,
    },
  });

  return result;
}


async function getUsers(id: number): Promise<User[]> {
  const result = await prisma.usersOnCourses.findMany({
    where: {
      course_id: id,
    },
    select: {
      user: true,
    },
  });

  return result.map((x) => x.user);
}


async function addUser(courseId: number, userId: number): Promise<UsersOnCourses> {
  const result = await prisma.usersOnCourses.create({
    data: {
      course_id: courseId,
      user_id: userId,
    },
  });

  return result;
}


async function removeUser(courseId: number, userId: number): Promise<UsersOnCourses> {
  const result = await prisma.usersOnCourses.delete({
    where: {
      course_id_user_id: {
        course_id: courseId,
        user_id: userId,
      },
    },
  });

  return result;
}


async function getProjects(id: number): Promise<Project[]> {
  const result = await prisma.project.findMany({
    where: {
      course_id: id,
    },
  });

  return result;
}


// Add project to course
async function addProject(courseId: number, projectId: number): Promise<Project> {
  const result = await prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      course_id: courseId,
    },
  });

  return result;
}


// Remove project from course
async function removeProject(courseId: number, projectId: number): Promise<Project> {
  const project = await prisma.project.findFirstOrThrow({
    where: {
      id: projectId,
    },
  });

  if (project.course_id !== courseId) {
    throw Error('Project ID does not match!');
  }

  const result = await prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      course_id: null,
    },
  });

  return result;
}


export default {
  create, 
  getById,
  getAll,
  update,
  remove,
  getUsers,
  addUser,
  removeUser,
  getProjects,
  addProject,
  removeProject,
};
