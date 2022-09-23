import { Course, Project, User, UsersOnCourses } from '@prisma/client';
import prisma from '../models/prismaClient';


async function getAll(): Promise<Course[]> {
  const result = await prisma.course.findMany();

  return result;
}


async function getByPk(id: string, year: number, sem: number): Promise<Course> {
  const result = await prisma.course.findUniqueOrThrow({
    where: {
      id_year_sem: {
        id,
        year,
        sem,
      },
    },
  });

  return result;
}


async function create(name: string, year: number, sem: number, id?: string, isPublic?: boolean, description?: string): Promise<Course> {
  const result = await prisma.course.create({
    data: {
      id,
      year,
      sem,
      cname: name,
      public: isPublic,
      description,
    },
  });

  return result;
}


async function update(id: string, year: number, sem: number, name?: string, isPublic?: boolean, description?: string): Promise<Course> {
  const result = await prisma.course.update({
    where: {
      id_year_sem: {
        id,
        year,
        sem,
      },
    },
    data: {
      cname: name,
      public: isPublic,
      description,
    },
  });

  return result;
}


async function remove(id: string, year: number, sem: number): Promise<Course> {
  const result = await prisma.course.delete({
    where: {
      id_year_sem: {
        id,
        year,
        sem,
      },
    },
  });

  return result;
}


async function getUsers(id: string, year: number, sem: number): Promise<User[]> {
  const result = await prisma.usersOnCourses.findMany({
    where: {
      course_id: id,
      course_year: year,
      course_sem: sem,
    },
    select: {
      user: true,
    },
  });

  return result.map((x) => x.user);
}


async function addUser(courseId: string, courseYear: number, courseSem: number, userId: number): Promise<UsersOnCourses> {
  const result = await prisma.usersOnCourses.create({
    data: {
      course_id: courseId,
      course_year: courseYear,
      course_sem: courseSem,
      user_id: userId,
    },
  });

  return result;
}


async function removeUser(courseId: string, courseYear: number, courseSem: number, userId: number): Promise<UsersOnCourses> {
  const result = await prisma.usersOnCourses.delete({
    where: {
      course_id_course_year_course_sem_user_id: {
        course_id: courseId,
        course_year: courseYear,
        course_sem: courseSem,
        user_id: userId,
      },
    },
  });

  return result;
}


// Get project by any combination of id, year or sem
async function getProjects(id?: string, year?: number, sem?: number): Promise<Project[]> {
  const result = await prisma.project.findMany({
    where: {
      course_id: id,
      course_year: year,
      course_sem: sem,
    },
  });

  return result;
}


// Add project and link to course, create course if necessary
async function addProjectAndCourse(courseId: string, 
  courseYear: number, courseSem: number, courseName: string, 
  projectName: string, projectKey?: string, isCoursePublic?: boolean, 
  isProjectPublic?: boolean, projectDesc?: string): Promise<Project> {

  const result = prisma.project.create({
    data: {
      pname: projectName,
      pkey: projectKey,
      description: projectDesc,
      public: isCoursePublic,
      course: {
        connectOrCreate: {
          where: {
            id_year_sem: {
              id: courseId,
              year: courseYear,
              sem: courseSem,
            },
          },
          create: {
            id: courseId,
            year: courseYear,
            sem: courseSem,
            cname: courseName,
            public: isProjectPublic,
          },
        },
      },
    },
  });

  return result;
}


// Add project to course
async function addProject(courseId: string, courseYear: number, courseSem: number, projectId: number): Promise<Project> {
  const result = await prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      course_id: courseId,
      course_year: courseYear,
      course_sem: courseSem,
    },
  });

  return result;
}


// Remove project from course
async function removeProject(courseId: string, courseYear: number, courseSem: number, projectId: number): Promise<Project> {
  const project = await prisma.project.findFirstOrThrow({
    where: {
      id: projectId,
    },
  });

  if (project.course_id !== courseId || project.course_year !== courseYear || project.course_sem !== courseSem) {
    throw Error('Project ID does not match!');
  }

  const result = await prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      course_id: null,
      course_year: null,
      course_sem: null,
    },
  });

  return result;
}


export default {
  create, 
  getByPk,
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
