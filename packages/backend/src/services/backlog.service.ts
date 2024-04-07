import { Backlog, BacklogStatusType, HistoryType, Prisma, Epic } from '@prisma/client';
import { accessibleBy } from '@casl/prisma';
import prisma from '../models/prismaClient';
import { BacklogFields } from '../helpers/types/backlog.service.types';
import { AppAbility } from '../policies/policyTypes';

async function newBacklog(backlogFields: BacklogFields): Promise<Backlog> {
  const { summary, type, sprintId, priority, reporterId, assigneeId, points, description, projectId, epicId } =
    backlogFields;

  return prisma.$transaction<Backlog>(async (tx: Prisma.TransactionClient) => {
    const backlogCounter = await tx.project.findUniqueOrThrow({
      where: { id: projectId },
      select: { backlog_counter: true },
    });

    const defaultBacklogStatus = await tx.backlogStatus.findFirst({
      where: {
        project_id: projectId,
        type: BacklogStatusType.todo,
        order: 1,
      },
      select: {
        name: true,
      },
    });

    const createdBacklog = await tx.backlog.create({
      data: {
        backlog_id: backlogCounter.backlog_counter + 1,
        summary,
        type,
        ...(sprintId && {
          sprint: {
            connect: { id: sprintId },
          },
        }),
        priority: priority || null,
        reporter: {
          connect: {
            project_id_user_id: {
              user_id: reporterId,
              project_id: projectId,
            },
          },
        },
        ...(assigneeId && {
          assignee: {
            connect: {
              project_id_user_id: {
                user_id: assigneeId,
                project_id: projectId,
              },
            },
          },
        }),
        points: points || null,
        description: description || null,
        backlogStatus: {
          connect: {
            project_id_name: {
              project_id: projectId,
              name: defaultBacklogStatus?.name || 'To do',
            },
          },
        },
        project: {
          connect: {
            id: projectId,
          },
        },
        ...(epicId && {
          epic: {
            connect: {
              epic_id: epicId,
            },
          },
        }),
      },
    });

    await tx.project.update({
      where: { id: projectId },
      data: {
        backlog_counter: {
          increment: 1,
        },
      },
    });

    // Create backlog history for this create operation
    await tx.backlogHistory.create({
      data: {
        history_type: HistoryType.create,
        reporter_id: reporterId,
        backlog_id: backlogCounter.backlog_counter + 1,
        type,
        ...(sprintId && {
          sprint: {
            connect: { id: sprintId },
          },
        }),
        priority: priority || null,
        assignee_id: assigneeId,
        points: points || null,
        backlogStatus: {
          connect: {
            project_id_name: {
              project_id: projectId,
              name: defaultBacklogStatus?.name || 'To do',
            },
          },
        },
        project: {
          connect: {
            id: projectId,
          },
        },
      },
    });

    return createdBacklog;
  });
}

async function listBacklogsByProjectId(projectId: number): Promise<Backlog[]> {
  const backlogs = await prisma.backlog.findMany({
    where: {
      project_id: projectId,
    },
  });

  return backlogs;
}

/**
 * List all backlogs that a user can see.
 * A user can see a backlog only if he can access the project that the backlog belongs to.
 */
async function listBacklogs(policyConstraint: AppAbility): Promise<Backlog[]> {
  const backlogs = await prisma.backlog.findMany({
    where: {
      project: {
        AND: [accessibleBy(policyConstraint).Project],
      },
    },
  });

  return backlogs;
}

async function listUnassignedBacklogs(projectId: number): Promise<Backlog[]> {
  const backlogs = await prisma.backlog.findMany({
    where: {
      project_id: projectId,
      sprint_id: null,
    },
    include: {
      epic: {
        select: {
          epic_id: true,
          project_id: true,
          name: true,
          description: true,
        },
      },
    },
  });

  return backlogs;
}

async function getBacklog(projectId: number, backlogId: number): Promise<Backlog | null> {
  const backlog = await prisma.backlog.findUnique({
    where: {
      project_id_backlog_id: {
        project_id: projectId,
        backlog_id: backlogId,
      },
    },
    include: {
      epic: {
        select: {
          epic_id: true,
          project_id: true,
          name: true,
          description: true,
        },
      },
    },
  });

  return backlog;
}

