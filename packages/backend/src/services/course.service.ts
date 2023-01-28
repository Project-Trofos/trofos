import { Course, Prisma, Project, User, UsersOnCourses, Settings } from '@prisma/client';
import { accessibleBy } from '@casl/prisma';
import prisma from '../models/prismaClient';
import { AppAbility } from '../policies/policyTypes';
import { INCLUDE_USERS_MILESTONES_ANNOUNCEMENTS } from './helper';
import { BulkCreateProjectBody } from '../controllers/requestTypes';
import { defaultBacklogStatus } from '../helpers/constants';
import { assertStartAndEndIsValid } from '../helpers/error/assertions';
import { BadRequestError } from '../helpers/error';

async function getAll(
  policyConstraint: AppAbility,
  settings: Settings,
  option?: 'current' | 'past' | 'all' | 'future',
): Promise<Course[]> {
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
                AND: [
                  {
                    startYear: {
                      lte: settings.current_year,
                    },
                    endYear: {
                      gte: settings.current_year,
                    },
                  },
                ],
              },
              {
                AND: [
                  {
                    startSem: {
                      lte: settings.current_sem,
                    },
                    endSem: {
                      gte: settings.current_sem,
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
      include: {
        users: {
          select: {
            user: {
              select: {
                user_id: true,
                user_email: true,
              },
            },
          },
        },
        milestones: true,
        announcements: {
          orderBy: {
            created_at: 'desc',
          },
        },
      },
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
            OR: [
              {
                endYear: {
                  lt: settings.current_year,
                },
              },
              {
                AND: [
                  {
                    endYear: settings.current_year,
                  },
                  {
                    endSem: {
                      lt: settings.current_sem,
                    },
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
            OR: [
              {
                startYear: {
                  gt: settings.current_year,
                },
              },
              {
                AND: [
                  {
                    startYear: settings.current_year,
                  },
                  {
                    startSem: {
                      gt: settings.current_sem,
                    },
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
      where: accessibleBy(policyConstraint).Course,
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
    const result = await prisma.course.create({
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
    throw Error('This project does not belong to the course specified!');
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
