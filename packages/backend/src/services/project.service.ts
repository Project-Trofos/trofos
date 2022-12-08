import { BacklogStatus, BacklogStatusType, Project, User, UsersOnProjects } from '@prisma/client';
import { accessibleBy } from '@casl/prisma';
import { CURRENT_SEM, CURRENT_YEAR } from '../helpers/currentTime';
import prisma from '../models/prismaClient';
import { AppAbility } from '../policies/policyTypes';
import INCLUDE_USERS_ID_EMAIL from './helper';
import { defaultBacklogStatus } from '../helpers/constants';

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
              {
                course_id: null,
              },
            ],
          },
        ],
      },
      include: {
        course: true,
        ...INCLUDE_USERS_ID_EMAIL,
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
        course: true,
        ...INCLUDE_USERS_ID_EMAIL,
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
        course: true,
        ...INCLUDE_USERS_ID_EMAIL,
      },
    });
  } else {
    result = await prisma.project.findMany({
      where: accessibleBy(policyConstraint).Project,
      include: {
        course: true,
        ...INCLUDE_USERS_ID_EMAIL,
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
      course: true,
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
      ...INCLUDE_USERS_ID_EMAIL,
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
  const result = await prisma.project.create({
    data: {
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
