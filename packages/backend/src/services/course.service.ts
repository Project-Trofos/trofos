import { Course, Project, User, UsersOnCourses } from '@prisma/client';
import { accessibleBy } from '@casl/prisma';
import { CURRENT_YEAR, CURRENT_SEM } from '../helpers/currentTime';
import prisma from '../models/prismaClient';
import { AppAbility } from '../policies/policyTypes';
import INCLUDE_USERS_ID_EMAIL from './helper';
import { BulkCreateProjectBody } from '../controllers/requestTypes';

async function getAll(policyConstraint: AppAbility, option?: 'current' | 'past' | 'all'): Promise<Course[]> {
  let result;
  if (option === 'current') {
    result = await prisma.course.findMany({
      where: {
        AND: [
          accessibleBy(policyConstraint).Course,
          {
            year: CURRENT_YEAR,
            sem: CURRENT_SEM,
          },
        ],
      },
      include: INCLUDE_USERS_ID_EMAIL,
    });
  } else if (option === 'past') {
    // year < current_year OR year == current_year and sem < current_sem
    result = await prisma.course.findMany({
      where: {
        AND: [
          accessibleBy(policyConstraint).Course,
          {
            OR: [
              {
                AND: {
                  year: {
                    lt: CURRENT_YEAR,
                  },
                },
              },
              {
                AND: {
                  year: CURRENT_YEAR,
                  sem: {
                    lt: CURRENT_SEM,
                  },
                },
              },
            ],
          },
        ],
      },
      include: INCLUDE_USERS_ID_EMAIL,
    });
  } else {
    result = await prisma.course.findMany({
      where: accessibleBy(policyConstraint).Course,
      include: INCLUDE_USERS_ID_EMAIL,
    });
  }
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
    include: INCLUDE_USERS_ID_EMAIL,
  });

  return result;
}

async function create(
  userId: number,
  name: string,
  year: number,
  sem: number,
  id?: string,
  isPublic?: boolean,
  description?: string,
): Promise<Course> {
  const result = await prisma.course.create({
    data: {
      id,
      year,
      sem,
      cname: name,
      public: isPublic,
      description,
      users: {
        create: {
          user_id: userId,
        },
      },
    },
  });

  return result;
}

async function bulkCreate(course: Required<BulkCreateProjectBody>): Promise<Course> {
  const current = await prisma.course.findFirst({
    where: {
      id: course.courseId,
      year: Number(course.courseYear),
      sem: Number(course.courseSem),
    },
  });

  // Create projects and users
  const projects = course.projects.map((p) =>
    prisma.project.create({
      data: {
        pname: p.projectName,
        pkey: p.projectKey,
        description: p.description,
        public: p.isPublic,
        course_id: course.courseId,
        course_year: Number(course.courseYear),
        course_sem: Number(course.courseSem),
        users: {
          createMany: {
            // Add the creator in too
            data: [...p.users].map((u) => ({ user_id: Number(u.userId) })),
          },
        },
        backlogStatuses: {
          createMany: {
            data: [
              { name: 'To do', type: 'todo' },
              { name: 'In progress', type: 'in_progress' },
              { name: 'Done', type: 'done' },
            ],
          },
        },
      },
    }),
  );

  if (current) {
    // If course already exists,
    // Only need to create projects and users, then link to the course
    await prisma.$transaction(projects);
    return current;
  }

  // If course does not exist,
  // Need to create course, projects and users
  const courseNew = prisma.course.create({
    data: {
      id: course.courseId,
      year: Number(course.courseYear),
      sem: Number(course.courseSem),
      cname: course.courseName,
    },
  });

  const transaction = await prisma.$transaction([courseNew, ...projects]);

  return transaction[0];
}

async function update(
  id: string,
  year: number,
  sem: number,
  name?: string,
  isPublic?: boolean,
  description?: string,
): Promise<Course> {
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

async function getUsers(policyConstraint: AppAbility, id: string, year: number, sem: number): Promise<User[]> {
  const result = await prisma.usersOnCourses.findMany({
    where: {
      AND: [
        accessibleBy(policyConstraint).Course,
        {
          course_id: id,
          course_year: year,
          course_sem: sem,
        },
      ],
    },
    select: {
      user: true,
    },
  });

  return result.map((x) => x.user);
}

async function addUser(
  courseId: string,
  courseYear: number,
  courseSem: number,
  userId: number,
): Promise<UsersOnCourses> {
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

async function removeUser(
  courseId: string,
  courseYear: number,
  courseSem: number,
  userId: number,
): Promise<UsersOnCourses> {
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
async function getProjects(policyConstraint: AppAbility, id?: string, year?: number, sem?: number): Promise<Project[]> {
  const result = await prisma.project.findMany({
    where: {
      AND: [
        accessibleBy(policyConstraint).Project,
        {
          course_id: id,
          course_year: year,
          course_sem: sem,
        },
      ],
    },
  });

  return result;
}

// Add project and link to course, create course if necessary
async function addProjectAndCourse(
  userId: number,
  courseId: string,
  courseYear: number,
  courseSem: number,
  courseName: string,
  projectName: string,
  projectKey?: string,
  isCoursePublic?: boolean,
  isProjectPublic?: boolean,
  projectDesc?: string,
  courseDesc?: string,
): Promise<Project> {
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
            description: courseDesc,
            users: {
              create: {
                user_id: userId,
              },
            },
          },
        },
      },
      users: {
        create: {
          user_id: userId,
        },
      },
      backlogStatuses: {
        createMany: {
          data: [
            { name: 'To do', type: 'todo' },
            { name: 'In progress', type: 'in_progress' },
            { name: 'Done', type: 'done' },
          ],
        },
      },
    },
  });

  return result;
}

// Add project to course
async function addProject(
  courseId: string,
  courseYear: number,
  courseSem: number,
  projectId: number,
): Promise<Project> {
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
async function removeProject(
  courseId: string,
  courseYear: number,
  courseSem: number,
  projectId: number,
): Promise<Project> {
  const project = await prisma.project.findFirstOrThrow({
    where: {
      id: projectId,
    },
  });

  if (project.course_id !== courseId || project.course_year !== courseYear || project.course_sem !== courseSem) {
    throw Error('This project does not belong to the course specified!');
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
  bulkCreate,
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
