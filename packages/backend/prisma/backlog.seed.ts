/* eslint-disable import/prefer-default-export */
import { Backlog, BacklogPriority, BacklogType, PrismaClient } from '@prisma/client';
import {
  BACKLOG_1_ID,
  BACKLOG_2_ID,
  BACKLOG_3_ID,
  BACKLOG_4_ID,
  BACKLOG_5_ID,
  BACKLOG_PROJECT_ID,
  BACKLOG_USER_1_ID,
  BACKLOG_USER_2_ID,
  SPRINT_1_ID,
} from './constants';

type BacklogDataType = {
  backlog_id: number;
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
        connect: {
          id: number;
        };
      }
    | undefined;
  summary: string;
  type: BacklogType;
  backlogStatus: {
    connect: {
      project_id_name: {
        project_id: number;
        name: string;
      };
    };
  };
  project: {
    connect: {
      id: number,
    }
  }
};

export const backlogsToAdd: BacklogDataType[] = [
  {
    backlog_id: BACKLOG_1_ID,
    summary: 'Test Story Backlog 1',
    type: BacklogType.story,
    sprint: {
      connect: {
        id: SPRINT_1_ID,
      },
    },
    priority: BacklogPriority.very_high,
    reporter: {
      connect: {
        project_id_user_id: {
          user_id: BACKLOG_USER_1_ID,
          project_id: BACKLOG_PROJECT_ID,
        },
      },
    },
    assignee: {
      connect: {
        project_id_user_id: {
          user_id: BACKLOG_USER_2_ID,
          project_id: BACKLOG_PROJECT_ID,
        },
      },
    },
    points: 2,
    description: 'Test desc',
    backlogStatus: {
      connect: {
        project_id_name: {
          project_id: BACKLOG_PROJECT_ID,
          name: 'To do',
        },
      },
    },
    project: {
      connect : {
        id: BACKLOG_PROJECT_ID
      }
    }
  },
  {
    backlog_id: BACKLOG_2_ID,
    summary: 'Test Story Backlog 2',
    type: BacklogType.story,
    sprint: {
      connect: {
        id: SPRINT_1_ID,
      },
    },
    priority: BacklogPriority.high,
    reporter: {
      connect: {
        project_id_user_id: {
          user_id: BACKLOG_USER_1_ID,
          project_id: BACKLOG_PROJECT_ID,
        },
      },
    },
    assignee: {
      connect: {
        project_id_user_id: {
          user_id: BACKLOG_USER_2_ID,
          project_id: BACKLOG_PROJECT_ID,
        },
      },
    },
    points: 2,
    description: 'Test desc 2',
    backlogStatus: {
      connect: {
        project_id_name: {
          project_id: BACKLOG_PROJECT_ID,
          name: 'To do',
        },
      },
    },
    project : {
      connect : {
        id: BACKLOG_PROJECT_ID
      }
    }
  },
  {
    backlog_id: BACKLOG_3_ID,
    summary: 'Test Task Backlog 1',
    type: BacklogType.task,
    sprint: {
      connect: {
        id: SPRINT_1_ID,
      },
    },
    priority: BacklogPriority.medium,
    reporter: {
      connect: {
        project_id_user_id: {
          user_id: BACKLOG_USER_1_ID,
          project_id: BACKLOG_PROJECT_ID,
        },
      },
    },
    assignee: {
      connect: {
        project_id_user_id: {
          user_id: BACKLOG_USER_1_ID,
          project_id: BACKLOG_PROJECT_ID,
        },
      },
    },
    points: 1,
    description: 'Test desc 3',
    backlogStatus: {
      connect: {
        project_id_name: {
          project_id: BACKLOG_PROJECT_ID,
          name: 'To do',
        },
      },
    },
    project : {
      connect: {
        id: BACKLOG_PROJECT_ID
      }
    }
  },
  {
    backlog_id: BACKLOG_4_ID,
    summary: 'Test Bug Backlog 1',
    type: BacklogType.bug,
    sprint: {
      connect: {
        id: SPRINT_1_ID,
      },
    },
    priority: BacklogPriority.low,
    reporter: {
      connect: {
        project_id_user_id: {
          user_id: BACKLOG_USER_1_ID,
          project_id: BACKLOG_PROJECT_ID,
        },
      },
    },
    assignee: {
      connect: {
        project_id_user_id: {
          user_id: BACKLOG_USER_2_ID,
          project_id: BACKLOG_PROJECT_ID,
        },
      },
    },
    points: 3,
    description: 'Test desc 4',
    backlogStatus: {
      connect: {
        project_id_name: {
          project_id: BACKLOG_PROJECT_ID,
          name: 'To do',
        },
      },
    },
    project: {
      connect: {
        id: BACKLOG_PROJECT_ID
      }
    }
  },
  {
    backlog_id: BACKLOG_5_ID,
    summary: 'Test Bug Backlog 2',
    type: BacklogType.bug,
    sprint: {
      connect: {
        id: SPRINT_1_ID,
      },
    },
    priority: BacklogPriority.very_low,
    reporter: {
      connect: {
        project_id_user_id: {
          user_id: BACKLOG_USER_1_ID,
          project_id: BACKLOG_PROJECT_ID,
        },
      },
    },
    assignee: {
      connect: {
        project_id_user_id: {
          user_id: BACKLOG_USER_1_ID,
          project_id: BACKLOG_PROJECT_ID,
        },
      },
    },
    points: 2,
    description: 'Test desc 5',
    backlogStatus: {
      connect: {
        project_id_name: {
          project_id: BACKLOG_PROJECT_ID,
          name: 'To do',
        },
      },
    },
    project: {
      connect: {
        id: BACKLOG_PROJECT_ID
      }
    }
  },
];

async function createBacklogTableSeed(prisma: PrismaClient) {
  await Promise.all(
    backlogsToAdd.map(async (backlogToAdd) => {
      const backlog: Backlog = await prisma.backlog.create({
        data: backlogToAdd,
      });
      console.log('created backlog table seed %s', backlog);
    }),
  );
}

export { createBacklogTableSeed };