async function updateBacklog(backlogToUpdate: {
  projectId: number;
  backlogId: number;
  fieldToUpdate: Partial<BacklogFields>;
}): Promise<Backlog> {
  const { projectId, backlogId, fieldToUpdate } = backlogToUpdate;

  return prisma.$transaction<Backlog>(async (tx: Prisma.TransactionClient) => {
    const updatedBacklog = await tx.backlog.update({
      where: {
        project_id_backlog_id: {
          project_id: projectId,
          backlog_id: backlogId,
        },
      },
      data: fieldToUpdate,
    });

    // Create backlog history for this update operation
    await tx.backlogHistory.create({
      data: {
        history_type: HistoryType.update,
        reporter_id: updatedBacklog.reporter_id,
        backlog_id: updatedBacklog.backlog_id,
        type: updatedBacklog.type,
        ...(updatedBacklog.sprint_id && {
          sprint: {
            connect: { id: updatedBacklog.sprint_id },
          },
        }),
        priority: updatedBacklog.priority,
        assignee_id: updatedBacklog.assignee_id,
        points: updatedBacklog.points,
        backlogStatus: {
          connect: {
            project_id_name: {
              project_id: projectId,
              name: updatedBacklog.status,
            },
          },
        },
        project: {
          connect: {
            id: projectId,
          },
        },
      },
    });

    return updatedBacklog;
  });
}

async function deleteBacklog(projectId: number, backlogId: number): Promise<Backlog> {
  return prisma.$transaction<Backlog>(async (tx: Prisma.TransactionClient) => {
    const backlog = await tx.backlog.delete({
      where: {
        project_id_backlog_id: {
          project_id: projectId,
          backlog_id: backlogId,
        },
      },
    });

    // Create backlog history for this delete operation
    await tx.backlogHistory.create({
      data: {
        history_type: HistoryType.delete,
        reporter_id: backlog.reporter_id,
        backlog_id: backlog.backlog_id,
        type: backlog.type,
        ...(backlog.sprint_id && {
          sprint: {
            connect: { id: backlog.sprint_id },
          },
        }),
        priority: backlog.priority,
        assignee_id: backlog.assignee_id,
        points: backlog.points,
        backlogStatus: {
          connect: {
            project_id_name: {
              project_id: projectId,
              name: backlog.status,
            },
          },
        },
        project: {
          connect: {
            id: projectId,
          },
        },
      },
    });

    return backlog;
  });
}

async function createEpic(projectId: number, name: string, description?: string): Promise<Epic> {
  const epic = prisma.epic.create({
    data: {
      name,
      description: description || null,
      project: {
        connect: { id: projectId },
      },
    },
  });

  return epic;
}

async function getEpicById(epicId: number): Promise<Epic | null> {
  const epic = await prisma.epic.findUnique({
    where: {
      epic_id: epicId,
    },
  });

  return epic;
}

async function getEpicsForProject(projectId: number): Promise<Epic[]> {
  const epics = await prisma.epic.findMany({
    where: {
      project_id: projectId,
    },
  });

  return epics;
}

async function getBacklogsForEpic(epicId: number): Promise<Backlog[]> {
  const backlogs = await prisma.backlog.findMany({
    where: {
      epic_id: epicId,
    },
    include: {
      epic: {
        select: {
          epic_id: true,
          project_id: true,
          name: true,
          description: true,
        },
      },
    },
  });

  return backlogs;
}

async function addBacklogToEpic(projectId: number, epicId: number, backlogId: number): Promise<Backlog> {
  const updatedBacklog = await prisma.backlog.update({
    where: {
      project_id_backlog_id: {
        project_id: projectId,
        backlog_id: backlogId,
      },
    },
    data: {
      epic_id: epicId,
    },
  });

  return updatedBacklog;
}

async function removeBacklogFromEpic(projectId: number, epicId: number, backlogId: number): Promise<Backlog> {
  const updatedBacklog = await prisma.backlog.update({
    where: {
      project_id_backlog_id: {
        project_id: projectId,
        backlog_id: backlogId,
      },
    },
    data: {
      epic_id: null,
    },
  });

  return updatedBacklog;
}

async function deleteEpic(epicId: number): Promise<Epic> {
  const epic = await prisma.epic.delete({
    where: {
      epic_id: epicId,
    },
  });

  return epic;
}

export default {
  newBacklog,
  listBacklogsByProjectId,
  listBacklogs,
  listUnassignedBacklogs,
  getBacklog,
  updateBacklog,
  deleteBacklog,
  createEpic,
  getEpicById,
  getEpicsForProject,
  getBacklogsForEpic,
  addBacklogToEpic,
  removeBacklogFromEpic,
  deleteEpic,
};
