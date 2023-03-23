import {
  BacklogStatus,
  BacklogStatusType,
  Project,
  ProjectGitLink,
  Prisma,
  User,
  UsersOnProjects,
  Settings,
  UsersOnProjectOnSettings,
} from '@prisma/client';
import { accessibleBy } from '@casl/prisma';
import prisma from '../models/prismaClient';
import { AppAbility } from '../policies/policyTypes';
import { INCLUDE_USERS_ID_EMAIL_COURSEROLE } from './helper';
import { defaultBacklogStatus, FACULTY_ROLE_ID, STUDENT_ROLE_ID, SHADOW_COURSE_DATA } from '../helpers/constants';
import { UserSettingsType } from './types/project.service.types';

async function getAll(
  policyConstraint: AppAbility,
  settings: Settings,
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
                        lte: settings.current_year,
                      },
                      endYear: {
                        gte: settings.current_year,
                      },
                    },
                  },
                  {
                    course: {
                      startSem: {
                        lte: settings.current_sem,
                      },
                      endSem: {
                        gte: settings.current_sem,
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
  return prisma.$transaction<Project>(async (tx: Prisma.TransactionClient) => {
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
        user_id: userId,
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
  return prisma.$transaction<Project>(async (tx: Prisma.TransactionClient) => {
    const project = await tx.project.findUniqueOrThrow({
      where: {
        id,
      },
      select: {
        course: true,
      },
    });

    const deletedProject = await tx.project.delete({
      where: {
        id,
      },
    });

    if (project.course.shadow_course) {
      // Remove dangling shadow courses
      await tx.course.delete({
        where: {
          id: project.course.id,
        },
      });
    }

    return deletedProject;
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

async function addUser(projectId: number, userEmail: string): Promise<UsersOnProjects> {
  return prisma.$transaction<UsersOnProjects>(async (tx: Prisma.TransactionClient) => {
    const userInfo = await tx.user.findUniqueOrThrow({
      where: {
        user_email: userEmail,
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
        user_id: userInfo.user_id,
      },
    });

    await tx.usersOnProjectOnSettings.create({
      data: {
        project_id: projectId,
        user_id: userInfo.user_id,
      },
    });

    await tx.usersOnRolesOnCourses.create({
      data: {
        course_id: projectInfo.course_id,
        user_id: userInfo.user_id,
        role_id: STUDENT_ROLE_ID,
      },
    });

    return userOnProjects;
  });
}

async function removeUser(projectId: number, userId: number): Promise<UsersOnProjects> {
  return prisma.$transaction<UsersOnProjects>(async (tx: Prisma.TransactionClient) => {
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
        user_id_course_id: {
          course_id: projectInfo.course_id,
          user_id: userId,
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

async function getGitUrl(projectId: number): Promise<ProjectGitLink | null> {
  const result = await prisma.projectGitLink.findFirst({
    where: {
      project_id: projectId,
    },
  });

  return result;
}

async function addGitUrl(projectId: number, repoLink: string): Promise<ProjectGitLink> {
  const result = await prisma.projectGitLink.create({
    data: {
      project: {
        connect: {
          id: projectId,
        },
      },
      repo: repoLink,
    },
  });

  return result;
}

async function updateGitUrl(projectId: number, repoLink: string): Promise<ProjectGitLink> {
  const result = await prisma.projectGitLink.update({
    where: {
      project_id: projectId,
    },
    data: {
      repo: repoLink,
    },
  });

  return result;
}

async function deleteGitUrl(projectId: number): Promise<ProjectGitLink> {
  const result = await prisma.projectGitLink.delete({
    where: {
      project_id: projectId,
    },
  });

  return result;
}

async function getUserSettings(projectId: number, userId: number): Promise<UsersOnProjectOnSettings | null> {
  const result = await prisma.usersOnProjectOnSettings.findUnique({
    where: {
      project_id_user_id: {
        project_id: projectId,
        user_id: userId,
      },
    },
  });

  return result;
}

async function updateUserSettings(
  projectId: number,
  userId: number,
  updatedSettings: UserSettingsType,
): Promise<UsersOnProjectOnSettings> {
  const result = await prisma.usersOnProjectOnSettings.update({
    where: {
      project_id_user_id: {
        project_id: projectId,
        user_id: userId,
      },
    },
    data: {
      ...updatedSettings,
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
  getGitUrl,
  addGitUrl,
  updateGitUrl,
  deleteGitUrl,
  getUserSettings,
  updateUserSettings,
};
