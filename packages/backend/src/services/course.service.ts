import { Course, Project, User, UsersOnCourses } from '@prisma/client';
import prisma from '../models/prismaClient';


async function getAll(): Promise<Course[]> {
  const result = await prisma.course.findMany();

  return result;
}


async function getById(id: string): Promise<Course> {
  const result = await prisma.course.findUniqueOrThrow({
    where: {
      id,
    },
  });

  return result;
}


async function create(name: string, isPublic?: boolean, description?: string, id?: string): Promise<Course> {
  const result = await prisma.course.create({
    data: {
      id,
      cname: name,
      public: isPublic,
      description,
    },
  });

  return result;
}


async function update(id: string, name?: string, isPublic?: boolean, description?: string): Promise<Course> {
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


async function remove(id: string): Promise<Course> {
  const result = await prisma.course.delete({
    where: {
      id,
    },
  });

  return result;
}


async function getUsers(id: string): Promise<User[]> {
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


async function addUser(courseId: string, userId: number): Promise<UsersOnCourses> {
  const result = await prisma.usersOnCourses.create({
    data: {
      course_id: courseId,
      user_id: userId,
    },
  });

  return result;
}


async function removeUser(courseId: string, userId: number): Promise<UsersOnCourses> {
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


async function getProjects(id: string): Promise<Project[]> {
  const result = await prisma.project.findMany({
    where: {
      course_id: id,
    },
  });

  return result;
}


// Add project and link to course, create course if necessary
async function addProjectAndCourse(courseId: string, courseName: string, projectName: string, projectKey?: string, projectIsPublic?: boolean, projectDesc?: string): Promise<Project> {

  const result = prisma.project.create({
    data: {
      pname: projectName,
      pkey: projectKey,
      description: projectDesc,
      course: {
        connectOrCreate: {
          where: {
            id: courseId,
          },
          create: {
            id: courseId,
            cname: courseName,
          },
        },
      },
    },
  });

  return result;
}


// Add project to course
async function addProject(courseId: string, projectId: number): Promise<Project> {
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
async function removeProject(courseId: string, projectId: number): Promise<Project> {
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
  addProjectAndCourse,
};
