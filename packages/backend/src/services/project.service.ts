import { BacklogStatus, BacklogStatusType, Project, User, UsersOnProjects, Prisma } from '@prisma/client';
import { accessibleBy } from '@casl/prisma';
import { CURRENT_SEM, CURRENT_YEAR } from '../helpers/currentTime';
import prisma from '../models/prismaClient';
import { AppAbility } from '../policies/policyTypes';
import { INCLUDE_USERS_ID_EMAIL_COURSEROLE } from './helper';
import { defaultBacklogStatus, FACULTY_ROLE_ID, STUDENT_ROLE_ID } from '../helpers/constants';
import { SHADOW_COURSE_DATA } from '../../prisma/constants';

async function getAll(
  policyConstraint: AppAbility,
  option?: 'all' | 'current' | 'past' | 'future',
): Promise<Project[]> {
  let result;

  if (option === 'current') {
    // Same constraints as course year and sem
    // OR course id == null
    result = await prisma.project.findMany({
      where: {
        AND: [
          accessibleBy(policyConstraint).Project,
          {
            OR: [
              {
                AND: [
                  {
                    course: {
                      startYear: {
                        lte: CURRENT_YEAR,
                      },
                      endYear: {
                        gte: CURRENT_YEAR,
                      },
                    },
                  },
                  {
                    course: {
                      startSem: {
                        lte: CURRENT_SEM,
                      },
                      endSem: {
                        gte: CURRENT_SEM,
                      },
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
      include: {
        course: {
          include: {
            milestones: true,
          },
        },
        ...INCLUDE_USERS_ID_EMAIL_COURSEROLE,
      },
    });
  } else if (option === 'past') {
    // endYear < currentYear
    // OR
    // endYear = currentYear AND endSem < currentSem
    result = await prisma.project.findMany({
      where: {
        AND: [
          accessibleBy(policyConstraint).Project,
          {
            course: {
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
          },
        ],
      },
      include: {
        course: {
          include: {
            milestones: true,
          },
        },
        ...INCLUDE_USERS_ID_EMAIL_COURSEROLE,
      },
    });
  } else if (option === 'future') {
    // currentYear < startYear
    // OR
    // currentYear = startYear AND currentSem < startSem
    result = await prisma.project.findMany({
      where: {
        AND: [
          accessibleBy(policyConstraint).Project,
          {
            course: {
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
          },
        ],
      },
      include: {
        course: {
          include: {
            milestones: true,
          },
        },
        ...INCLUDE_USERS_ID_EMAIL_COURSEROLE,
      },
    });
  } else {
    result = await prisma.project.findMany({
      where: accessibleBy(policyConstraint).Project,
      include: {
        course: {
          include: {
            milestones: true,
          },
        },
        ...INCLUDE_USERS_ID_EMAIL_COURSEROLE,
      },
    });
  }

  return result;
}

async function getById(id: number): Promise<Project> {
  const result = await prisma.project.findUniqueOrThrow({
    where: {
      id,
    },
    include: {
      course: {
        include: {
          milestones: true,
        },
      },
      sprints: {
        select: {
          id: true,
          name: true,
        },
      },
      backlogStatuses: {
        select: {
          name: true,
          type: true,
          order: true,
        },
      },
      ...INCLUDE_USERS_ID_EMAIL_COURSEROLE,
    },
  });

  return result;
}

async function create(
  userId: number,
  name: string,
  key?: string,
  isPublic?: boolean,
  description?: string,
): Promise<Project> {
  return await prisma.$transaction<Project>(async (tx: Prisma.TransactionClient) => {
    // User info needs to be fetched for creating an entry on the UsersOnRolesOnCourses table
    // TODO (kishen) : Roles tables should be refactored to make use of userId instead for better performance.
    const userInfo = await tx.user.findFirstOrThrow({
      where: {
        user_id: userId,
      },
    });

    // Independent courses will be associated with a shadow course to facilitate the management of user roles.
    const shadowCourse = await tx.course.create({
      data: SHADOW_COURSE_DATA,
    });

    // Creation of independent project
    const project = await tx.project.create({
      data: {
        course_id: shadowCourse.id,
        pname: name,
        pkey: key,
        public: isPublic,
        description,
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

    // User who creates the project will have a FACULTY role.
    await tx.usersOnRolesOnCourses.create({
      data: {
        user_email: userInfo.user_email,
        course_id: shadowCourse.id,
        role_id: FACULTY_ROLE_ID,
      },
    });

    return project;
  });
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
  return await prisma.$transaction<Project>(async (tx: Prisma.TransactionClient) => {
    const project = await tx.project.delete({
      where: {
        id,
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

    return project;
  });
}

async function getUsers(policyConstraint: AppAbility, id: number): Promise<User[]> {
  const result = await prisma.usersOnProjects.findMany({
    where: {
      AND: [
        accessibleBy(policyConstraint).Project,
        {
          project_id: id,
        },
      ],
    },
    select: {
      user: true,
    },
  });

  return result.map((x) => x.user);
}

async function addUser(projectId: number, userId: number): Promise<UsersOnProjects> {
  return await prisma.$transaction<UsersOnProjects>(async (tx: Prisma.TransactionClient) => {
    // User info needs to be fetched for creating an entry on the UsersOnRolesOnCourses table
    // TODO (kishen) : Roles tables should be refactored to make use of userId instead for better performance.
    const userInfo = await tx.user.findFirstOrThrow({
      where: {
        user_id: userId,
      },
    });

    const projectInfo = await tx.project.findFirstOrThrow({
      where: {
        id: projectId,
      },
    });

    const userOnProjects = await tx.usersOnProjects.create({
      data: {
        project_id: projectId,
        user_id: userId,
      },
    });

    await tx.usersOnRolesOnCourses.create({
      data: {
        course_id: projectInfo.course_id,
        user_email: userInfo.user_email,
        role_id: STUDENT_ROLE_ID,
      },
    });

    return userOnProjects;
  });
}

async function removeUser(projectId: number, userId: number): Promise<UsersOnProjects> {
  // User info needs to be fetched for creating an entry on the UsersOnRolesOnCourses table
  // TODO (kishen) : Roles tables should be refactored to make use of userId instead for better performance.
  return await prisma.$transaction<UsersOnProjects>(async (tx: Prisma.TransactionClient) => {
    const userInfo = await tx.user.findFirstOrThrow({
      where: {
        user_id: userId,
      },
    });

    const projectInfo = await tx.project.findFirstOrThrow({
      where: {
        id: projectId,
      },
    });

    const userOnProjects = await tx.usersOnProjects.delete({
      where: {
        project_id_user_id: {
          project_id: projectId,
          user_id: userId,
        },
      },
    });

    await tx.usersOnRolesOnCourses.delete({
      where: {
        user_email_course_id: {
          course_id: projectInfo.course_id,
          user_email: userInfo.user_email,
        },
      },
    });

    return userOnProjects;
  });
}

async function createBacklogStatus(projectId: number, name: string): Promise<BacklogStatus> {
  const currentOrder = await prisma.backlogStatus.findMany({
    where: {
      project_id: projectId,
      type: BacklogStatusType.in_progress,
    },
    orderBy: [
      {
        order: 'desc',
      },
    ],
    take: 1,
  });

  const result = await prisma.backlogStatus.create({
    data: {
      project_id: projectId,
      name,
      order: (currentOrder?.[0]?.order || 0) + 1,
    },
  });

  return result;
}

async function getBacklogStatus(projectId: number): Promise<BacklogStatus[]> {
  const result = await prisma.backlogStatus.findMany({
    where: {
      project_id: projectId,
    },
  });

  return result;
}

async function updateBacklogStatus(
  projectId: number,
  currentName: string,
  updatedName: string,
): Promise<BacklogStatus> {
  const result = await prisma.backlogStatus.update({
    where: {
      project_id_name: {
        project_id: projectId,
        name: currentName,
      },
    },
    data: {
      name: updatedName,
    },
  });

  return result;
}

async function updateBacklogStatusOrder(projectId: number, updatedStatus: Omit<BacklogStatus, 'project_id'>[]) {
  const statusesToUpdate = updatedStatus.map((status) =>
    prisma.backlogStatus.update({
      where: {
        project_id_name: {
          project_id: projectId,
          name: status.name,
        },
      },
      data: {
        order: status.order,
      },
    }),
  );

  const result = await prisma.$transaction(statusesToUpdate);

  return result;
}

async function deleteBacklogStatus(projectId: number, name: string): Promise<BacklogStatus> {
  const result = await prisma.backlogStatus.delete({
    where: {
      project_id_name: {
        project_id: projectId,
        name,
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
  createBacklogStatus,
  getBacklogStatus,
  updateBacklogStatus,
  updateBacklogStatusOrder,
  deleteBacklogStatus,
};
