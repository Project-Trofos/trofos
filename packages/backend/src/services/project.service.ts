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
  option: 'all' | 'current' | 'past' | 'future',
  pageIndex: number,
  pageSize: number,
  keyword?: string,
  sortBy?: string,
  ids?: number[],
  courseId?: number,
): Promise<{
  data: Project[]
  totalCount: number,
}> {

  // if query by courseId, return all courses. TODO - optimize in future
  if (courseId) {
    const totalCount = await prisma.project.count({ where: { course_id: courseId } });
    const data = await prisma.project.findMany({
      where: { course_id: courseId },
      include: {
        course: {
          include: {
            milestones: true,
          },
        },
        ...INCLUDE_USERS_ID_EMAIL_COURSEROLE,
      },
    });
    return { data, totalCount };
  }

  let whereClause: any = {
    AND: [
      accessibleBy(policyConstraint).Project,
    ]
  };

  if (keyword) {
    whereClause.AND.push({
      OR: [
        { pname: { contains: keyword, mode: 'insensitive' } },
        { pkey: { contains: keyword, mode: 'insensitive' } }
      ]
    });
  }

  if (ids) {
    whereClause.AND.push({
      id: { in: ids },
    });
  }

  if (option === 'current') {
    // proj not archived and course not archived and within the current year and semester / independent projects
    whereClause.AND.push({
      course: {
        OR: [
          {
            AND: [
              {
                OR: [
                  { is_archive: false },
                  { is_archive: null },
                ],
              }, {
                startYear: { lte: settings.current_year },
                endYear: { gte: settings.current_year },
                startSem: { lte: settings.current_sem },
                endSem: { gte: settings.current_sem },
              }
            ]
          }, {
            shadow_course: true
          }
        ]
      } 
    }, {
      OR: [
        { is_archive: false },
        { is_archive: null },
      ],
    });
  } else if (option === 'past') {
    // project is_archive == true OR
    // not shadow course and
    // endYear < currentYear
    // OR
    // endYear = currentYear AND endSem < currentSem
    // OR
    // is_archive
    whereClause.AND.push({
      OR: [
        { is_archive: true }, // The project itself is archived
        {
          course: {
            AND: [
              {
                OR: [
                  { endYear: { lt: settings.current_year } },
                  {
                    AND: [
                      { endYear: settings.current_year },
                      { endSem: { lt: settings.current_sem } }
                    ]
                  },
                  { is_archive: true }
                ]
              }, {
                shadow_course: false
              }
            ]
          }
        }
      ]
    });
  } else if (option === 'future') {
    // proj not archived and course not archived and:
    // currentYear < startYear
    // OR
    // currentYear = startYear AND currentSem < startSem
    whereClause.AND.push({
      course: {
        AND: [
          {
            OR: [
              { is_archive: false },
              { is_archive: null },
            ],
          }, {
            OR: [
              { startYear: { gt: settings.current_year } },
              {
                AND: [
                  { startYear: settings.current_year },
                  { startSem: { gt: settings.current_sem } }
                ]
              }
            ]
          }
        ]
      }
    }, { // project itself is not archived
      OR: [
        { is_archive: false },
        { is_archive: null },
      ],
    });
  }

  const sortByClause = sortBy === 'course' ? [
    { course: { shadow_course: 'asc' as Prisma.SortOrder } }, // Places shadow_course=false first, true last
    { course: { cname: 'asc' as Prisma.SortOrder } }, // Sorts by course name (cname) alphabetically
  ] : sortBy === 'year' ? [
    { course: { startYear: 'asc' as Prisma.SortOrder } }, // Sorts by startYear ascending
    { course: { startSem: 'asc' as Prisma.SortOrder } }, // Sorts by startSem ascending
  ]: undefined;

  const totalCount = await prisma.project.count({ where: whereClause });
  const data = await prisma.project.findMany({
    where: whereClause,
    include: {
      course: {
        include: {
          milestones: true,
        },
      },
      ...INCLUDE_USERS_ID_EMAIL_COURSEROLE,
    },
    skip: pageIndex * pageSize,
    take: pageSize,
    orderBy: sortByClause,
  });
  return { data, totalCount };
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
        owner_id: userId,
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
      include: {
        course: true,
      },
    });

    if (!projectInfo.course.shadow_course) {
      // A user can only be added if they are already part of the parent course
      await tx.usersOnRolesOnCourses.findUniqueOrThrow({
        where: {
          user_id_course_id: {
            course_id: projectInfo.course_id,
            user_id: userInfo.user_id,
          },
        },
      });
    } else {
      await tx.usersOnRolesOnCourses.create({
        data: {
          course_id: projectInfo.course_id,
          user_id: userInfo.user_id,
          role_id: STUDENT_ROLE_ID,
        },
      });
    }

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

    return userOnProjects;
  });
}

// Special addUser method that avoids shadow_course check
// This is to be called after invite has added user to course
async function addUserByInvite(projectId: number, userEmail: string): Promise<UsersOnProjects> {
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
      include: {
        course: true,
      },
    });

    // A user can only be added if they are already part of the parent course
    await tx.usersOnRolesOnCourses.findUniqueOrThrow({
      where: {
        user_id_course_id: {
          course_id: projectInfo.course_id,
          user_id: userInfo.user_id,
        },
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

    return userOnProjects;
  });
}

async function removeUser(projectId: number, userId: number): Promise<UsersOnProjects> {
  return prisma.$transaction<UsersOnProjects>(async (tx: Prisma.TransactionClient) => {
    const projectInfo = await tx.project.findFirstOrThrow({
      where: {
        id: projectId,
      },
      include: {
        course: true,
      },
    });

    // Prevent remove project owner
    if (projectInfo.owner_id == userId) {
      throw Error('Cannot remove project owner!');
    }

    const userOnProjects = await tx.usersOnProjects.delete({
      where: {
        project_id_user_id: {
          project_id: projectId,
          user_id: userId,
        },
      },
    });

    // If the project is not independent, the user remains in the parent course
    if (projectInfo.course.shadow_course) {
      await tx.usersOnRolesOnCourses.delete({
        where: {
          user_id_course_id: {
            course_id: projectInfo.course_id,
            user_id: userId,
          },
        },
      });
    }

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

async function archiveProject(id: number): Promise<Project> {
  const result = await prisma.project.update({
    where: {
      id,
    },
    data: {
      is_archive: true,
    },
  });

  return result;
}

async function unarchiveProject(id: number): Promise<Project> {
  const result = await prisma.project.update({
    where: {
      id,
    },
    data: {
      is_archive: false,
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

async function setTelegramId(projectId: number, telegramId: string): Promise<Project> {
  const result = await prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      telegramChannelLink: telegramId,
    },
  });

  return result;
}

async function getTelegramId(projectId: number) {
  const result = await prisma.project.findFirst({
    where: {
      id: projectId,
    },
    select: {
      telegramChannelLink: true,
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
  addUserByInvite,
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
  setTelegramId,
  getTelegramId,
  archiveProject,
  unarchiveProject,
};
