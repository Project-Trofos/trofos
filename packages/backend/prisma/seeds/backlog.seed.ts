/* eslint-disable import/prefer-default-export */
import {
  PrismaClient,
  User,
  Project,
  UsersOnProjects,
  Backlog,
  Sprint,
  BacklogPriority,
  BacklogType,
} from '@prisma/client';
import bcrypt from 'bcrypt';

type BacklogDataType = {
  backlog_id: number,
  points: number | null;
  description: string | null;
  assignee?:
  | {
    connect: {
      project_id_user_id: {
        user_id: number;
        project_id: number;
      };
    };
  }
  | undefined;
  priority: BacklogPriority | null;
  reporter: {
    connect: {
      project_id_user_id: {
        user_id: number;
        project_id: number;
      };
    };
  };
  sprint?:
  | {
    connect: { id: number };
  }
  | undefined;
  summary: string;
  type: BacklogType;
};

async function createUsersForBacklogSeed(prisma: PrismaClient) {
  const usersToCreate: User[] = [
    {
      user_id: 901,
      user_email: 'testBacklogUser1@test.com',
      user_password_hash: bcrypt.hashSync('testPassword', 10),
    },
    {
      user_id: 902,
      user_email: 'testBacklogUser2@test.com',
      user_password_hash: bcrypt.hashSync('testPassword', 10),
    },
  ];

  await Promise.all(
    usersToCreate.map(async (userToCreate) => {
      const user: User = await prisma.user.create({
        data: userToCreate,
      });
      console.log('created user %s', user);
    }),
  );
}

async function createProjectForBacklogSeed(prisma: PrismaClient) {
  const project: Project = await prisma.project.create({
    data: {
      id: 903,
      pname: 'Backlog test project',
    },
  });
  console.log('created project %s', project);
}

async function createUsersOnProjectForBacklogSeed(prisma: PrismaClient) {
  const usersToAdd = [
    {
      user_id: 901,
      project_id: 903,
    },
    {
      user_id: 902,
      project_id: 903,
    },
  ];
  await Promise.all(
    usersToAdd.map(async (userToAdd) => {
      const userOnProject: UsersOnProjects = await prisma.usersOnProjects.create({
        data: userToAdd,
      });
      console.log('created userOnProject %s', userOnProject);
    }),
  );
}

async function createSprintForBacklogSeed(prisma: PrismaClient) {
  const sprint: Sprint = await prisma.sprint.create({
    data: {
      id: 1,
    },
  });
  console.log('created sprint %s', sprint);
}

async function createBacklogsSeed(prisma: PrismaClient) {
  const backlogsToAdd: BacklogDataType[] = [
    {
      backlog_id: 1,
      summary: 'Test Story Backlog 1',
      type: 'story',
      sprint: {
        connect: { id: 1 },
      },
      priority: 'very_high',
      reporter: {
        connect: {
          project_id_user_id: {
            user_id: 901,
            project_id: 903,
          },
        },
      },
      assignee: {
        connect: {
          project_id_user_id: {
            user_id: 902,
            project_id: 903,
          },
        },
      },
      points: 2,
      description: 'Test desc',
    },
    {
      backlog_id: 2,
      summary: 'Test Story Backlog 2',
      type: 'story',
      sprint: {
        connect: { id: 1 },
      },
      priority: 'high',
      reporter: {
        connect: {
          project_id_user_id: {
            user_id: 901,
            project_id: 903,
          },
        },
      },
      assignee: {
        connect: {
          project_id_user_id: {
            user_id: 902,
            project_id: 903,
          },
        },
      },
      points: 2,
      description: 'Test desc 2',
    },
    {
      backlog_id: 3,
      summary: 'Test Task Backlog 1',
      type: 'task',
      sprint: {
        connect: { id: 1 },
      },
      priority: 'medium',
      reporter: {
        connect: {
          project_id_user_id: {
            user_id: 901,
            project_id: 903,
          },
        },
      },
      assignee: {
        connect: {
          project_id_user_id: {
            user_id: 901,
            project_id: 903,
          },
        },
      },
      points: 1,
      description: 'Test desc 3',
    },
    {
      backlog_id: 4,
      summary: 'Test Bug Backlog 1',
      type: 'bug',
      sprint: {
        connect: { id: 1 },
      },
      priority: 'low',
      reporter: {
        connect: {
          project_id_user_id: {
            user_id: 901,
            project_id: 903,
          },
        },
      },
      assignee: {
        connect: {
          project_id_user_id: {
            user_id: 902,
            project_id: 903,
          },
        },
      },
      points: 3,
      description: 'Test desc 4',
    },
    {
      backlog_id: 5,
      summary: 'Test Bug Backlog 2',
      type: 'bug',
      sprint: {
        connect: { id: 1 },
      },
      priority: 'very_low',
      reporter: {
        connect: {
          project_id_user_id: {
            user_id: 901,
            project_id: 903,
          },
        },
      },
      assignee: {
        connect: {
          project_id_user_id: {
            user_id: 901,
            project_id: 903,
          },
        },
      },
      points: 2,
      description: 'Test desc 5',
    },
  ];

  await Promise.all(
    backlogsToAdd.map(async (backlogToAdd) => {
      const backlog: Backlog = await prisma.backlog.create({
        data: backlogToAdd,
      });
      console.log('created backlog %s', backlog);
    }),
  );

  const project: Project = await prisma.project.update({
    where: { id: 903 },
    data: {
      backlog_counter: 5,
    },
  });
  console.log('updated project %s', project);
}

async function setupBacklogSeed(prisma: PrismaClient) {
  await createUsersForBacklogSeed(prisma);
  await createProjectForBacklogSeed(prisma);
  await createUsersOnProjectForBacklogSeed(prisma);
  await createSprintForBacklogSeed(prisma);
  await createBacklogsSeed(prisma);
}

export { setupBacklogSeed };
