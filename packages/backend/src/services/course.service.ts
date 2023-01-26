import { Course, Prisma, Project, User, UsersOnCourses, UsersOnRolesOnCourses, UsersOnProjects } from '@prisma/client';
import { accessibleBy } from '@casl/prisma';
import { CURRENT_YEAR, CURRENT_SEM } from '../helpers/currentTime';
import prisma from '../models/prismaClient';
import { AppAbility } from '../policies/policyTypes';
import { INCLUDE_USERS_MILESTONES_ANNOUNCEMENTS } from './helper';
import { BulkCreateProjectBody } from '../controllers/requestTypes';
import { defaultBacklogStatus, FACULTY_ROLE_ID, STUDENT_ROLE_ID } from '../helpers/constants';
import { assertStartAndEndIsValid } from '../helpers/error/assertions';
import { BadRequestError } from '../helpers/error';
import { SHADOW_COURSE_DATA } from '../../prisma/constants';

async function getAll(policyConstraint: AppAbility, option?: 'current' | 'past' | 'all' | 'future'): Promise<Course[]> {
  let result;

  if (option === 'current') {
    // startYear <= currentYear <= endYear
    // AND
    // startSem <= currentSem <= endSem
    result = await prisma.course.findMany({
      where: {
        AND: [
          accessibleBy(policyConstraint).Course,
          {
            AND: [
              {
                shadow_course: {
                  equals: false,
                },
              },
              {
                AND: [
                  {
                    AND: [
                      {
                        startYear: {
                          lte: CURRENT_YEAR,
                        },
                        endYear: {
                          gte: CURRENT_YEAR,
                        },
                      },
                    ],
                  },
                  {
                    AND: [
                      {
                        startSem: {
                          lte: CURRENT_SEM,
                        },
                        endSem: {
                          gte: CURRENT_SEM,
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      include: INCLUDE_USERS_MILESTONES_ANNOUNCEMENTS,
    });
  } else if (option === 'past') {
    // endYear < currentYear
    // OR
    // endYear = currentYear AND endSem < currentSem
    result = await prisma.course.findMany({
      where: {
        AND: [
          accessibleBy(policyConstraint).Course,
          {
            AND: [
              {
                shadow_course: {
                  equals: false,
                },
              },
              {
                OR: [
                  {
                    endYear: {
                      lt: CURRENT_YEAR,
                    },
                  },
                  {
                    AND: [
                      {
                        endYear: CURRENT_YEAR,
                      },
                      {
                        endSem: {
                          lt: CURRENT_SEM,
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      include: INCLUDE_USERS_MILESTONES_ANNOUNCEMENTS,
    });
  } else if (option === 'future') {
    // currentYear < startYear
    // OR
    // currentYear = startYear AND currentSem < startSem
    result = await prisma.course.findMany({
      where: {
        AND: [
          accessibleBy(policyConstraint).Course,
          {
            AND: [
              {
                shadow_course: {
                  equals: false,
                },
              },
              {
                OR: [
                  {
                    startYear: {
                      gt: CURRENT_YEAR,
                    },
                  },
                  {
                    AND: [
                      {
                        startYear: CURRENT_YEAR,
                      },
                      {
                        startSem: {
                          gt: CURRENT_SEM,
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      include: INCLUDE_USERS_MILESTONES_ANNOUNCEMENTS,
    });
  } else {
    result = await prisma.course.findMany({
      where: {
        AND: [
          accessibleBy(policyConstraint).Course,
          {
            shadow_course: {
              equals: false,
            },
          },
        ],
      },
      include: INCLUDE_USERS_MILESTONES_ANNOUNCEMENTS,
    });
  }
  return result;
}

async function getById(id: number): Promise<Course> {
  const result = await prisma.course.findUniqueOrThrow({
    where: {
      id,
    },
    include: INCLUDE_USERS_MILESTONES_ANNOUNCEMENTS,
  });

  return result;
}

async function create(
  userId: number,
  name: string,
  startYear: number,
  startSem: number,
  endYear?: number,
  endSem?: number,
  code?: string,
  isPublic?: boolean,
  description?: string,
): Promise<Course> {
  assertStartAndEndIsValid(startYear, startSem, endYear ?? startYear, endSem ?? startSem);

  try {
    return await prisma.$transaction<Course>(async (tx: Prisma.TransactionClient) => {
      // User info needs to be fetched for creating an entry on the UsersOnRolesOnCourses table
      // TODO (kishen) : Roles tables should be refactored to make use of userId instead for better performance.
      const userInfo = await tx.user.findFirstOrThrow({
        where: {
          user_id: userId,
        },
      });

      const course = await tx.course.create({
        data: {
          code,
          startYear,
          startSem,
          endYear: endYear ?? startYear, // defaults to start year
          endSem: endSem ?? startSem, // defaults to start sem
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

      await tx.usersOnRolesOnCourses.create({
        data: {
          user_email: userInfo.user_email,
          course_id: course.id,
          role_id: FACULTY_ROLE_ID,
        },
      });

      return course;
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') {
        throw new BadRequestError('There is already a course with the same code, start year and start semester!');
      }
    }
    throw e;
  }
}

/**
 * Bulk create projects in a course. Throw error if course specified does not exist.
 */
async function bulkCreate(course: Required<BulkCreateProjectBody>): Promise<Course> {
  const current = await prisma.course.findFirst({
    where: {
      id: Number(course.courseId),
    },
  });

  if (!current) {
    // If course does not exist, throw error
    throw new Error('Course does not exist!');
  }

  // If course already exists,
  // Only need to create projects and users, then link to the course
  const projects = course.projects.map((p) =>
    prisma.project.create({
      data: {
        pname: p.projectName,
        pkey: p.projectKey,
        description: p.description,
        public: p.isPublic,
        course_id: current.id,
        users: {
          createMany: {
            // Add the creator in too
            data: [...p.users].map((u) => ({ user_id: Number(u.userId) })),
          },
        },
        backlogStatuses: {
          createMany: {
            data: defaultBacklogStatus,
          },
        },
      },
    }),
  );
  await prisma.$transaction(projects);

  return current;
}

async function update(
  id: number,
  code?: string,
  startYear?: number,
  startSem?: number,
  endYear?: number,
  endSem?: number,
  name?: string,
  isPublic?: boolean,
  description?: string,
): Promise<Course> {
  const current = await prisma.course.findUniqueOrThrow({
    where: {
      id,
    },
  });

  const tempStartYear = startYear ?? current.startYear;
  const tempStartSem = startSem ?? current.startSem;
  const tempEndYear = endYear ?? current.endYear;
  const tempEndSem = endSem ?? current.endSem;

  assertStartAndEndIsValid(tempStartYear, tempStartSem, tempEndYear, tempEndSem);

  try {
    const result = await prisma.course.update({
      where: {
        id,
      },
      data: {
        code,
        startYear,
        startSem,
        endYear,
        endSem,
        cname: name,
        public: isPublic,
        description,
      },
    });

    return result;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') {
        throw new BadRequestError('There is already a course with the same code, start year and start semester!');
      }
    }
    throw e;
  }
}

async function remove(id: number): Promise<Course> {
  const result = await prisma.course.delete({
    where: {
      id,
    },
  });

  return result;
}

async function getUsers(policyConstraint: AppAbility, id: number): Promise<User[]> {
  const result = await prisma.usersOnCourses.findMany({
    where: {
      AND: [
        accessibleBy(policyConstraint).Course,
        {
          id,
        },
      ],
    },
    select: {
      user: true,
    },
  });

  return result.map((x) => x.user);
}

async function addUser(courseId: number, userId: number): Promise<UsersOnCourses> {
  return prisma.$transaction<UsersOnCourses>(async (tx: Prisma.TransactionClient) => {
    // User info needs to be fetched for creating an entry on the UsersOnRolesOnCourses table
    // TODO (kishen) : Roles tables should be refactored to make use of userId instead for better performance.
    const userInfo = await tx.user.findFirstOrThrow({
      where: {
        user_id: userId,
      },
    });

    const userOnCourses = await tx.usersOnCourses.create({
      data: {
        course_id: courseId,
        user_id: userId,
      },
    });

    await tx.usersOnRolesOnCourses.create({
      data: {
        course_id: courseId,
        user_email: userInfo.user_email,
        role_id: STUDENT_ROLE_ID,
      },
    });

    return userOnCourses;
  });
}

async function removeUser(courseId: number, userId: number): Promise<UsersOnCourses> {
  return prisma.$transaction<UsersOnCourses>(async (tx: Prisma.TransactionClient) => {
    // User info needs to be fetched for creating an entry on the UsersOnRolesOnCourses table
    // TODO (kishen) : Roles tables should be refactored to make use of userId instead for better performance.
    const userInfo = await tx.user.findFirstOrThrow({
      where: {
        user_id: userId,
      },
    });

    const userOnCourses = await tx.usersOnCourses.delete({
      where: {
        course_id_user_id: {
          course_id: courseId,
          user_id: userId,
        },
      },
    });

    await tx.usersOnRolesOnCourses.delete({
      where: {
        user_email_course_id: {
          course_id: courseId,
          user_email: userInfo.user_email,
        },
      },
    });

    return userOnCourses;
  });
}

// Get project by course id
async function getProjects(policyConstraint: AppAbility, id: number): Promise<Project[]> {
  const result = await prisma.project.findMany({
    where: {
      AND: [
        accessibleBy(policyConstraint).Project,
        {
          course_id: id,
        },
      ],
    },
  });

  return result;
}

// Add project and link to course, create course if necessary
// Created course defaults to ending on the same year and semester
async function addProjectAndCourse(
  userId: number,
  courseCode: string,
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
            code_startYear_startSem: {
              code: courseCode,
              startYear: courseYear,
              startSem: courseSem,
            },
          },
          create: {
            cname: courseName,
            code: courseCode,
            startYear: courseYear,
            startSem: courseSem,
            endYear: courseYear,
            endSem: courseSem,
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
          data: defaultBacklogStatus,
        },
      },
    },
  });

  return result;
}

// Add project to course
async function addProject(courseId: number, projectId: number): Promise<Project> {
  return prisma.$transaction<Project>(async (tx: Prisma.TransactionClient) => {
    const project = await tx.project.update({
      where: {
        id: projectId,
      },
      data: {
        course_id: courseId,
      },
      include: {
        users: true,
      },
    });

    // Remove dangling shadow courses
    await tx.course.deleteMany({
      where: {
        shadow_course: true,
        projects: {
          none: {},
        },
      },
    });

    // Get user ids and fetch their emails.
    const userIds = project.users.map((user: UsersOnProjects) => user.user_id);

    const userInfo = await tx.user.findMany({
      where: {
        user_id: {
          in: userIds,
        },
      },
    });

    // For each user in usersOnProjects, we create a role for them in the new attached course
    const queries: Omit<UsersOnRolesOnCourses, 'id'>[] = userInfo.map((user: User) => {
      return {
        user_email: user.user_email,
        course_id: courseId,
        role_id: STUDENT_ROLE_ID,
      };
    });

    await tx.usersOnRolesOnCourses.createMany({
      data: queries,
    });

    return project;
  });
}

// Remove project from course
async function removeProject(courseId: number, projectId: number): Promise<Project> {
  return prisma.$transaction<Project>(async (tx: Prisma.TransactionClient) => {
    const project = await tx.project.findFirstOrThrow({
      where: {
        id: projectId,
      },
      include: {
        users: true,
      },
    });

    if (project.course_id !== courseId) {
      throw Error('This project does not belong to the course specified!');
    }

    // Create a shadow course for the newly independent project
    const course = await tx.course.create({
      data: SHADOW_COURSE_DATA,
    });

    const result = await tx.project.update({
      where: {
        id: projectId,
      },
      data: {
        course_id: course.id,
      },
    });

    // Get user ids and fetch their emails.
    const userIds = project.users.map((user: UsersOnProjects) => user.user_id);

    const userInfo = await tx.user.findMany({
      where: {
        user_id: {
          in: userIds,
        },
      },
    });

    // For each user in usersOnProjects, we create a role for them in the new independent project
    const queries: Omit<UsersOnRolesOnCourses, 'id'>[] = userInfo.map((user: User) => {
      return {
        user_email: user.user_email,
        course_id: course.id,
        role_id: STUDENT_ROLE_ID,
      };
    });

    await tx.usersOnRolesOnCourses.createMany({
      data: queries,
    });

    return result;
  });
}

export default {
  create,
  bulkCreate,
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
