import { Course, Prisma, Project, User, UsersOnRolesOnCourses, UsersOnProjects, Settings, SprintStatus } from '@prisma/client';
import { accessibleBy } from '@casl/prisma';
import prisma from '../models/prismaClient';
import { AppAbility } from '../policies/policyTypes';
import { INCLUDE_USERS_MILESTONES_ANNOUNCEMENTS } from './helper';
import { BulkCreateProjectBody } from '../controllers/requestTypes';
import { defaultBacklogStatus, FACULTY_ROLE_ID, STUDENT_ROLE_ID, SHADOW_COURSE_DATA } from '../helpers/constants';
import { assertStartAndEndIsValid } from '../helpers/error/assertions';
import { BadRequestError } from '../helpers/error';

async function getAll(
  policyConstraint: AppAbility,
  settings: Settings,
  option: 'current' | 'past' | 'all' | 'future',
  pageIndex: number,
  pageSize: number,
  keyword?: string,
  sortBy?: string,
  ids?: number[],
): Promise<{
  data: Course[],
  totalCount: number,
}> {
  let whereClause: any = {
    AND: [
      accessibleBy(policyConstraint).Course,  
      { shadow_course: false }
    ],
  };

  if (keyword) {
    whereClause.AND.push({
      OR: [
        { cname: { contains: keyword, mode: 'insensitive' } },
        { code: { contains: keyword, mode: 'insensitive' } },
      ],
    });
  }

  if (ids) {
    whereClause.AND.push({
      id: { in: ids },
    });
  }

  if (option === 'current') {
    whereClause.AND.push({
      OR: [
        { is_archive: false },
        { is_archive: null },
      ],
      startYear: { lte: settings.current_year },
      endYear: { gte: settings.current_year },
      startSem: { lte: settings.current_sem },
      endSem: { gte: settings.current_sem },
    });
  } else if (option === 'past') {
    whereClause.AND.push({
      OR: [
        { is_archive: true },
        { endYear: { lt: settings.current_year } },
        {
          AND: [
            { endYear: settings.current_year },
            { endSem: { lt: settings.current_sem } },
          ],
        },
      ],
    });
  } else if (option === 'future') {
    whereClause.AND.push({    
      OR: [
        { startYear: { gt: settings.current_year } },
        {
          AND: [
            { startYear: settings.current_year },
            { startSem: { gt: settings.current_sem } },
          ],
        },
      ],
    }, {
      OR: [
        { is_archive: false },
        { is_archive: null },
      ],
    });
  }
  const sortByClause = sortBy === 'course' ? [
    { shadow_course: 'asc' as Prisma.SortOrder },
    { cname: 'asc' as Prisma.SortOrder },
    { code : 'asc' as Prisma.SortOrder },
  ] : sortBy === 'year' ? [
    { startYear: 'desc' as Prisma.SortOrder },
    { startSem: 'desc' as Prisma.SortOrder },
  ] : undefined;

  const totalCount = await prisma.course.count({ where: whereClause });
  const data = await prisma.course.findMany({
    where: whereClause,
    include: INCLUDE_USERS_MILESTONES_ANNOUNCEMENTS,
    skip: pageIndex * pageSize,
    take: pageSize,
    orderBy: sortByClause,
  });
  return { totalCount, data };
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
          courseRoles: {
            create: {
              user_id: userId,
              role_id: FACULTY_ROLE_ID,
            },
          },
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

async function getUsers(id: number): Promise<User[]> {
  const result = await prisma.usersOnRolesOnCourses.findMany({
    where: {
      course_id: id,
    },
    select: {
      user: true,
    },
  });

  return result.map((x) => x.user);
}

async function addUser(courseId: number, userEmail: string): Promise<UsersOnRolesOnCourses> {
  return prisma.$transaction<UsersOnRolesOnCourses>(async (tx: Prisma.TransactionClient) => {
    const user = await tx.user.findUniqueOrThrow({
      where: {
        user_email: userEmail,
      },
    });

    const usersOnRolesOnCourses = await tx.usersOnRolesOnCourses.create({
      data: {
        course_id: courseId,
        user_id: user.user_id,
        role_id: STUDENT_ROLE_ID,
      },
    });

    return usersOnRolesOnCourses;
  });
}

async function removeUser(courseId: number, userId: number): Promise<UsersOnRolesOnCourses> {
  const usersOnRolesOnCourses = await prisma.usersOnRolesOnCourses.delete({
    where: {
      user_id_course_id: {
        course_id: courseId,
        user_id: userId,
      },
    },
  });

  // User is removed from all projects they are part of as well
  await prisma.usersOnProjects.deleteMany({
    where: {
      user_id: userId,
      project: {
        course_id: courseId,
      },
    },
  });

  return usersOnRolesOnCourses;
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
            courseRoles: {
              create: {
                user_id: userId,
                role_id: FACULTY_ROLE_ID, // If a new course is being created, the user must be a FACULTY to manage the course
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
      owner: {
        connect: {
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
    const project = await tx.project.findUniqueOrThrow({
      where: {
        id: projectId,
      },
    });

    const updatedProject = await tx.project.update({
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
    await tx.course.delete({
      where: {
        id: project.course_id,
      },
    });

    // Get user ids and fetch their emails.
    const userIds = updatedProject.users.map((user: UsersOnProjects) => user.user_id);

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
        user_id: user.user_id,
        course_id: courseId,
        role_id: STUDENT_ROLE_ID,
      };
    });

    await tx.usersOnRolesOnCourses.createMany({
      data: queries,
      skipDuplicates: true,
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
        user_id: user.user_id,
        course_id: course.id,
        role_id: STUDENT_ROLE_ID,
      };
    });

    await tx.usersOnRolesOnCourses.createMany({
      data: queries,
      skipDuplicates: true,
    });

    // Remove the user in usersOnRolesOnCourses for the previous course
    await tx.usersOnRolesOnCourses.deleteMany({
      where: {
        course_id: courseId,
        user_id: {
          in: userIds,
        },
      },
    });

    return result;
  });
}

// Archiving a course will archive all projects in the course as well
async function archiveCourse(id: number): Promise<Course> {
  return prisma.$transaction(async (tx) => {
    await tx.project.updateMany({
      where: {
        course_id: id,
      },
      data: {
        is_archive: true,
      },
    });

    return tx.course.update({
      where: {
        id,
      },
      data: {
        is_archive: true,
      },
    });
  });
}

// Unarchiving a course will unarchive all projects in the course as well
async function unarchiveCourse(id: number): Promise<Course> {
  return prisma.$transaction(async (tx) => {
    await tx.project.updateMany({
      where: {
        course_id: id,
      },
      data: {
        is_archive: false,
      },
    });

    return tx.course.update({
      where: {
        id,
      },
      data: {
        is_archive: false,
      },
    });
  });
}

async function getLatestSprintInsightsForCourseProjects(courseId: number): Promise<{
  pname: string;
  sprints: {
    id: number;
    status: SprintStatus;
    name: string;
    start_date: Date | null;
    end_date: Date | null;
    sprintInsights: {
      created_at: Date;
      id: number;
      category: string;
      content: string;
    }[];
  }[];
  id: number;
}[]> {
  // for each project of a course:
  //  find the latest sprint that is either completed (higher priority) or closed (no completed, most recent end_date), and join the ai insights
  //  else return empty array
  return prisma.project.findMany({
    where: {
      course_id: courseId,
    },
    select: {
      id: true,
      pname: true,
      sprints: {
        where: {
          OR: [
            { status: "completed" },
            { status: "closed" }
          ]
        },
        orderBy: [
          { status: "asc" }, // prisma orders by definition in schema - compelted then closed
          { end_date: "desc" }, // Take the most recent one
        ],
        take: 1, // Take only one sprint per project
        select: {
          id: true,
          name: true,
          status: true,
          start_date: true,
          end_date: true,
          sprintInsights: {
            select: {
              id: true,
              category: true,
              content: true,
              created_at: true,
            },
            orderBy: {
              created_at: "desc", // Ensure latest insights appear first
            },
          },
        },
      },
    },
  });
};

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
  archiveCourse,
  unarchiveCourse,
  getLatestSprintInsightsForCourseProjects,
};
